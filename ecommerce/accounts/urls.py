from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView, login_page, register_page, UserProfileView, PasswordResetRequestView, PasswordResetConfirmView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login-ui/', login_page, name='login_ui'),
    path('register-ui/', register_page, name='register_ui'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('password-reset-request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
