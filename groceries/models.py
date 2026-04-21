from django.db import models


class GroceryItem(models.Model):
    CATEGORY_CHOICES = [
        ('fruits', 'Fruits'),
        ('vegetables', 'Vegetables'),
        ('dairy', 'Dairy'),
        ('bakery', 'Bakery'),
        ('meat', 'Meat'),
        ('beverages', 'Beverages'),
        ('snacks', 'Snacks'),
        ('other', 'Other'),
    ]

    UNIT_CHOICES = [
        ('units', 'Units (pcs)'),
        ('kg', 'Kilograms (kg)'),
        ('g', 'Grams (g)'),
        ('ltr', 'Liters (ltr)'),
        ('ml', 'Milliliters (ml)'),
        ('pkt', 'Packets (pkt)'),
        ('box', 'Box'),
    ]

    name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='units')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    status = models.BooleanField(default=False)  # False=pending, True=purchased
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.quantity})"

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': str(self.quantity).rstrip('0').rstrip('.') if '.' in str(self.quantity) else str(self.quantity),
            'unit': self.unit,
            'unit_display': self.get_unit_display(),
            'category': self.category,
            'category_display': self.get_category_display(),
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.strftime('%b %d, %Y'),
        }
