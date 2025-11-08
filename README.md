# 1v1me

A fast, simple platform for 1v1 minigames. Frontend is Next.js + Tailwind; backend is Spring Boot. The homepage offers a game selector; each game integrates with backend APIs over time.

## Tech Stack

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Backend: Java 21, Spring Boot 3, Maven
- Hosting: Vercel (frontend), Google Cloud Run (backend)

## Monorepo Layout

```
1v1me/
├── frontend/   # Next.js app (App Router)
│   ├── app/    # Pages and API routes
│   └── ...
├── backend/    # Spring Boot API
│   ├── src/main/java/com/onevoneme
│   └── ...
└── .github/workflows/backend-deploy-cloudrun.yml
```

## Local Development

Prereqs: Node.js 18+, Java 21, Maven

- Frontend
  - `cd frontend && npm install`
  - `npm run dev` → http://localhost:3000

- Backend
  - `cd backend && mvn -B -ntp spring-boot:run`
  - API base: http://localhost:8080 (`GET /api/health`)

## Environment

- Frontend (create `frontend/.env.local`)
  - `BACKEND_URL=http://localhost:8080/api`
  - `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080/api`
  - Next rewrites route `/api/*` → backend (uses either var)

## Deployment

- Backend: GitHub Action builds Docker, pushes to Artifact Registry, deploys Cloud Run, and outputs service URL.
- Frontend: Vercel auto-deploys on `master` push; workflow updates Vercel envs (`BACKEND_URL`, `NEXT_PUBLIC_BACKEND_URL`) to `<cloud-run-url>/api`.

## Status

- Minigames are being added; backend endpoints will evolve. Frontend can operate with placeholders when backend is not ready.

## Contributing

1. Create a branch: `git checkout -b feature/<name>`
2. Make changes and run local build/tests
3. Push and open a PR

## License

Private repository.
