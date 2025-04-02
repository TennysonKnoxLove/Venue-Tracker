from networking.models import EventType
from django.db import transaction

with transaction.atomic():
    # Create sample event types
    event_types = [
        {'name': 'Conference', 'description': 'Large industry gathering with multiple speakers and sessions'},
        {'name': 'Workshop', 'description': 'Interactive session focused on learning specific skills'},
        {'name': 'Meetup', 'description': 'Casual networking event'},
        {'name': 'Showcase', 'description': 'Event to demonstrate work or products'},
        {'name': 'Festival', 'description': 'Large-scale celebration or event with multiple activities'},
        {'name': 'Competition', 'description': 'Competitive event with judging and prizes'},
        {'name': 'Seminar', 'description': 'Educational event with one or more speakers'},
        {'name': 'Party', 'description': 'Social celebration event'}
    ]
    
    for et in event_types:
        EventType.objects.get_or_create(name=et['name'], defaults={'description': et['description']})
    
    print(f'Created {len(event_types)} event types')
    print('Current event types:')
    for et in EventType.objects.all():
        print(f'- {et.name}: {et.description}') 