from django.urls import path
from .views import RegisterView, login_page, register_page
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('login-ui/', login_page, name='login_ui'),
    path('register-ui/', register_page, name='register_ui'),
]
