from django.contrib import admin
from .models import Cart, CartItem, Order, Payment, Coupon

# Register your models here.
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(Payment)

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount', 'active', 'valid_from', 'valid_to']
    search_fields = ['code']
