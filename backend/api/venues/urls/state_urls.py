from django.urls import path
from ..views.state_views import StateList, StateDetail

urlpatterns = [
    path('', StateList.as_view(), name='state-list'),
    path('<int:pk>/', StateDetail.as_view(), name='state-detail'),
]
