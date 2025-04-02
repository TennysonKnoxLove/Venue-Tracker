from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'industries', views.IndustryViewSet)
router.register(r'connections', views.ConnectionViewSet, basename='connection')
router.register(r'interactions', views.InteractionViewSet, basename='interaction')

urlpatterns = [
    path('', include(router.urls)),
] 