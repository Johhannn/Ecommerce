from django.urls import path
from .views import DashboardStatsAPIView, AdminProductListAPIView, AdminProductUpdateAPIView, DashboardChartAPIView, AdminOrderListAPIView, AdminOrderUpdateAPIView

urlpatterns = [
    path('stats/', DashboardStatsAPIView.as_view(), name='admin_stats'),
    path('products/', AdminProductListAPIView.as_view(), name='admin_products'),
    path('products/<int:pk>/', AdminProductUpdateAPIView.as_view(), name='admin_product_update'),
    path('chart-data/', DashboardChartAPIView.as_view(), name='admin_chart_data'),
    path('orders/', AdminOrderListAPIView.as_view(), name='admin_orders'),
    path('orders/<int:pk>/', AdminOrderUpdateAPIView.as_view(), name='admin_order_update'),
]
