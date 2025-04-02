# Project Structure

## Frontend
```
frontend/
├── public/             # Static files
│   ├── favicon.ico
│   ├── index.html
│   └── assets/         # Images, fonts, etc.
├── src/
│   ├── components/     # Reusable React components
│   │   ├── auth/       # Login, register components
│   │   ├── layout/     # Layout components (navbar, sidebar)
│   │   ├── venues/     # Venue management components
│   │   ├── audio/      # Audio editor components
│   │   └── contacts/   # Contact tracking components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── context/        # React context providers
│   ├── api/            # API service functions
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles and Tailwind config
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main App component
│   └── index.tsx       # Application entry point
└── package.json        # Frontend dependencies
```

## Backend
```
backend/
├── venue_tracker/      # Django project
│   ├── settings/       # Environment-specific settings
│   ├── urls.py         # URL routing
│   └── wsgi.py         # WSGI entry point
├── api/                # Django apps
│   ├── users/          # User management
│   ├── venues/         # Venue management
│   ├── audio/          # Audio processing
│   └── contacts/       # Contact history
├── utils/              # Utility functions
│   └── ai/             # OpenAI integration
├── requirements.txt    # Python dependencies
└── manage.py           # Django management script
```

## Docker and Deployment
```
docker/
├── docker-compose.yml  # Service orchestration
├── frontend.Dockerfile # Frontend container config
└── backend.Dockerfile  # Backend container config
```

## CI/CD
```
.github/
└── workflows/          # GitHub Actions workflows
``` 