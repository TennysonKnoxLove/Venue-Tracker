from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import NetworkContact, ContactSocialLink
from .serializers import NetworkContactSerializer, ContactSocialLinkSerializer

# Create your views here.

class NetworkContactViewSet(viewsets.ModelViewSet):
    """API endpoint for managing network contacts"""
    serializer_class = NetworkContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'skills', 'meeting_context', 'notes']
    ordering_fields = ['name', 'last_contact_date', 'created_at', 'updated_at']
    
    def get_queryset(self):
        return NetworkContact.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['get'])
    def social_links(self, request, pk=None):
        contact = self.get_object()
        links = contact.social_links.all()
        serializer = ContactSocialLinkSerializer(links, many=True)
        return Response(serializer.data)

class ContactSocialLinkViewSet(viewsets.ModelViewSet):
    """API endpoint for managing contact social links"""
    serializer_class = ContactSocialLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ContactSocialLink.objects.filter(contact__user=self.request.user)
    
    def perform_create(self, serializer):
        contact_id = self.kwargs.get('contact_pk')
        contact = get_object_or_404(NetworkContact, id=contact_id, user=self.request.user)
        serializer.save(contact=contact)
