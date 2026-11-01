from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ArtistProfile, SocialLink
from .serializers import ArtistProfileSerializer, SocialLinkSerializer

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

    @action(detail=False, methods=['patch'], url_path='update')
    def update_current(self, request):
        return self.partial_update(request)

class SocialLinkViewSet(viewsets.ModelViewSet):
    serializer_class = SocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SocialLink.objects.filter(profile__user=self.request.user)
    
    def perform_create(self, serializer):
        profile, created = ArtistProfile.objects.get_or_create(user=self.request.user)
        serializer.save(profile=profile)
