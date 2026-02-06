from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from cart.models import Order
from ecommerce_app.models import Product, ReviewRating
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth

User = get_user_model()

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Total Revenue (only paid orders)
        total_revenue = Order.objects.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0

        # 2. Total Orders
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()

        # 3. Total Customers
        total_customers = User.objects.count()

        # 4. Low Stock Products (stock < 5)
        low_stock_count = Product.objects.filter(stock__lt=5).count()

        # 5. Review Stats
        total_reviews = ReviewRating.objects.count()
        avg_rating = ReviewRating.objects.aggregate(avg=Avg('rating'))['avg'] or 0

        # 5. Recent Orders (last 5)
        recent_orders = Order.objects.all().order_by('-created_at')[:5]
        recent_orders_data = []
        for order in recent_orders:
            recent_orders_data.append({
                'id': order.id,
                'order_id': order.razorpay_order_id,
                'user': order.user.username if order.user else 'Guest',
                'amount': order.amount,
                'status': order.status,
                'created_at': order.created_at
            })

        return Response({
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'total_customers': total_customers,
            'total_customers': total_customers,
            'low_stock_count': low_stock_count,
            'total_reviews': total_reviews,
            'avg_rating': round(avg_rating, 1),
            'recent_orders': recent_orders_data
        }, status=status.HTTP_200_OK)

class AdminProductListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models import Q
        from django.core.paginator import Paginator, EmptyPage

        queryset = Product.objects.all().select_related('category').order_by('id')

        # 1. Search
        search_query = request.query_params.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(id__icontains=search_query) |
                Q(slug__icontains=search_query)
            )

        # 2. Filter by Category
        category_filter = request.query_params.get('category', '')
        if category_filter and category_filter != 'all':
            queryset = queryset.filter(category_id=category_filter)

        # 3. Filter by Stock Status
        stock_status = request.query_params.get('stock_status', '')
        if stock_status == 'low':
            queryset = queryset.filter(stock__lt=5)
        elif stock_status == 'out':
            queryset = queryset.filter(stock=0)

        # 4. Pagination
        page = request.query_params.get('page', 1)
        per_page = 10
        paginator = Paginator(queryset, per_page)

        try:
            products_page = paginator.page(page)
        except EmptyPage:
            products_page = paginator.page(paginator.num_pages)
        except:
             products_page = paginator.page(1)

        data = []
        for p in products_page:
            data.append({
                'id': p.id,
                'name': p.name,
                'price': p.price,
                'stock': p.stock,
                'category': p.category.name if p.category else 'Uncategorized',
                'image': request.build_absolute_uri(p.image.url) if p.image else None
            })
        
        return Response({
            'products': data,
            'total_pages': paginator.num_pages,
            'current_page': products_page.number,
            'total_count': paginator.count
        }, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            data = request.data
            # Basic validation
            if not data.get('name') or not data.get('price') or not data.get('slug'):
                 return Response({'error': 'Name, Slug and Price are required'}, status=status.HTTP_400_BAD_REQUEST)

            from ecommerce_app.models import Category
            category = None
            if data.get('category_id'):
                category = Category.objects.get(id=data.get('category_id'))
            elif data.get('category_name'): # Optional: auto-create or find by name
                 pass 

            product = Product.objects.create(
                name=data['name'],
                slug=data['slug'],
                description=data.get('description', ''),
                price=data['price'],
                stock=data.get('stock', 0),
                category=category,
                image=request.FILES.get('image')
            )
            return Response({'message': 'Product created successfully', 'id': product.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AdminProductUpdateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Update fields if present in request
        if 'stock' in request.data:
            product.stock = request.data['stock']
        if 'price' in request.data:
            product.price = request.data['price']
        
        product.save()
        return Response({'message': 'Product updated successfully'}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

class DashboardChartAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # Get sales data for the last 30 days
        from django.utils import timezone
        from datetime import timedelta
        
        last_30_days = timezone.now() - timedelta(days=30)
        
        # Aggregate revenue by day
        sales_data = Order.objects.filter(
            status='paid',
            created_at__gte=last_30_days
        ).annotate(
            day=TruncMonth('created_at') # Group by month for now, or use TruncDate for daily
        ).values('day').annotate(
            total_revenue=Sum('amount'),
            count=Count('id')
        ).order_by('day')

        # Since sqlite might not support TruncDate easily or depending on DB, 
        # let's do a simple python loop for daily data if needed, or stick to monthly for trend.
        # But for value "Revenue Trend", daily is better. Let's try TruncDate.
        from django.db.models.functions import TruncDate
        
        daily_sales = Order.objects.filter(
            status='paid',
            created_at__gte=last_30_days
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            revenue=Sum('amount'),
            count=Count('id')
        ).order_by('date')
        
        labels = []
        revenue_data = []
        orders_data = []
        
        for entry in daily_sales:
            labels.append(entry['date'].strftime('%Y-%m-%d'))
            revenue_data.append(entry['revenue'])
            orders_data.append(entry['count'])
            
        # Order Status Distribution (Pie Chart)
        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        pie_labels = []
        pie_data = []
        
        for entry in status_counts:
            pie_labels.append(entry['status'].capitalize())
            pie_data.append(entry['count'])

        return Response({
            'labels': labels,
            'revenue': revenue_data,
            'orders': orders_data,
            'pie_labels': pie_labels,
            'pie_data': pie_data
        })

class AdminOrderListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models import Q
        from django.core.paginator import Paginator, EmptyPage

        queryset = Order.objects.all().select_related('user').annotate(items_count=Count('items')).order_by('-created_at')

        # 1. Search
        search_query = request.query_params.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(razorpay_order_id__icontains=search_query) |
                Q(id__icontains=search_query) |
                Q(user__username__icontains=search_query) |
                Q(user__email__icontains=search_query)
            )

        # 2. Filter by Status
        status_filter = request.query_params.get('status', '')
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)

        # 3. Pagination
        page = request.query_params.get('page', 1)
        per_page = 10  # Items per page
        paginator = Paginator(queryset, per_page)

        try:
            orders_page = paginator.page(page)
        except EmptyPage:
            orders_page = paginator.page(paginator.num_pages)
        except:
             orders_page = paginator.page(1)

        data = []
        for order in orders_page:
            data.append({
                'id': order.id,
                'order_id': order.razorpay_order_id,
                'user': order.user.username if order.user else 'Guest',
                'amount': order.amount,
                'status': order.status,
                'created_at': order.created_at,
                'items_count': order.items_count
            })
        
        return Response({
            'orders': data,
            'total_pages': paginator.num_pages,
            'current_page': orders_page.number,
            'total_count': paginator.count
        }, status=status.HTTP_200_OK)

class AdminOrderUpdateAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            status_val = request.data.get('status')
            if status_val:
                order.status = status_val
                order.save()
                return Response({'message': 'Order status updated'}, status=status.HTTP_200_OK)
            return Response({'error': 'Status required'}, status=status.HTTP_400_BAD_REQUEST)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
