# Generated by Django 4.2.7 on 2025-03-30 03:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reminders', '0006_auto_20250329_2325'),
    ]

    operations = [
        migrations.AddField(
            model_name='remindercategory',
            name='icon',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
