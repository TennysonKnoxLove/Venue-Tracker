from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('networking', '0003_alter_eventtype_name'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Milestone',
        ),
        migrations.DeleteModel(
            name='NetworkingSearchQuery',
        ),
    ]
