from .models import Cart, CartItem
from .views import _cart_id

def counter(request):
    item_count = 0

    # Skip admin pages
    if request.path.startswith('/admin'):
        return {}

    try:
        cart = Cart.objects.get(cart_id=_cart_id(request))
        cart_items = CartItem.objects.filter(cart=cart, active=True)

        for cart_item in cart_items:
            item_count += cart_item.quantity

    except Cart.DoesNotExist:
        item_count = 0

    return {'item_count': item_count}