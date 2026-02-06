from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator, EmptyPage, InvalidPage
from ecommerce_app.models import Category, Product
from django.db.models import Q


# Create your views here.
def index(request):
    return render(request, 'index.html')


def allProdCat(request, c_slug=None):
    c_page = None
    products_list = None
    if c_slug != None:
        c_page = get_object_or_404(Category, slug=c_slug)
        products_list = Product.objects.all().filter(category=c_page, available=True)
    else:
        products_list = Product.objects.all().filter(available=True)
    paginator = Paginator(products_list, 6)
    try:
        page = int(request.GET.get('page', '1'))
    except:
        page = 1
    try:
        products = paginator.page(page)
    except (EmptyPage, InvalidPage):
        products = paginator.page(paginator.num_pages)
    return render(request, "category.html", {'category': c_page, 'products': products})


def product_details(request, c_slug, product_slug):
    try:
        product = Product.objects.get(category__slug=c_slug, slug=product_slug)
    except Exception as e:
        raise e
    return render(request, 'product.html', {'product': product})

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import CategorySerializer, ProductSerializer

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ProductListAPIView(generics.ListAPIView):
    queryset = Product.objects.all().select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset().filter(available=True)
        
        # Search by name or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter by category
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by stock availability
        in_stock = self.request.query_params.get('in_stock', None)
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        # Sort options
        sort_by = self.request.query_params.get('sort', None)
        if sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created')
        
        return queryset

class ProductDetailAPIView(generics.RetrieveAPIView):
    queryset = Product.objects.all().select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class ProductSearchSuggestionsAPIView(APIView):
    """API for search autocomplete suggestions"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])
        
        # Get matching products (limit to 5)
        products = Product.objects.filter(
            Q(name__icontains=query),
            available=True
        )[:5]
        
        suggestions = [
            {
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': str(p.price),
                'image': request.build_absolute_uri(p.image.url) if p.image else None
            }
            for p in products
        ]
        
        return Response(suggestions)


# ============ Wishlist API ============
from rest_framework.permissions import IsAuthenticated
from .models import Wishlist, WishlistItem

class WishlistAPIView(APIView):
    """API to manage user's wishlist"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all items in user's wishlist"""
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        items = wishlist.items.all().select_related('product', 'product__category')
        
        wishlist_data = {
            'items': [
                {
                    'id': item.id,
                    'product': {
                        'id': item.product.id,
                        'name': item.product.name,
                        'slug': item.product.slug,
                        'price': str(item.product.price),
                        'image': request.build_absolute_uri(item.product.image.url) if item.product.image else None,
                        'available': item.product.available,
                        'stock': item.product.stock,
                        'category': item.product.category.name
                    },
                    'added_at': item.added_at.isoformat()
                }
                for item in items
            ],
            'count': items.count()
        }
        
        return Response(wishlist_data)
    
    def post(self, request, product_id=None):
        """Add a product to wishlist"""
        if not product_id:
            return Response({'error': 'Product ID required'}, status=400)
        
        try:
            product = Product.objects.get(id=product_id)
            wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
            
            # Check if already in wishlist
            if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
                return Response({'message': 'Product already in wishlist'}, status=200)
            
            WishlistItem.objects.create(wishlist=wishlist, product=product)
            return Response({'message': 'Added to wishlist'}, status=201)
            
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)
    
    def delete(self, request, product_id=None):
        """Remove a product from wishlist"""
        if not product_id:
            return Response({'error': 'Product ID required'}, status=400)
        
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            item = WishlistItem.objects.get(wishlist=wishlist, product_id=product_id)
            item.delete()
            return Response({'message': 'Removed from wishlist'}, status=200)
        except (Wishlist.DoesNotExist, WishlistItem.DoesNotExist):
            return Response({'error': 'Item not in wishlist'}, status=404)


class WishlistCheckAPIView(APIView):
    """Check if product is in user's wishlist"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, product_id):
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            in_wishlist = WishlistItem.objects.filter(
                wishlist=wishlist, 
                product_id=product_id
            ).exists()
            return Response({'in_wishlist': in_wishlist})
        except Wishlist.DoesNotExist:
            return Response({'in_wishlist': False})


class WishlistProductIdsAPIView(APIView):
    """Get all product IDs in user's wishlist (for quick checking)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            product_ids = list(wishlist.items.values_list('product_id', flat=True))
            return Response({'product_ids': product_ids})
        except Wishlist.DoesNotExist:
            return Response({'product_ids': []})


# ============ Address API ============
from .models import Address

class AddressListCreateAPIView(APIView):
    """API to list and create addresses"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all addresses for the user"""
        addresses = Address.objects.filter(user=request.user)
        addresses_data = [
            {
                'id': addr.id,
                'name': addr.name,
                'phone': addr.phone,
                'address_line1': addr.address_line1,
                'address_line2': addr.address_line2,
                'city': addr.city,
                'state': addr.state,
                'postal_code': addr.postal_code,
                'country': addr.country,
                'address_type': addr.address_type,
                'is_default': addr.is_default
            }
            for addr in addresses
        ]
        return Response(addresses_data)
    
    def post(self, request):
        """Create a new address"""
        data = request.data
        
        # Validate required fields
        required_fields = ['name', 'phone', 'address_line1', 'city', 'state', 'postal_code']
        for field in required_fields:
            if not data.get(field):
                return Response({'error': f'{field} is required'}, status=400)
        
        # If this is the first address or marked as default
        is_first = not Address.objects.filter(user=request.user).exists()
        is_default = data.get('is_default', False) or is_first
        
        address = Address.objects.create(
            user=request.user,
            name=data['name'],
            phone=data['phone'],
            address_line1=data['address_line1'],
            address_line2=data.get('address_line2', ''),
            city=data['city'],
            state=data['state'],
            postal_code=data['postal_code'],
            country=data.get('country', 'India'),
            address_type=data.get('address_type', 'home'),
            is_default=is_default
        )
        
        return Response({
            'id': address.id,
            'message': 'Address created successfully'
        }, status=201)


