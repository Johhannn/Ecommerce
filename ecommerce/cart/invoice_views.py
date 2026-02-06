from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404, render
from .models import Order

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invoice_view(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    # Ensure user owns the order (or is superuser)
    if request.user != order.user and not request.user.is_superuser:
        return render(request, '403.html', status=403) # Or simple HttpResponseForbidden
    return render(request, 'invoice.html', {'order': order})
