from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Coupon, Cart
from .views import _get_cart

class ApplyCouponAPIView(APIView):
    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response({'error': 'Coupon code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            coupon = Coupon.objects.get(code=code, active=True, valid_from__lte=timezone.now(), valid_to__gte=timezone.now())
            cart = _get_cart(request)
            cart.coupon = coupon
            cart.save()
            return Response({
                'message': 'Coupon applied successfully', 
                'discount': coupon.discount, 
                'code': coupon.code,
                'status': 'success'
            }, status=status.HTTP_200_OK)
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid or expired coupon'}, status=status.HTTP_400_BAD_REQUEST)

class RemoveCouponAPIView(APIView):
    def post(self, request):
        cart = _get_cart(request)
        cart.coupon = None
        cart.save()
        return Response({'message': 'Coupon removed successfully', 'status': 'success'}, status=status.HTTP_200_OK)
