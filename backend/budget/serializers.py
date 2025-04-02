from rest_framework import serializers
from .models import Expense, ExpenseCategory

class ExpenseCategorySerializer(serializers.ModelSerializer):
    """Serializer for expense categories"""
    expense_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'color', 'expense_count', 'created_at']
        read_only_fields = ['created_at']
    
    def get_expense_count(self, obj):
        """Get the number of expenses in this category"""
        return obj.expenses.count()

class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for expenses"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    receipt_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Expense
        fields = ['id', 'amount', 'description', 'location', 'category', 'category_name', 
                  'category_color', 'receipt_image', 'receipt_url', 'date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_receipt_url(self, obj):
        """Get the URL for the receipt image if it exists"""
        if obj.receipt_image:
            return self.context['request'].build_absolute_uri(obj.receipt_image.url)
        return None

class ExpenseDetailSerializer(ExpenseSerializer):
    """Detailed serializer for a single expense"""
    
    class Meta(ExpenseSerializer.Meta):
        fields = ExpenseSerializer.Meta.fields 