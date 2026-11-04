from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('networking', '0004_remove_unused_networking_models'),
    ]

    operations = [
        migrations.AddField(
            model_name='opportunity',
            name='contact_person',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
