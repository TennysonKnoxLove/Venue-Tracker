from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import ReminderCategory, Reminder, ReminderNotification
from .serializers import (
    ReminderCategorySerializer,
    ReminderSerializer,
    ReminderDetailSerializer,
    ReminderNotificationSerializer
)

class ReminderCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for reminder categories"""
    serializer_class = ReminderCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return categories for the authenticated user"""
        return ReminderCategory.objects.filter(user=self.request.user)

class ReminderViewSet(viewsets.ModelViewSet):
    """ViewSet for reminders"""
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'priority', 'created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer class"""
        if self.action == 'retrieve':
            return ReminderDetailSerializer
        return ReminderSerializer
    
    def get_queryset(self):
        """Return reminders for the authenticated user"""
        return Reminder.objects.filter(user=self.request.user)
    
    def get_serializer_context(self):
        """Pass additional context to serializer"""
        context = super().get_serializer_context()
        # Add user-filtered category queryset to context
        context.update({
            'category_queryset': ReminderCategory.objects.filter(user=self.request.user)
        })
        return context
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark reminder as completed"""
        reminder = self.get_object()
        reminder.mark_completed()
        return Response({'status': 'reminder completed'})
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Return overdue reminders"""
        overdue_reminders = Reminder.objects.filter(
            user=request.user,
            completed=False,
            due_date__lt=timezone.now()
        ).order_by('due_date')
        serializer = self.get_serializer(overdue_reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Return upcoming reminders"""
        # Get reminders due in the next 7 days
        upcoming_reminders = Reminder.objects.filter(
            user=request.user,
            completed=False,
            due_date__gte=timezone.now(),
            due_date__lte=timezone.now() + timezone.timedelta(days=7)
        ).order_by('due_date')
        serializer = self.get_serializer(upcoming_reminders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Return reminders due today"""
        today = timezone.now().date()
        today_start = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
        today_end = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.max.time()))
        
        today_reminders = Reminder.objects.filter(
            user=request.user,
            completed=False,
            due_date__gte=today_start,
            due_date__lte=today_end
        ).order_by('due_date')
        serializer = self.get_serializer(today_reminders, many=True)
        return Response(serializer.data)

class ReminderNotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for reminder notifications"""
    serializer_class = ReminderNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return notifications for the authenticated user's reminders"""
        return ReminderNotification.objects.filter(
            reminder__user=self.request.user
        ).order_by('-sent_at')
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.mark_read()
        return Response({'status': 'notification marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        notifications = self.get_queryset().filter(read=False)
        for notification in notifications:
            notification.mark_read()
        return Response({'status': f'{notifications.count()} notifications marked as read'}) 