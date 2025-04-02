# Venue Tracker

A web application for tracking music venues, featuring AI-powered venue discovery for hip-hop and R&B performances, professional networking tools, and reminder management.

## Features

- User authentication with JWT and password reset capability
- Venue management with state-based organization
- AI-powered venue discovery using OpenAI
- Audio file management
- Contact history tracking
- Professional networking tools
- Event and opportunity management
- Reminder system with notifications
- Chat functionality with WebSockets
- Email outreach generation
- Budget tracking

## Tech Stack

- **Frontend**: React, JavaScript, Tailwind CSS
- **Backend**: Django, Django REST Framework, Channels (WebSockets)
- **Database**: PostgreSQL
- **Caching**: Redis
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose
- An OpenAI API key for venue discovery features

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/TennysonKnoxLove/Venue-Tracker.git
   cd Venue-Tracker
   ```

2. Create a `.env` file:
   ```
   cp .env.example .env
   ```

3. Edit the `.env` file to add your configuration:
   - Add your OpenAI API key
   - Configure email settings if needed
   - Adjust other settings as necessary

4. Start the application with Docker Compose:
   ```
   docker-compose up -d
   ```

5. Create database migrations and superuser:
   ```
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin interface: http://localhost:8000/admin

## Development

### Code Organization

- **Frontend**: The React application is in the `frontend/` directory
- **Backend**: The Django application is in the `backend/` directory
- **Docker**: Configuration files for containerization

### Running Tests

```
docker-compose exec backend python manage.py test
```

### Email Setup

For local development, emails are sent to the console by default. To configure real email sending:

1. Edit the `.env` file with your email credentials
2. If using Gmail, you'll need to create an App Password for your account

## Deployment

### Digital Ocean

1. Create a Digital Ocean account
2. Install the Digital Ocean CLI
3. Deploy using the Digital Ocean App Platform:
   ```
   doctl apps create --spec app.yaml
   ```

### Other Cloud Providers

The application can be deployed to any cloud provider that supports Docker containers.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 