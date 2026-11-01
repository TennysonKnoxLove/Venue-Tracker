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

Create an admin user in another terminal:

```bash
docker compose exec backend python manage.py createsuperuser
```

You can also register a normal account at [http://localhost:3000/register](http://localhost:3000/register).

Stop the stack:

```bash
docker compose down
```

Add `-v` only when you want to delete the Postgres data volume as well.

## Run without Docker

### 1. Environment

```bash
cp .env.example .env
```

For a local API process, set:

```bash
DEBUG=1
SECRET_KEY=any-long-random-string
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Leave `DATABASE_URL` unset to use SQLite (`db.sqlite3` in the project root). To use Postgres on your machine instead, create the database and point at localhost:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/venue_tracker
```

The hostname `db` in `.env.example` only resolves inside Docker Compose.

### 2. Backend

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The API listens on [http://localhost:8000](http://localhost:8000). Run these commands from `backend/` so Django can find `settings`.

### 3. Frontend

In a second terminal, from the project root:

```bash
cd frontend
npm install
npm start
```

The dev server opens [http://localhost:3000](http://localhost:3000) and calls `http://localhost:8000/api` unless you set `REACT_APP_API_URL`.

## Environment variables

| Variable                                               | Required                             | Purpose                                                                                       |
| ------------------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------------------- |
| `DEBUG`                                                | Yes for local                        | `1` prints email to the console and serves uploaded media. Use `0` outside local development. |
| `SECRET_KEY`                                           | Yes in production                    | Django secret. A built-in insecure default is used when this is empty.                        |
| `DATABASE_URL`                                         | No                                   | Postgres URL. Omitted means SQLite. Development Compose overrides this.                       |
| `OPENAI_API_KEY`                                       | No                                   | Required for venue discovery and generated email. Other pages work without it.                |
| `OPENAI_MODEL`                                         | No                                   | Defaults to `gpt-3.5-turbo` in `.env.example`.                                                |
| `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | No                                   | SMTP settings used when `DEBUG` is not `1`.                                                   |
| `ALLOWED_HOSTS`                                        | Yes in production                    | Comma-separated hostnames. Do not use `*`.                                                    |
| `CORS_ALLOWED_ORIGINS`                                 | Yes when the UI is on another origin | Comma-separated browser origins, such as `http://localhost:3000`.                             |
| `REACT_APP_API_URL`                                    | No                                   | API base URL for the frontend. Defaults to `http://localhost:8000/api`.                       |

Copy the root `.env.example` to `.env`. Docker Compose reads that file, and Django finds it from `backend/` as well. Do not commit `.env`.

## Production Compose

`docker-compose.prod.yml` runs prebuilt images and a Postgres 14 database. It reads `POSTGRES_PASSWORD` from the project `.env` file. Set `DEBUG=0`, a real `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `REACT_APP_API_URL` before starting it:

```bash
docker compose -f docker-compose.prod.yml up -d
```

The database password is fixed the first time the `postgres_data` volume is created. Changing `POSTGRES_PASSWORD` later does not update an existing volume.

## Useful commands

```bash
docker compose logs -f backend
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

Frontend checks, from `frontend/`:

```bash
npm test
npm run build
```
