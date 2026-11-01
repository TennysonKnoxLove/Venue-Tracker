from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('email_generator', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='venueoutreach',
            name='venue',
        ),
    ]
