from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from ecommerce_app.models import Product, Address
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
                    elif cart.user == request.user:
                         # It's already our cart, just use it
                         pass
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
        if product.stock > 0:
            cart_item = CartItem.objects.create(
                product=product,
                cart=cart,
                quantity=1
            )
            cart_item.save()
        else:
             # Ideally redirect with message, but for now just fallback
             pass
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
                if product.stock > 0:
                    cart_item = CartItem.objects.create(product=product, cart=cart, quantity=1)
                    cart_item.save()
                else:
                    return Response({'error': 'Product is out of stock'}, status=status.HTTP_400_BAD_REQUEST)
            
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


# ============ Razorpay Payment Integration ============
import razorpay
import hmac
import hashlib
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import Order, Payment, OrderItem

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateOrderAPIView(APIView):
    """Create a Razorpay order from the current cart"""
    permission_classes = []
    
    def post(self, request):
        try:
            cart = _get_cart(request)
            cart_items = CartItem.objects.filter(cart=cart, active=True)
            
            if not cart_items.exists():
                return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate total
            total = sum(item.product.price * item.quantity for item in cart_items)
            
            # Apply coupon if exists and active
            if cart.coupon and cart.coupon.active:
                now = timezone.now()
                if cart.coupon.valid_from <= now <= cart.coupon.valid_to:
                    discount = (total * cart.coupon.discount) // 100
                    total -= discount
                
            amount_in_paise = int(total * 100)  # Razorpay expects amount in paise
            
            # Get shipping address
            address_id = request.data.get('address_id')
            shipping_address = None
            if address_id:
                try:
                    shipping_address = Address.objects.get(id=address_id)
                except Address.DoesNotExist:
                    pass

            # Create Razorpay order
            razorpay_order = razorpay_client.order.create({
                'amount': amount_in_paise,
                'currency': 'INR',
                'payment_capture': 1  # Auto-capture payment
            })
            
            # Save order to database
            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                cart=cart,
                razorpay_order_id=razorpay_order['id'],
                amount=total,
                status='pending',
                shipping_address=shipping_address
            )
            
            return Response({
                'order_id': razorpay_order['id'],
                'amount': amount_in_paise,
                'currency': 'INR',
                'key_id': settings.RAZORPAY_KEY_ID,
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentAPIView(APIView):
    """Verify Razorpay payment signature and complete order"""
    permission_classes = []
    
    def post(self, request):
        try:
            razorpay_order_id = request.data.get('razorpay_order_id')
            razorpay_payment_id = request.data.get('razorpay_payment_id')
            razorpay_signature = request.data.get('razorpay_signature')
            
            if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
                return Response({'error': 'Missing payment details'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify signature
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            expected_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if expected_signature != razorpay_signature:
                return Response({'error': 'Invalid payment signature'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Update order status
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.status = 'paid'
            order.save()
            
            # Create payment record
            Payment.objects.create(
                order=order,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_signature=razorpay_signature
            )
            
            # Save order items (snapshot of cart at checkout)
            cart = order.cart
            if cart:
                cart_items = CartItem.objects.filter(cart=cart)
                for item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        product_name=item.product.name,
                        product_price=item.product.price,
                        product_image=item.product.image.url if item.product.image else None,
                        quantity=item.quantity,
                        subtotal=item.sub_total()
                    )
                # Clear the cart items
                cart_items.delete()
                
                # Clear the coupon from the cart (and any other carts the user might have to be safe)
                if order.user:
                    Cart.objects.filter(user=order.user).update(coupon=None)
                else:
                    if cart:
                        Cart.objects.filter(pk=cart.pk).update(coupon=None)
            
            # Send confirmation email
            if order.user and order.user.email:
                try:
                    send_mail(
                        subject='Order Confirmed - Your payment was successful!',
                        message=f'''
Hello {order.user.username},

Thank you for your order!

Order ID: {order.razorpay_order_id}
Amount Paid: ₹{order.amount}
Payment ID: {razorpay_payment_id}

Your order has been confirmed and will be processed shortly.

Thank you for shopping with us!
                        ''',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[order.user.email],
                        fail_silently=True,
                    )
                except Exception as email_error:
                    print(f"Email sending failed: {email_error}")
            
            return Response({
                'status': 'Payment verified successfully',
                'order_id': razorpay_order_id,
                'payment_id': razorpay_payment_id
            }, status=status.HTTP_200_OK)
            
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrdersListAPIView(APIView):
    """API to get user's order history"""
    permission_classes = []
    
    def get(self, request):
        try:
            # Get orders for authenticated user or by session
            if request.user.is_authenticated:
                orders = Order.objects.filter(user=request.user, status='paid').order_by('-created_at')
            else:
                # For anonymous users, try to get orders from session cart
                cart = _get_cart(request)
                orders = Order.objects.filter(cart=cart, status='paid').order_by('-created_at')
            
            orders_data = []
            for order in orders:
                # Get payment details if exists
                payment_data = None
                if hasattr(order, 'payment'):
                    payment_data = {
                        'payment_id': order.payment.razorpay_payment_id,
                        'paid_at': order.payment.paid_at.isoformat()
                    }
                
                # Get item count
                item_count = order.items.count()
                
                orders_data.append({
                    'id': order.id,
                    'order_id': order.razorpay_order_id,
                    'amount': str(order.amount),
                    'status': order.status,
                    'created_at': order.created_at.isoformat(),
                    'payment': payment_data,
                    'item_count': item_count
                })
            
            return Response(orders_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderDetailAPIView(APIView):
    """API to get detailed order information including items"""
    permission_classes = []
    
    def get(self, request, order_id):
        try:
            # Get order
            if request.user.is_authenticated:
                order = Order.objects.get(id=order_id, user=request.user, status='paid')
            else:
                cart = _get_cart(request)
                order = Order.objects.get(id=order_id, cart=cart, status='paid')
            
            # Get order items
            items_data = [
                {
                    'id': item.id,
                    'product_id': item.product_id,
                    'product_name': item.product_name,
                    'product_price': str(item.product_price),
                    'product_image': item.product_image,
                    'quantity': item.quantity,
                    'subtotal': str(item.subtotal)
                }
                for item in order.items.all()
            ]
            
            # Get payment details
            payment_data = None
            if hasattr(order, 'payment'):
                payment_data = {
                    'payment_id': order.payment.razorpay_payment_id,
                    'paid_at': order.payment.paid_at.isoformat()
                }
            
            order_data = {
                'id': order.id,
                'order_id': order.razorpay_order_id,
                'amount': str(order.amount),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'payment': payment_data,
                'items': items_data
            }
            
            return Response(order_data, status=status.HTTP_200_OK)
            
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)