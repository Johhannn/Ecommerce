from django.contrib import admin
from . models import Category, Product, ReviewRating
# Register your models here.


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


admin.site.register(Category, CategoryAdmin)


class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock', 'available', 'created', 'updated']
    list_editable = ['price', 'stock', 'available']
    prepopulated_fields = {'slug': ('name',)}
    list_per_page = 20


admin.site.register(Product, ProductAdmin)

class ReviewRatingAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'rating']
    search_fields = ['product__name', 'subject', 'review']

admin.site.register(ReviewRating, ReviewRatingAdmin)
