from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import GroceryItem
from .forms import GroceryItemForm
import json

def index(request):
    """Render the main single-page application."""
    return render(request, 'groceries/index.html')

@require_http_methods(["GET"])
def get_items(request):
    """API endpoint to list all items with search and category filters."""
    query = request.GET.get('q', '')
    category = request.GET.get('category', '')
    status = request.GET.get('status', '')

    items = GroceryItem.objects.all()

    if query:
        items = items.filter(name__icontains=query)
    if category and category != 'all':
        items = items.filter(category=category)
    if status == 'purchased':
        items = items.filter(status=True)
    elif status == 'pending':
        items = items.filter(status=False)

    return JsonResponse({'items': [item.to_dict() for item in items]})

@require_http_methods(["POST"])
def add_item(request):
    """API endpoint to create a new grocery item."""
    try:
        data = json.loads(request.body)
        form = GroceryItemForm(data)
        if form.is_valid():
            item = form.save()
            return JsonResponse({'success': True, 'item': item.to_dict()}, status=201)
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

@require_http_methods(["PUT"])
def update_item(request, item_id):
    """API endpoint to update an existing item."""
    item = get_object_or_404(GroceryItem, id=item_id)
    try:
        data = json.loads(request.body)
        form = GroceryItemForm(data, instance=item)
        if form.is_valid():
            item = form.save()
            return JsonResponse({'success': True, 'item': item.to_dict()})
        return JsonResponse({'success': False, 'errors': form.errors}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

@require_http_methods(["PATCH"])
def toggle_status(request, item_id):
    """API endpoint to toggle an item's status (purchased/pending)."""
    item = get_object_or_404(GroceryItem, id=item_id)
    item.status = not item.status
    item.save()
    return JsonResponse({'success': True, 'item': item.to_dict()})

@require_http_methods(["DELETE"])
def delete_item(request, item_id):
    """API endpoint to delete an item."""
    item = get_object_or_404(GroceryItem, id=item_id)
    item.delete()
    return JsonResponse({'success': True})
