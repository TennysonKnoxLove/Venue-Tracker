from rest_framework import serializers
from .models import ReminderCategory, Reminder, ReminderNotification

class ReminderCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReminderCategory
        fields = ['id', 'name', 'color', 'icon', 'user']
        read_only_fields = ['user']
        
    def create(self, validated_data):
        """Set the user from the request context"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ReminderNotificationSerializer(serializers.ModelSerializer):
    reminder_title = serializers.CharField(source='reminder.title', read_only=True)
    
    class Meta:
        model = ReminderNotification
        fields = ['id', 'reminder', 'reminder_title', 'sent_at', 'read', 'read_at']
        read_only_fields = ['sent_at', 'read_at']

class ReminderSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category = serializers.PrimaryKeyRelatedField(
        queryset=ReminderCategory.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Reminder
        fields = [
            'id', 'user', 'title', 'description', 'due_date', 'completed',
            'completed_date', 'category', 'category_name', 'category_color',
            'priority', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'completed_date', 'created_at', 'updated_at']
        
    def create(self, validated_data):
        """Set the user from the request context"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter category queryset to only include the current user's categories
        if self.context and 'request' in self.context:
            user = self.context['request'].user
            if user and user.is_authenticated:
                self.fields['category'].queryset = ReminderCategory.objects.filter(user=user)

class ReminderDetailSerializer(ReminderSerializer):
    notifications = ReminderNotificationSerializer(many=True, read_only=True)
    
    class Meta(ReminderSerializer.Meta):
        fields = ReminderSerializer.Meta.fields + ['notifications'] 