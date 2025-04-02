from django.db import models
from django.conf import settings
from django.utils import timezone

class ExpenseCategory(models.Model):
    """Categories for expenses (e.g., Food, Travel, Entertainment)"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expense_categories')
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=20, default="#6c757d")  # Color for UI display
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Expense Categories"
        ordering = ['name']
        unique_together = ['user', 'name']
    
    def __str__(self):
        return self.name

class Expense(models.Model):
    """Model for tracking expenses"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    receipt_image = models.ImageField(upload_to='receipts/%Y/%m/%d/', null=True, blank=True)
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"${self.amount} - {self.description} ({self.date})"
    
    @property
    def month_year(self):
        """Return month and year string for grouping expenses"""
        return self.date.strftime('%B %Y')
