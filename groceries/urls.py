from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    
    # API endpoints
    path('api/items/', views.get_items, name='get_items'),
    path('api/items/add/', views.add_item, name='add_item'),
    path('api/items/<int:item_id>/update/', views.update_item, name='update_item'),
    path('api/items/<int:item_id>/toggle/', views.toggle_status, name='toggle_status'),
    path('api/items/<int:item_id>/delete/', views.delete_item, name='delete_item'),
]
