# MaatriShield AI — Full-stack prototype

Responsive React + Vite frontend with a FastAPI backend and SQL database. It includes account registration/sign-in, JWT sessions, IVF/non-IVF onboarding saved to the backend, and starter API endpoints for profiles, appointments, health notes, and a safety-template assistant response.

> **Healthcare safety:** this is a hackathon prototype, not a medical device or production healthcare service. Use synthetic data only. Do not enter real patient information. Before deployment, add professional clinical review, privacy/legal review, secure secrets, HTTPS, backups, audit logging, rate limits, account recovery, and a vetted AI provider if needed. The assistant endpoint is a deterministic safety template, not a connected LLM and not a diagnostic tool.

## Requirements
- Node.js 20+ recommended
- Python 3.10+

## 1. Start the backend
From the project root:

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

macOS/Linux:
```bash
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API creates `backend/maatrishield.db` automatically using SQLite for local development. Interactive API docs: http://127.0.0.1:8000/docs

Before deployment, set a secure `MAATRISHIELD_SECRET_KEY` environment variable. For PostgreSQL, set `DATABASE_URL` and install a compatible PostgreSQL driver (for example `psycopg[binary]`). Set `CORS_ORIGINS` to your exact deployed frontend origin(s).

## 2. Start the frontend
Open a second terminal at the project root:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually http://localhost:5173. The frontend defaults to the backend at `http://localhost:8000`; set `VITE_API_URL` at build time if the API is hosted elsewhere.

## Included API routes
- `GET /api/health` — service status
- `POST /api/auth/register` — create account, returns bearer token
- `POST /api/auth/login` — sign in, returns bearer token
- `GET /api/me` — current account
- `GET /api/profile`, `PUT /api/profile` — read/save IVF or non-IVF care profile
- `GET /api/appointments`, `POST /api/appointments` — appointment records
- `GET /api/notes`, `POST /api/notes` — health notes
- `POST /api/assistant` — safety-template response

Protected endpoints require `Authorization: Bearer <access_token>`.

## Current integration status
Registration/login and onboarding profile persistence are connected to the backend. The appointments, health-note, and assistant endpoints are available for frontend integration; some existing dashboard interactions are still demo/local UI state and do not yet call those routes. No real appointment provider, external AI model, clinical database, or healthcare system is connected.
