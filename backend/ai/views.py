from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import VenueSearch, VenueResult
from openai import OpenAI
import json
import logging
import uuid
from datetime import datetime
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger(__name__)

OPPORTUNITY_TYPES = {'job', 'internship', 'contract', 'collaboration', 'other'}


def _draft_opportunity(raw):
    """Keep model output that can be stored, and drop fields the model would invent."""
    if not isinstance(raw, dict):
        return None

    title = str(raw.get('title') or '').strip()
    organization = str(raw.get('organization') or '').strip()
    location = str(raw.get('location') or '').strip()
    if not title or not organization or not location:
        return None

    opportunity_type = str(raw.get('opportunity_type') or 'other').strip().lower()
    if opportunity_type not in OPPORTUNITY_TYPES:
        opportunity_type = 'other'

    deadline = None
    deadline_raw = raw.get('deadline')
    if isinstance(deadline_raw, str) and deadline_raw.strip():
        try:
            deadline = datetime.strptime(deadline_raw.strip()[:10], '%Y-%m-%d').date().isoformat()
        except ValueError:
            deadline = None

    return {
        'title': title[:100],
        'organization': organization[:100],
        'description': str(raw.get('description') or '').strip(),
        'location': location[:255],
        'deadline': deadline,
        'website': None,
        'opportunity_type': opportunity_type,
        'compensation': str(raw.get('compensation') or '').strip()[:100],
    }

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def discover_opportunities(request):
    # Get request data
    state = request.data.get('state', '')
    search_terms = request.data.get('search_terms', 'music events, artist opportunities')
    
    if not state:
        return Response({"error": "State is required"}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        prompt = f"""
        List up to 5 opportunities for musicians and artists in {state} related to these search terms: {search_terms}.

        Return a JSON array. Each object uses exactly these fields:
        - title
        - organization
        - description
        - location: a city in {state}, or the state name
        - deadline: null
        - opportunity_type: one of job, internship, contract, collaboration, other
        - compensation: a short note, or an empty string

        Do not include websites, phone numbers, or email addresses.
        """

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You return opportunity ideas as a JSON array.",
                },
                {"role": "user", "content": prompt},
            ],
            max_completion_tokens=settings.OPENAI_MAX_COMPLETION_TOKENS,
        )
        
        # Process the response - updated for OpenAI 1.0+
        content = response.choices[0].message.content
        
        # Extract JSON data
        # Find the first opening bracket and the last closing bracket
        start_idx = content.find('[')
        end_idx = content.rfind(']') + 1
        
        if start_idx == -1 or end_idx == 0:
            # If no JSON array found, return error
            return Response({"error": "Failed to generate opportunity data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        json_str = content[start_idx:end_idx]
        drafted = json.loads(json_str)
        if not isinstance(drafted, list):
            return Response(
                {"error": "Failed to generate opportunity data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        opportunities = [item for item in (_draft_opportunity(row) for row in drafted) if item]
        if not opportunities:
            return Response(
                {"error": "No usable opportunity drafts were returned"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        
        # Create a search record
        search_id = str(uuid.uuid4())
        search = VenueSearch.objects.create(
            id=search_id,
            user=request.user,
            state=state,
            city="",  # No city for opportunities search
            radius=0,  # No radius for opportunities search
            raw_response=content,
            search_type="opportunity",
            search_terms=search_terms
        )
        
        # Create opportunity results
        for i, opportunity_data in enumerate(opportunities):
            VenueResult.objects.create(
                search=search,
                index=i,
                data=opportunity_data,
                result_type="opportunity"
            )
        
        # Return the opportunities and search ID
        return Response({
            "id": search_id,
            "results": opportunities,
        })

    except Exception:
        logger.exception("Error in discover_opportunities")
        return Response(
            {"error": "Failed to draft opportunities"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_opportunities(request, search_id):
    try:
        # Get request data
        opportunity_indices = request.data.get('opportunity_indices', [])
        
        if not opportunity_indices:
            return Response({"error": "No opportunities selected for import"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Get the search and results
        search = VenueSearch.objects.get(id=search_id, user=request.user)
        
        # Validate this is an opportunity search
        if search.search_type != "opportunity":
            return Response({"error": "Invalid search type for opportunity import"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Track successfully imported and errors
        imported_count = 0
        errors = []
        
        # Import each opportunity
        for idx in opportunity_indices:
            try:
                # Get the result
                result = VenueResult.objects.get(search=search, index=idx)
                
                # Check if already imported
                if result.imported:
                    errors.append(f"Opportunity at index {idx} already imported")
                    continue
                
                # Actually create the Opportunity object
                from networking.models import Opportunity
                
                opportunity_data = _draft_opportunity(result.data) or {}
                if not opportunity_data:
                    errors.append(f"Opportunity at index {idx} could not be saved")
                    continue

                deadline = None
                if opportunity_data.get('deadline'):
                    deadline = datetime.strptime(opportunity_data['deadline'], '%Y-%m-%d').date()

                Opportunity.objects.create(
                    user=request.user,
                    title=opportunity_data['title'],
                    organization=opportunity_data['organization'],
                    description=opportunity_data.get('description', ''),
                    opportunity_type=opportunity_data['opportunity_type'],
                    status='active',
                    location=opportunity_data['location'],
                    deadline=deadline,
                    application_url='',
                    compensation=opportunity_data.get('compensation', ''),
                )
                
                # Mark as imported
                result.imported = True
                result.imported_at = timezone.now()
                result.save()
                
                imported_count += 1
                
            except VenueResult.DoesNotExist:
                errors.append(f"Opportunity result at index {idx} not found")
            except Exception:
                logger.exception("Error importing opportunity at index %s", idx)
                errors.append(f"Opportunity at index {idx} could not be saved")
        
        return Response({
            "total_imported": imported_count,
            "errors": errors
        })
        
    except VenueSearch.DoesNotExist:
        return Response({"error": "Search not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception:
        logger.exception("Error in import_opportunities")
        return Response(
            {"error": "Failed to import opportunities"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
