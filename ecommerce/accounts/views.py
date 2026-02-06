from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, UserProfileSerializer
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view to include username in JWT"""
    serializer_class = CustomTokenObtainPairSerializer


def login_page(request):
    return render(request, 'login.html')

def register_page(request):
    return render(request, 'register.html')


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View to search, retrieve and update user profile"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer # Just for schema, we don't use it really

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Construct reset link (frontend URL)
            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"
            
            send_mail(
                'Password Reset Request',
                f'Click the link to reset your password: {reset_link}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({'message': 'Password reset email sent.'})
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist
            return Response({'message': 'Password reset email sent.'})


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid link.'}, status=400)

        if default_token_generator.check_token(user, token):
            new_password = request.data.get('password')
            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successful.'})
        return Response({'error': 'Invalid or expired token.'}, status=400)