class AddressDetailAPIView(APIView):
    """API to get, update, delete a specific address"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, address_id):
        """Get a specific address"""
        try:
            address = Address.objects.get(id=address_id, user=request.user)
            return Response({
                'id': address.id,
                'name': address.name,
                'phone': address.phone,
                'address_line1': address.address_line1,
                'address_line2': address.address_line2,
                'city': address.city,
                'state': address.state,
                'postal_code': address.postal_code,
                'country': address.country,
                'address_type': address.address_type,
                'is_default': address.is_default
            })
        except Address.DoesNotExist:
            return Response({'error': 'Address not found'}, status=404)
    
    def put(self, request, address_id):
        """Update an address"""
        try:
            address = Address.objects.get(id=address_id, user=request.user)
            data = request.data
            
            # Update fields
            address.name = data.get('name', address.name)
            address.phone = data.get('phone', address.phone)
            address.address_line1 = data.get('address_line1', address.address_line1)
            address.address_line2 = data.get('address_line2', address.address_line2)
            address.city = data.get('city', address.city)
            address.state = data.get('state', address.state)
            address.postal_code = data.get('postal_code', address.postal_code)
            address.country = data.get('country', address.country)
            address.address_type = data.get('address_type', address.address_type)
            
            if 'is_default' in data and data['is_default']:
                address.is_default = True
            
            address.save()
            return Response({'message': 'Address updated successfully'})
            
        except Address.DoesNotExist:
            return Response({'error': 'Address not found'}, status=404)
    
    def delete(self, request, address_id):
        """Delete an address"""
        try:
            address = Address.objects.get(id=address_id, user=request.user)
            was_default = address.is_default
            address.delete()
            
            # If deleted address was default, make another one default
            if was_default:
                first_address = Address.objects.filter(user=request.user).first()
                if first_address:
                    first_address.is_default = True
                    first_address.save()
            
            return Response({'message': 'Address deleted successfully'})
        except Address.DoesNotExist:
            return Response({'error': 'Address not found'}, status=404)


class SetDefaultAddressAPIView(APIView):
    """API to set an address as default"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, address_id):
        try:
            address = Address.objects.get(id=address_id, user=request.user)
            address.is_default = True
            address.save()  # The model's save method handles unsetting other defaults
            return Response({'message': 'Default address updated'})
        except Address.DoesNotExist:
            return Response({'error': 'Address not found'}, status=404)


# ============ Review API ============
from .models import ReviewRating
from .serializers import ReviewSerializer

class SubmitReviewAPIView(APIView):
    """API to submit a product review"""
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=404)

        # Check if user already reviewed
        try:
            review = ReviewRating.objects.get(user=request.user, product=product)
            # Update existing review
            serializer = ReviewSerializer(review, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(ip=request.META.get('REMOTE_ADDR'))
                return Response(serializer.data, status=200)
            return Response(serializer.errors, status=400)
        except ReviewRating.DoesNotExist:
            # Create new review
            data = request.data.copy()
            data['product'] = product.id
            data['user'] = request.user.id
            data['ip'] = request.META.get('REMOTE_ADDR')
            
            serializer = ReviewSerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=request.user, product=product)
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)

class ProductReviewsAPIView(APIView):
    """Get all reviews for a product"""
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        reviews = ReviewRating.objects.filter(product_id=product_id, status=True).select_related('user', 'product').order_by('-updated_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


class AdminReviewListAPIView(generics.ListAPIView):
    """API for Admins to list all reviews with search & filter"""
    permission_classes = [IsAuthenticated] # Should ideally check IsAdminUser
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        # Only allow staff to access
        if not self.request.user.is_staff:
            return ReviewRating.objects.none()

        queryset = ReviewRating.objects.all().select_related('user', 'product').order_by('-created_at')
        
        # Search (User, Product, Subject, Review)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search) | 
                Q(review__icontains=search) |
                Q(user__username__icontains=search) |
                Q(product__name__icontains=search)
            )
        
        # Filter by Status
        status = self.request.query_params.get('status', None)
        if status == 'active':
            queryset = queryset.filter(status=True)
        elif status == 'inactive':
            queryset = queryset.filter(status=False)
            
        return queryset

class AdminReviewDetailAPIView(APIView):
    """API for Admins to update status or delete a review"""
    permission_classes = [IsAuthenticated]

    def put(self, request, review_id):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=403)
            
        try:
            review = ReviewRating.objects.get(id=review_id)
            review.status = not review.status # Toggle status
            review.save()
            return Response({'message': 'Review status updated', 'status': review.status})
        except ReviewRating.DoesNotExist:
            return Response({'error': 'Review not found'}, status=404)

    def delete(self, request, review_id):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized'}, status=403)
            
        try:
            review = ReviewRating.objects.get(id=review_id)
            review.delete()
            return Response({'message': 'Review deleted successfully'})
        except ReviewRating.DoesNotExist:
            return Response({'error': 'Review not found'}, status=404)

