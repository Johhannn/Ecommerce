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
    grand_total = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['cart_id', 'date_added', 'items', 'grand_total', 'item_count']

    def get_items(self, obj):
        items = CartItem.objects.filter(cart=obj, active=True)
        request = self.context.get('request')
        serializer = CartItemSerializer(items, many=True, context={'request': request})
        return serializer.data

    def get_grand_total(self, obj):
        items = CartItem.objects.filter(cart=obj, active=True)
        total = sum(item.product.price * item.quantity for item in items)
        return total

    def get_item_count(self, obj):
        items = CartItem.objects.filter(cart=obj, active=True)
        return sum(item.quantity for item in items)
