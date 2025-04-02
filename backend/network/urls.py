from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import NetworkContactViewSet, ContactSocialLinkViewSet

router = DefaultRouter()
router.register(r'contacts', NetworkContactViewSet, basename='network-contact')

contact_router = routers.NestedSimpleRouter(router, r'contacts', lookup='contact')
contact_router.register(r'social-links', ContactSocialLinkViewSet, basename='contact-social-link')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(contact_router.urls)),
] 