# Generated by Django 4.2.7 on 2025-06-04 21:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('networking', '0002_opportunity_milestone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='eventtype',
            name='name',
            field=models.CharField(max_length=50, unique=True),
        ),
    ]
