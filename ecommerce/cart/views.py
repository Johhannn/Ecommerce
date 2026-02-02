from django.shortcuts import render, redirect, get_object_or_404
from ecommerce_app.models import Product
from .models import Cart, CartItem
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CartSerializer, CartItemSerializer

# Helper function to get cart ID from session
def _cart_id(request):
    cart = request.session.session_key
    if not cart:
        request.session.create()
        cart = request.session.session_key
    return cart

# Helper to get or create cart based on user or session
def _get_cart(request):
    if request.user.is_authenticated:
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            # Check if there's a session cart to merge or just create new
            cart_id = _cart_id(request)
            try:
                cart = Cart.objects.filter(cart_id=cart_id).first()
                if cart:
                    if cart.user is None:
                         cart.user = request.user
                         cart.save()
                    else:
                         # Session cart belongs to someone else? Create new.
                         cart = Cart.objects.create(cart_id=cart_id, user=request.user)
                else:
                     cart = Cart.objects.create(cart_id=cart_id, user=request.user)
            except Exception as e:
                # Fallback
                 cart = Cart.objects.create(cart_id=cart_id, user=request.user)
    else:
        cart_id = _cart_id(request)
        cart = Cart.objects.filter(cart_id=cart_id).first()
        if not cart:
            cart = Cart.objects.create(cart_id=cart_id)
    return cart

def add_cart(request, product_id):
    product = Product.objects.get(id=product_id)
    cart = _get_cart(request)
    
    try:
        cart_item = CartItem.objects.get(product=product, cart=cart)
        if cart_item.quantity < cart_item.product.stock:
            cart_item.quantity += 1
        cart_item.save()
    except CartItem.DoesNotExist:
        cart_item = CartItem.objects.create(
            product=product,
            cart=cart,
            quantity=1
        )
        cart_item.save()
    return redirect('cart:cart_details')

def cart_details(request, total=0, counter=0, cart_items=None):
    try:
        cart = _get_cart(request)
        cart_items = CartItem.objects.filter(cart=cart, active=True)
        for cart_item in cart_items:
            total += (cart_item.product.price * cart_item.quantity)
            counter += cart_item.quantity
    except ObjectDoesNotExist:
        pass
    return render(request, 'cart.html', dict(total=total, counter=counter, cart_items=cart_items))

def cart_remove(request, product_id):
    cart = _get_cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart_item = CartItem.objects.get(product=product, cart=cart)
    if cart_item.quantity > 1:
        cart_item.quantity -= 1
        cart_item.save()
    else:
        cart_item.delete()
    return redirect('cart:cart_details')


class CartAPIView(APIView):
    permission_classes = []
    
    def get(self, request):
        try:
            cart = _get_cart(request)
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e), 'trace': traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AddToCartAPIView(APIView):
    permission_classes = []
    
    def post(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
            cart = _get_cart(request)
            
            try:
                cart_item = CartItem.objects.get(product=product, cart=cart)
                if cart_item.quantity < cart_item.product.stock:
                    cart_item.quantity += 1
                cart_item.save()
            except CartItem.DoesNotExist:
                cart_item = CartItem.objects.create(product=product, cart=cart, quantity=1)
                cart_item.save()
            
            return Response({'status': 'Item added to cart'}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

class RemoveFromCartAPIView(APIView):
    permission_classes = []
    
    def post(self, request, product_id):
        try:
            cart = _get_cart(request)
            product = get_object_or_404(Product, id=product_id)
            cart_item = CartItem.objects.get(product=product, cart=cart)
            if cart_item.quantity > 1:
                cart_item.quantity -= 1
                cart_item.save()
            else:
                cart_item.delete()
            return Response({'status': 'Item removed from cart'}, status=status.HTTP_200_OK)
        except Exception as e:
             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class FullRemoveFromCartAPIView(APIView):
    permission_classes = []
    
    def delete(self, request, product_id):
        try:
            cart = _get_cart(request)
            product = get_object_or_404(Product, id=product_id)
            cart_item = CartItem.objects.get(product=product, cart=cart)
            cart_item.delete()
            return Response({'status': 'Item completely removed'}, status=status.HTTP_200_OK)
        except Exception as e:
             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def full_remove(request, product_id):
    cart = _get_cart(request)
    product = get_object_or_404(Product, id=product_id)
    cart_item = CartItem.objects.get(product=product, cart=cart)
    cart_item.delete()
    return redirect('cart:cart_details')