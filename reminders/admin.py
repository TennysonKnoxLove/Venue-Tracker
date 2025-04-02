from django.contrib import admin
from .models import ReminderCategory, Reminder, ReminderNotification

@admin.register(ReminderCategory)
class ReminderCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'user')
    list_filter = ('user',)
    search_fields = ('name',)

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('title', 'due_date', 'category', 'priority', 'completed', 'user')
    list_filter = ('completed', 'priority', 'category', 'user', 'recurrence')
    search_fields = ('title', 'description')
    date_hierarchy = 'due_date'

@admin.register(ReminderNotification)
class ReminderNotificationAdmin(admin.ModelAdmin):
    list_display = ('reminder', 'sent_at', 'read', 'read_at')
    list_filter = ('read', 'reminder__user')
    date_hierarchy = 'sent_at' 