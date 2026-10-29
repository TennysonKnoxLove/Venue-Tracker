from django.urls import path

from .views import (
    RegisterView,
    UserView,
    PasswordResetRequestView,
    PasswordResetVerifyView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('user/', UserView.as_view(), name='user'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
] 