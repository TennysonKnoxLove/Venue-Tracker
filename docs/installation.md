# Installation Guide

## Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL (v13+)
- Docker and Docker Compose (for containerized deployment)

## Local Development Setup

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

4. Start the development server:
   ```
   npm start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   DEBUG=True
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgres://user:password@localhost:5432/venue_tracker
   OPENAI_API_KEY=your-openai-api-key
   ```

5. Run database migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```
   python manage.py runserver
   ```

## Docker Deployment

1. Build and start the containers:
   ```
   docker-compose up -d --build
   ```

2. Run migrations:
   ```
   docker-compose exec backend python manage.py migrate
   ```

3. Create a superuser:
   ```
   docker-compose exec backend python manage.py createsuperuser
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin interface: http://localhost:8000/admin

## Digital Ocean Deployment

1. Install Digital Ocean CLI:
   ```
   curl -sL https://github.com/digitalocean/doctl/releases/download/v1.X.X/doctl-1.X.X-linux-amd64.tar.gz | tar -xzv
   sudo mv doctl /usr/local/bin
   ```

2. Authenticate with Digital Ocean:
   ```
   doctl auth init
   ```

3. Create App Spec file `app.yaml`:
   ```yaml
   name: venue-tracker
   services:
     - name: backend
       github:
         repo: your-github-username/venue-tracker
         branch: main
       dockerfile_path: docker/backend.Dockerfile
       http_port: 8000
       routes:
         - path: /api
     - name: frontend
       github:
         repo: your-github-username/venue-tracker
         branch: main
       dockerfile_path: docker/frontend.Dockerfile
       http_port: 80
       routes:
         - path: /
   databases:
     - name: db
       engine: PG
       version: "13"
   ```

4. Deploy the application:
   ```
   doctl apps create --spec app.yaml
   ```

5. Set environment variables in the Digital Ocean dashboard.

## Setting up OpenAI API

1. Create an account at [OpenAI Platform](https://platform.openai.com/)
2. Generate an API key in the API keys section
3. Add the key to your `.env` file or environment variables:
   ```
   OPENAI_API_KEY=your-api-key
   ```

4. Configure rate limiting in the backend settings to avoid excessive API usage. 