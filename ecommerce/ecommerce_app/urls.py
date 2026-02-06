from django.urls import path
from . import views
app_name = 'ecommerce_app'

urlpatterns = [
    path('', views.allProdCat, name='allProdCat'),
    path('api/categories/', views.CategoryListAPIView.as_view(), name='category_list_api'),
    path('api/products/', views.ProductListAPIView.as_view(), name='product_list_api'),
    path('api/products/search-suggestions/', views.ProductSearchSuggestionsAPIView.as_view(), name='search_suggestions_api'),
    path('api/products/<slug:slug>/', views.ProductDetailAPIView.as_view(), name='product_detail_api'),
    
    # Wishlist API
    path('api/wishlist/', views.WishlistAPIView.as_view(), name='wishlist_api'),
    path('api/wishlist/add/<int:product_id>/', views.WishlistAPIView.as_view(), name='wishlist_add'),
    path('api/wishlist/remove/<int:product_id>/', views.WishlistAPIView.as_view(), name='wishlist_remove'),
    path('api/wishlist/check/<int:product_id>/', views.WishlistCheckAPIView.as_view(), name='wishlist_check'),
    path('api/wishlist/product-ids/', views.WishlistProductIdsAPIView.as_view(), name='wishlist_product_ids'),
    
    # Address API
    path('api/addresses/', views.AddressListCreateAPIView.as_view(), name='address_list_create'),
    path('api/addresses/<int:address_id>/', views.AddressDetailAPIView.as_view(), name='address_detail'),
    path('api/addresses/<int:address_id>/set-default/', views.SetDefaultAddressAPIView.as_view(), name='set_default_address'),
    
    # Review API
    path('api/reviews/submit/<int:product_id>/', views.SubmitReviewAPIView.as_view(), name='submit_review'),
    path('api/reviews/<int:product_id>/', views.ProductReviewsAPIView.as_view(), name='product_reviews'),
    
    # Admin Review API
    path('api/admin/reviews/', views.AdminReviewListAPIView.as_view(), name='admin_review_list'),
    path('api/admin/reviews/<int:review_id>/', views.AdminReviewDetailAPIView.as_view(), name='admin_review_detail'),
    
    path('<slug:c_slug>/', views.allProdCat, name='products_by_category'),
    path('<slug:c_slug>/<slug:product_slug>/', views.product_details, name='prodCatDetail'),
]
