from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import json
from django.http import FileResponse
import os
from django.conf import settings
from ..models import AudioFile, AudioEdit
from ..serializers import AudioFileSerializer, AudioFileDetailSerializer, AudioEditSerializer
from ..processing import process_audio, generate_waveform_data
import logging

logger = logging.getLogger(__name__)

class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit or delete it,
    while allowing all authenticated users to view it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
            
        # Write permissions are only allowed to the owner
        return obj.user == request.user

class AudioFileViewSet(viewsets.ModelViewSet):
    """ViewSet for managing audio files"""
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_queryset(self):
        # Return all audio files instead of filtering by user
        return AudioFile.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AudioFileDetailSerializer
        return AudioFileSerializer
    
    def create(self, request, *args, **kwargs):
        """Handle file upload with waveform generation"""
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_extension = file_obj.name.split('.')[-1].lower()
        if file_extension not in ['mp3', 'wav', 'ogg', 'm4a']:
            return Response(
                {'error': 'Unsupported file format'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data={
            'title': request.data.get('title', file_obj.name),
            'file': file_obj,
            'file_type': file_extension,
            'user': request.user.id
        })
        
        if serializer.is_valid():
            audio_file = serializer.save()
            logger.info(f"AudioFile record created with ID: {audio_file.id} for file {file_obj.name}")
            
            try:
                file_path = audio_file.file.path
                logger.info(f"Attempting to generate waveform data for: {file_path}")
                processing_result = generate_waveform_data(file_path)
                
                if processing_result is None:
                    logger.error(f"Failed to generate waveform data for AudioFile ID: {audio_file.id}. Deleting record.")
                    audio_file.delete()
                    return Response(
                        {'error': 'Failed to process audio metadata. The file might be corrupted or unsupported.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
                
                audio_file.waveform_data = processing_result['waveform']
                audio_file.duration = processing_result['duration']
                audio_file.save()
                logger.info(f"Successfully updated AudioFile ID: {audio_file.id} with waveform and duration.")
                
                return Response(
                    AudioFileSerializer(audio_file).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                logger.error(f"Unexpected error during post-save processing for AudioFile ID: {audio_file.id}. Deleting record. Error: {e}", exc_info=True)
                audio_file.delete()
                return Response(
                    {'error': 'An unexpected error occurred while processing the audio file.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        logger.warning(f"Audio file upload failed validation for user {request.user.id}: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def edit(self, request, pk=None):
        """Apply an edit to an audio file"""
        audio_file = self.get_object()
        
        # Validate edit parameters
        edit_type = request.data.get('edit_type')
        parameters = request.data.get('parameters', {})
        
        # Convert parameters from string to dict if needed
        if isinstance(parameters, str):
            try:
                parameters = json.loads(parameters)
            except json.JSONDecodeError:
                return Response(
                    {'error': 'Invalid parameters format'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if not edit_type:
            return Response(
                {'error': 'Edit type is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if edit_type not in dict(AudioEdit.EDIT_TYPE_CHOICES):
            return Response(
                {'error': f'Unsupported edit type: {edit_type}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process the audio
        output_path = process_audio(
            audio_file.file.path,
            edit_type,
            parameters
        )
        
        if not output_path:
            return Response(
                {'error': 'Failed to process audio'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Create a record of the edit
        edit = AudioEdit.objects.create(
            audio_file=audio_file,
            edit_type=edit_type,
            parameters=parameters,
            user=request.user
        )
        
        # Update the audio file with the new file
        original_path = audio_file.file.path
        filename = os.path.basename(output_path)
        relative_path = f'audio/{filename}'
        
        audio_file.file = relative_path
        
        # Generate new waveform data
        waveform_data = generate_waveform_data(output_path)
        audio_file.waveform_data = waveform_data['waveform']
        audio_file.duration = waveform_data['duration']
        audio_file.save()
        
        # Delete the original file if it's different from the new one
        if os.path.exists(original_path) and original_path != output_path:
            os.remove(original_path)
        
        return Response(
            AudioFileDetailSerializer(audio_file).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'])
    def edits(self, request, pk=None):
        """Get edit history for an audio file"""
        audio_file = self.get_object()
        edits = audio_file.edits.all()
        serializer = AudioEditSerializer(edits, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download the processed audio file"""
        audio_file = self.get_object()
        file_path = audio_file.file.path
        
        if not os.path.exists(file_path):
            return Response(
                {'error': 'File not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=f"{audio_file.title}.{audio_file.file_type}"
        ) 