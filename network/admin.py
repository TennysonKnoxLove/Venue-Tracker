from django.contrib import admin
from .models import Industry, Connection, Interaction

@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name', 'description')

@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'industry', 'relationship', 'user', 'last_contact')
    list_filter = ('relationship', 'industry', 'user')
    search_fields = ('name', 'company', 'position', 'notes', 'location')
    date_hierarchy = 'created_at'

@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ('interaction_type', 'connection', 'date', 'follow_up_date', 'completed')
    list_filter = ('interaction_type', 'completed', 'connection__user')
    search_fields = ('notes', 'follow_up_notes', 'connection__name')
    date_hierarchy = 'date' 