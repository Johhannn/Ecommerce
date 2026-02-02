from django.urls import path
from cart import views
app_name = 'cart'

urlpatterns = [
    path('', views.cart_details, name='cart_details'),
    path('api/', views.CartAPIView.as_view(), name='cart_api'),
    path('api/add/<int:product_id>/', views.AddToCartAPIView.as_view(), name='add_cart_api'),
    path('api/remove/<int:product_id>/', views.RemoveFromCartAPIView.as_view(), name='remove_cart_api'),
    path('api/full_remove/<int:product_id>/', views.FullRemoveFromCartAPIView.as_view(), name='full_remove_cart_api'),
    path('add/<int:product_id>/', views.add_cart, name='add_cart'),
    path('remove/<int:product_id>/', views.cart_remove, name='cart_remove'),
    path('full_remove/<int:product_id>/', views.full_remove, name='full_remove')

]