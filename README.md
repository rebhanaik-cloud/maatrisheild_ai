# MaatriShield AI — Maternal Healthcare Support Platform

Responsive React + Vite frontend with a Python FastAPI backend and persistent SQL database. Features account registration/login with bcrypt password hashing, persistent JWT sessions, personalized IVF and non-IVF care onboarding, real database-backed appointment records, health notes and symptom logs, and an AI maternal care companion with safety triage.

> **Healthcare & Clinical Notice:** MaatriShield AI is a prototype care coordination web application, not a certified medical device, diagnostic system, or emergency responder. Use synthetic data for testing. Never enter confidential patient identifiable information. If sudden or severe maternal symptoms occur (e.g. heavy bleeding, severe pain, breathing difficulty, fluid leakage), seek immediate emergency medical care.

---

## Architecture & Integration Status

| Feature | Backend Endpoint | Status | Description |
| :--- | :--- | :--- | :--- |
| **Service Health** | `GET /api/health` | **Live / Real** | Verifies API and database connectivity status |
| **Authentication** | `POST /api/auth/register`, `POST /api/auth/login` | **Live / Real** | Bcrypt hashing (`rounds=12`), email normalization, JWT tokens |
| **Current User Session** | `GET /api/me` | **Live / Real** | Restores authenticated session on app launch |
| **Care Profile** | `GET /api/profile`, `PUT /api/profile` | **Live / Real** | Persists IVF/non-IVF pathway, name, and journey stage |
| **Appointments** | `GET /api/appointments`, `POST /api/appointments`, `DELETE /api/appointments/:id` | **Live / Real** | Creates, lists, and deletes user appointment records |
| **Health Notes** | `GET /api/notes`, `POST /api/notes`, `DELETE /api/notes/:id` | **Live / Real** | Daily mood check-in, symptoms, and questions saved to DB |
| **AI Companion** | `POST /api/assistant` | **Live / Real** | Safety triage template assistant (detects emergencies and IVF guidance) |
| **Document Hub** | Local simulated state | **Prototype UI** | Demonstrates record labeling; real storage requires encrypted cloud bucket (e.g. AWS S3/GCS) |

---

## Requirements
- **Node.js**: 20+
- **Python**: 3.10+ (tested through 3.15)
- **Database**: SQLite (built-in default for local development) or PostgreSQL (for Render/Supabase/Neon)

---

## 1. Running the Backend Locally

From the repository root:

```bash
cd backend
python -m venv .venv
```

**Windows PowerShell:**
```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**macOS / Linux:**
```bash
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- Local API URL: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### Running Backend Automated Tests
To run the end-to-end integration test suite verifying all routes (health, auth, profile, appointments, notes, assistant):
```powershell
python test_suite.py
```

---

## 2. Running the Frontend Locally

Open a second terminal at the repository root:

```bash
npm install
npm run dev
```

The application will run at `http://localhost:5173`. In development, it automatically connects to `http://localhost:8000`.

To build for production:
```bash
npm run build
```

---

## 3. Database Persistence & Deployment Configuration

### ⚠️ Important Note on Render SQLite Ephemeral Storage
By default, Render web services run on an **ephemeral disk**. If SQLite (`maatrishield.db`) is used on Render, any restarted or sleeping instance will reset the database, losing registered users and appointments.

### Recommended Render PostgreSQL Setup:
1. In the **Render Dashboard**, click **New +** → **PostgreSQL**.
2. Create a free or standard PostgreSQL instance named `maatrishield-db`.
3. Copy the **Internal Database URL** (or External URL).
4. In your Render Web Service settings, add the environment variable:
   - `DATABASE_URL` = `postgresql+psycopg://...` *(the backend automatically translates `postgres://` to `postgresql+psycopg://` if needed)*
   - `MAATRISHIELD_SECRET_KEY` = `<secure-random-32-char-string>`
   - `CORS_ORIGINS` = `https://maatrisheild-ai-three.vercel.app`
5. The backend automatically creates all tables (`users`, `profiles`, `appointments`, `health_notes`) on startup via SQLAlchemy.

---

## 4. Environment Variables Reference

### Frontend (`.env` or Vercel Environment Variables)
- `VITE_API_URL`: Backend base URL (e.g. `http://localhost:8000` for local dev or `https://maatrisheild-ai.onrender.com` for production)

### Backend (Render Environment Variables)
- `MAATRISHIELD_SECRET_KEY`: Long random string for JWT signature verification.
- `DATABASE_URL`: Connection string. Defaults to `sqlite:///./maatrishield.db`.
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins (e.g. `https://maatrisheild-ai-three.vercel.app`). Automatically permits localhost and `*.vercel.app` domains.
- `ACCESS_TOKEN_MINUTES`: Expiration time for JWT bearer tokens (defaults to `1440` minutes / 24 hours).
