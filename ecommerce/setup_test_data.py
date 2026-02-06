import os
import django
from django.utils import timezone
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from django.contrib.auth import get_user_model
from ecommerce_app.models import Product, Category, Address
from cart.models import Coupon, Order, Cart, CartItem, OrderItem, Payment

User = get_user_model()

def setup_test_data():
    print("Setting up test data...")

    # 1. Create User
    user, created = User.objects.get_or_create(username='testuser', email='test@example.com')
    if created:
        user.set_password('password123')
        user.first_name = 'Test'
        user.last_name = 'User'
        user.save()
        print("Created user: testuser / password123")
    else:
        print("User testuser already exists")

    # 2. Create Category and Product
    cat, _ = Category.objects.get_or_create(name='TestCategory', slug='test-category')
    product, p_created = Product.objects.get_or_create(
        name='Test Product',
        slug='test-product',
        defaults={
            'price': 100.00,
            'stock': 10,
            'category': cat,
            'description': 'A test product'
        }
    )
    if p_created:
        print("Created Test Product")

    # 3. Create Coupon
    coupon, c_created = Coupon.objects.get_or_create(
        code='TEST10',
        defaults={
            'discount': 10,
            'valid_from': timezone.now(),
            'valid_to': timezone.now() + datetime.timedelta(days=30),
            'active': True
        }
    )
    if c_created:
        print("Created Coupon: TEST10 (10% off)")
    else:
        print("Coupon TEST10 already exists")

    # 4. Create Address
    address, a_created = Address.objects.get_or_create(
        user=user,
        defaults={
            'name': 'Test User',
            'phone': '1234567890',
            'address_line1': '123 Test St',
            'city': 'Test City',
            'state': 'Test State',
            'postal_code': '123456',
            'country': 'Test Country'
        }
    )
    if a_created:
        print("Created Address for testuser")

    # 5. Create Dummy Paid Order
    # Check if order already exists to avoid duplicates
    if not Order.objects.filter(user=user, status='paid').exists():
        order = Order.objects.create(
            user=user,
            razorpay_order_id='order_test_12345',
            amount=90.00,
            status='paid',
            shipping_address=address
        )
        Payment.objects.create(
            order=order,
            razorpay_payment_id='pay_test_12345',
            razorpay_signature='dummy_signature'
        )
        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            product_price=product.price,
            quantity=1,
            subtotal=90.00
        )
        print("Created dummy paid order for Invoice test")
    else:
        print("Paid order already exists")

if __name__ == '__main__':
    setup_test_data()
