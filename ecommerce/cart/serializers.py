from rest_framework import serializers
from .models import Cart, CartItem
from ecommerce_app.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    sub_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'active', 'sub_total']

    def get_sub_total(self, obj):
        return obj.product.price * obj.quantity

class CartSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    sub_total = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    coupon = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['cart_id', 'date_added', 'items', 'sub_total', 'grand_total', 'item_count', 'coupon', 'discount_amount']

    def get_items(self, obj):
        items = CartItem.objects.filter(cart=obj, active=True)
        request = self.context.get('request')
        serializer = CartItemSerializer(items, many=True, context={'request': request})
        return serializer.data

    def get_sub_total(self, obj):
        items = CartItem.objects.filter(cart=obj, active=True)
        return sum(item.product.price * item.quantity for item in items)

    def get_grand_total(self, obj):
        total = self.get_sub_total(obj)
        if obj.coupon:
            discount = (total * obj.coupon.discount) // 100
            total -= discount
        return total

    def get_item_count(self, obj):
        items = CartItem.objects.filter(cart=obj, active=True)
        return sum(item.quantity for item in items)

    def get_coupon(self, obj):
        if obj.coupon:
            return {'code': obj.coupon.code, 'discount': obj.coupon.discount}
        return None

    def get_discount_amount(self, obj):
        if obj.coupon:
            total = self.get_sub_total(obj)
            return (total * obj.coupon.discount) // 100
        return 0
