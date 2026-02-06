from django.urls import path
from cart import views
from cart import invoice_views
from cart import coupon_views
app_name = 'cart'

urlpatterns = [
    path('', views.cart_details, name='cart_details'),
    path('api/', views.CartAPIView.as_view(), name='cart_api'),
    path('api/add/<int:product_id>/', views.AddToCartAPIView.as_view(), name='add_cart_api'),
    path('api/remove/<int:product_id>/', views.RemoveFromCartAPIView.as_view(), name='remove_cart_api'),
    path('api/full_remove/<int:product_id>/', views.FullRemoveFromCartAPIView.as_view(), name='full_remove_cart_api'),
    path('api/create-order/', views.CreateOrderAPIView.as_view(), name='create_order_api'),
    path('api/verify-payment/', views.VerifyPaymentAPIView.as_view(), name='verify_payment_api'),
    path('api/orders/', views.OrdersListAPIView.as_view(), name='orders_api'),
    path('api/orders/<int:order_id>/', views.OrderDetailAPIView.as_view(), name='order_detail_api'),
    path('api/apply-coupon/', coupon_views.ApplyCouponAPIView.as_view(), name='apply_coupon_api'),
    path('api/remove-coupon/', coupon_views.RemoveCouponAPIView.as_view(), name='remove_coupon'),
    path('invoice/<int:order_id>/', invoice_views.invoice_view, name='invoice'), # Invoice View
    path('add/<int:product_id>/', views.add_cart, name='add_cart'),
    path('remove/<int:product_id>/', views.cart_remove, name='cart_remove'),
    path('full_remove/<int:product_id>/', views.full_remove, name='full_remove')
]
