# Venue Tracker

Venue Tracker is a web app for managing venues, budgets, reminders, networking, chat, outreach email, and audio. The API is Django and Django REST Framework. The UI is a React app. Optional OpenAI features cover venue discovery and email generation.

The frontend runs at [http://localhost:3000](http://localhost:3000). The API runs at [http://localhost:8000/api](http://localhost:8000/api). Django admin is at [http://localhost:8000/admin](http://localhost:8000/admin).

## Prerequisites

**Docker (recommended)**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

## Run with Docker

From the project root:

```bash
cp .env.example .env
```

Open `.env` and set:

- `DEBUG=1` so local password-reset email prints in the backend logs
- `SECRET_KEY` to any long random string
- `OPENAI_API_KEY` if you want venue discovery or the email generator

`docker-compose.yml` starts its own Postgres database with user `postgres`, password `postgres`, and database `venue_tracker`. Those values in `.env` are for the production compose file and do not change the development database.

```bash
docker compose up --build
```

The first start installs dependencies, applies migrations, and serves both apps. Leave this terminal running.

Register a normal account at [http://localhost:3000/register](http://localhost:3000/register).

Stop the stack:

```bash
docker compose down
```

Add `-v` only when you want to delete the Postgres data volume as well.
