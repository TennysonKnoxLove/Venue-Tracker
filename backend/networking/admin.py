from django.contrib import admin
from .models import EventType, Event, Opportunity, Milestone, NetworkingSearchQuery, EventAttendee

@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'event_type', 'date', 'location', 'user')
    list_filter = ('event_type', 'date', 'user')
    search_fields = ('name', 'description', 'location')

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'opportunity_type', 'status', 'deadline', 'user')
    list_filter = ('opportunity_type', 'status', 'remote', 'user')
    search_fields = ('title', 'organization', 'description')

@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'opportunity', 'date', 'completed')
    list_filter = ('completed', 'date')
    search_fields = ('title', 'description')

@admin.register(NetworkingSearchQuery)
class NetworkingSearchQueryAdmin(admin.ModelAdmin):
    list_display = ('user', 'city', 'state', 'radius', 'created_at')
    list_filter = ('created_at', 'state')
    search_fields = ('city', 'state')

@admin.register(EventAttendee)
class EventAttendeeAdmin(admin.ModelAdmin):
    list_display = ('event', 'contact', 'get_event_user')
    search_fields = ('event__name', 'contact__name')

    def get_event_user(self, obj):
        return obj.event.user
    get_event_user.short_description = 'Event User'
