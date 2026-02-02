from django.urls import path
from . import views
app_name = 'ecommerce_app'

urlpatterns = [
    path('', views.allProdCat, name='allProdCat'),
    path('api/categories/', views.CategoryListAPIView.as_view(), name='category_list_api'),
    path('api/products/', views.ProductListAPIView.as_view(), name='product_list_api'),
    path('api/products/<slug:slug>/', views.ProductDetailAPIView.as_view(), name='product_detail_api'),
    path('<slug:c_slug>/', views.allProdCat, name='products_by_category'),
    path('<slug:c_slug>/<slug:product_slug>/', views.product_details, name='prodCatDetail'),

]