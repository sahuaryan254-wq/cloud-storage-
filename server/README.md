# Mock backend for local frontend testing

This lightweight Express server provides minimal endpoints expected by the frontend while you don't have the real backend running.

Endpoints:
- `GET /health` — health check
- `POST /api/auth/signup` — accepts `{ fullName, email, password }` and returns a mock token and user
- `POST /api/auth/login` — accepts `{ email, password }` and returns mock token/user if previously signed up

Quick start:

1. Open a terminal and change to this folder:

```powershell
cd server
```

2. Install dependencies:

```powershell
npm install
```

3. Start the server:

```powershell
npm run start
# or for auto-restart during edits:
npm run dev
```

The server listens on port `5000` by default. The frontend expects the backend at `http://localhost:5000`.
