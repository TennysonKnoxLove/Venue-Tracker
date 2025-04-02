from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
import datetime
import logging
from django.utils import timezone

from .serializers import UserSerializer, UserCreateSerializer, CustomTokenObtainPairSerializer

User = get_user_model()
logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses our serializer"""
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    """View for user registration"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                # Return user data without sending password
                return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserView(APIView):
    """View for retrieving and updating the current user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """View for user logout - blacklisting their refresh token"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """View for requesting a password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {"error": "Email is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Make email case-insensitive 
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                # Don't reveal that email doesn't exist for security
                logger.info(f"Password reset attempted for non-existent email: {email}")
                return Response(
                    {"message": "If your email is in our system, you will receive a reset code"}, 
                    status=status.HTTP_200_OK
                )
            
            # Generate a verification code
            verification_code = get_random_string(length=6, allowed_chars='0123456789')
            
            # Store verification code and expiry time (30 minutes from now)
            user.reset_code = verification_code
            user.reset_code_expiry = timezone.now() + datetime.timedelta(minutes=30)
            user.save()
            
            # Log the verification code for development purposes
            logger.info("="*40)
            logger.info(f"PASSWORD RESET CODE for {email}: {verification_code}")
            logger.info("="*40)
            
            # Send verification email
            send_mail(
                'Password Reset Verification Code',
                f'Your verification code is: {verification_code}\nThis code will expire in 30 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            # Include the verification code in development mode
            response_data = {
                "message": "Password reset verification code sent to your email"
            }
            
            # If in development mode, include the verification code in the response
            if settings.DEBUG:
                response_data["verification_code"] = verification_code
                response_data["development_note"] = "This code is only included in DEBUG mode"
            
            return Response(response_data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Don't reveal that email doesn't exist for security
            logger.info(f"Password reset attempted for non-existent email: {email}")
            return Response(
                {"message": "If your email is in our system, you will receive a reset code"}, 
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return Response(
                {"error": "Failed to send verification code"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetVerifyView(APIView):
    """View for verifying and resetting password"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        verification_code = request.data.get('verification_code')
        new_password = request.data.get('new_password')
        
        if not all([email, verification_code, new_password]):
            return Response(
                {"error": "Email, verification code and new password are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Make email case-insensitive
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                logger.warning(f"Password reset verification attempted for non-existent email: {email}")
                return Response(
                    {"error": "Invalid email or verification code"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if verification code exists and is valid
            if not user.reset_code or user.reset_code != verification_code:
                logger.warning(f"Invalid verification code for {email}: provided={verification_code}, stored={user.reset_code}")
                return Response(
                    {"error": "Invalid verification code"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Check if verification code has expired
            if not user.reset_code_expiry:
                logger.warning(f"Reset code expiry is None for {email}")
                return Response(
                    {"error": "Verification code has expired"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Convert naive datetime to timezone-aware if needed
            now = timezone.now()
            expiry_time = user.reset_code_expiry
            if timezone.is_naive(expiry_time):
                expiry_time = timezone.make_aware(expiry_time)
                
            if expiry_time < now:
                logger.warning(f"Expired verification code for {email}, expired at {expiry_time}")
                return Response(
                    {"error": "Verification code has expired"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Reset password
            user.set_password(new_password)
            
            # Clear the reset code and expiry
            user.reset_code = None
            user.reset_code_expiry = None
            user.save()
            
            logger.info(f"Password successfully reset for {email}")
            return Response(
                {"message": "Password has been reset successfully"}, 
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            logger.warning(f"Password reset verification attempted for non-existent email: {email}")
            return Response(
                {"error": "Invalid email or verification code"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Password reset verification error: {str(e)}")
            return Response(
                {"error": "Failed to reset password"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 