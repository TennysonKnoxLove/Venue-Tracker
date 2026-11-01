from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
import datetime
from .models import Expense, ExpenseCategory
from .serializers import ExpenseSerializer, ExpenseCategorySerializer

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for expense categories"""
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return categories for the authenticated user"""
        return ExpenseCategory.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Save the user when creating a category"""
        serializer.save(user=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    """ViewSet for expenses"""
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return expenses for the authenticated user"""
        queryset = Expense.objects.filter(user=self.request.user)
        
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset
    
    def perform_create(self, serializer):
        """Save the user when creating an expense"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get a summary of expenses"""
        queryset = self.get_queryset()
        
        total = queryset.aggregate(total=Sum('amount'))['total'] or 0
        
        by_category = []
        categories = ExpenseCategory.objects.filter(user=request.user)
        for category in categories:
            category_total = queryset.filter(category=category).aggregate(total=Sum('amount'))['total'] or 0
            if category_total > 0:
                by_category.append({
                    'id': category.id,
                    'name': category.name,
                    'color': category.color,
                    'total': category_total
                })
        
        uncategorized_total = queryset.filter(category__isnull=True).aggregate(total=Sum('amount'))['total'] or 0
        if uncategorized_total > 0:
            by_category.append({
                'id': None,
                'name': 'Uncategorized',
                'color': '#6c757d',
                'total': uncategorized_total
            })
        
        by_month = []
        start_date = queryset.order_by('date').values_list('date', flat=True).first()
        end_date = queryset.order_by('-date').values_list('date', flat=True).first()
        
        if start_date and end_date:
            current_date = start_date.replace(day=1)
            while current_date <= end_date:
                next_month = current_date.replace(day=28) + datetime.timedelta(days=4)
                next_month = next_month.replace(day=1)
                
                month_total = queryset.filter(date__gte=current_date, date__lt=next_month).aggregate(total=Sum('amount'))['total'] or 0
                if month_total > 0:
                    by_month.append({
                        'month': current_date.strftime('%B %Y'),
                        'total': month_total
                    })
                
                current_date = next_month
        
        return Response({
            'total': total,
            'by_category': by_category,
            'by_month': by_month
        })
