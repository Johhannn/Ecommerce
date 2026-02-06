from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'category', 'image', 'stock', 'available', 'created', 'updated']


from .models import ReviewRating

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ReviewRating
        fields = ['id', 'product', 'product_name', 'user', 'user_name', 'subject', 'review', 'rating', 'status', 'created_at']
        read_only_fields = ['user', 'product', 'created_at']

    def get_user_name(self, obj):
        if obj.user.first_name:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.user.username

    def get_product_name(self, obj):
        return obj.product.name
