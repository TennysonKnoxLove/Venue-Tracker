from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import ArtistProfile, SocialLink
from .serializers import ArtistProfileSerializer, SocialLinkSerializer

# Create your views here.

class ArtistProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ArtistProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']
    
    def get_queryset(self):
        return ArtistProfile.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Get or create profile for current user
        profile, created = ArtistProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    # Override list to return only the user's profile
    def list(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)
    
    # Explicitly handle update with PATCH
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """
    Dedicated endpoint for updating user profile with PATCH method
    """
    user = request.user
    profile, created = ArtistProfile.objects.get_or_create(user=user)
    
    serializer = ArtistProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SocialLinkViewSet(viewsets.ModelViewSet):
    serializer_class = SocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SocialLink.objects.filter(profile__user=self.request.user)
    
    def perform_create(self, serializer):
        profile, created = ArtistProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        links_order = request.data.get('links_order', [])
        if not links_order:
            return Response(
                {"error": "No links order provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        for idx, link_id in enumerate(links_order):
            try:
                link = SocialLink.objects.get(
                    id=link_id, 
                    profile__user=request.user
                )
                link.order = idx
                link.save()
            except SocialLink.DoesNotExist:
                pass
        
        return Response(
            {"success": "Links reordered successfully"},
            status=status.HTTP_200_OK
        )
