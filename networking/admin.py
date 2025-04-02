from django.contrib import admin
from .models import NetworkingEvent, NetworkingOpportunity, EventAttendee, ApplicationMilestone

@admin.register(NetworkingEvent)
class NetworkingEventAdmin(admin.ModelAdmin):
    list_display = ('name', 'event_type', 'start_date', 'end_date', 'location', 'virtual', 'user')
    list_filter = ('event_type', 'virtual', 'registered', 'user', 'industries')
    search_fields = ('name', 'description', 'location', 'notes')
    date_hierarchy = 'start_date'

@admin.register(NetworkingOpportunity)
class NetworkingOpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'opportunity_type', 'status', 'deadline', 'user')
    list_filter = ('opportunity_type', 'status', 'remote', 'user')
    search_fields = ('title', 'organization', 'description', 'requirements', 'notes')
    date_hierarchy = 'deadline'

@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ('connection', 'event', 'created_at')
    list_filter = ('event__event_type', 'connection__user', 'event__user')
    search_fields = ('connection__name', 'event__name', 'notes')
    date_hierarchy = 'created_at'

@admin.register(ApplicationMilestone)
class ApplicationMilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'opportunity', 'date', 'completed')
    list_filter = ('completed', 'opportunity__status', 'opportunity__user')
    search_fields = ('title', 'description', 'opportunity__title')
    date_hierarchy = 'date' 