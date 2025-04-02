# API Endpoints

## Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration
- `GET /api/auth/user/` - Get current user
- `PATCH /api/auth/user/` - Update user information

## States
- `GET /api/states/` - List all states
- `POST /api/states/` - Create new state
- `GET /api/states/:id/` - Get state details
- `PUT /api/states/:id/` - Update state
- `DELETE /api/states/:id/` - Delete state

## Venues
- `GET /api/venues/` - List all venues (with optional filtering)
- `POST /api/venues/` - Create new venue
- `GET /api/venues/:id/` - Get venue details
- `PUT /api/venues/:id/` - Update venue
- `DELETE /api/venues/:id/` - Delete venue
- `GET /api/states/:id/venues/` - List venues for a specific state

## Contact History
- `GET /api/contacts/` - List all contact history entries
- `POST /api/contacts/` - Create new contact entry
- `GET /api/contacts/:id/` - Get contact details
- `PUT /api/contacts/:id/` - Update contact
- `DELETE /api/contacts/:id/` - Delete contact
- `GET /api/venues/:id/contacts/` - List contacts for a specific venue
- `GET /api/contacts/pending-followups/` - Get contacts with pending follow-ups

## Audio Files
- `GET /api/audio/` - List all audio files
- `POST /api/audio/` - Upload new audio file
- `GET /api/audio/:id/` - Get audio file details
- `DELETE /api/audio/:id/` - Delete audio file
- `POST /api/audio/:id/edit/` - Apply edit to audio file
- `GET /api/audio/:id/edits/` - Get edit history for audio file
- `GET /api/audio/:id/download/` - Download processed audio file

## AI Venue Search
- `POST /api/ai/search/` - Search for venues using AI
- `GET /api/ai/search/history/` - Get search history
- `GET /api/ai/search/:id/` - Get specific search results
- `POST /api/ai/search/:id/import/` - Import AI search results to venues 