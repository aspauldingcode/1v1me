<h2 align="center">1v1me</h2>

<p align="center">
  <a href="https://1v1me-flame.vercel.app">
    <img src="preview1.png" alt="1v1me Desktop Preview" width="90%">
  </a>
</p>

<p align="center">
  <b><a href="https://1v1me-flame.vercel.app">Play now at 1v1me-flame.vercel.app</a></b>
</p>

---

Jump into quick, head-to-head minigames on a lightweight platform.  
Looking for an instant 1v1? **1v1me** is ready when you are!  
Choose classics like **tic-tac-toe** or **rock-paper-scissors** and start playing in seconds!

Built with a **Next.js + Tailwind** frontend and a **Spring Boot** backend, the site lets you pick a username, jump into a queue, and connect to game APIs over REST.  
Play seamlessly on any device, desktop, laptop, or phone.
[View mobile preview →](preview2.png)


## Tech Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS
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
  - `cd frontend`
  - `npm install`
  - `npm run dev` → http://localhost:3000

- Backend
  - `cd backend`
  - `mvn -B -ntp spring-boot:run`
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

- Tic-tac-toe is fully functional with live frontend/backend integration.  
- Rock-paper-scissors needs fixes; targeting completion this week.  
- Goal: ship 100 minigames by month-end; backend endpoints and frontend placeholders will scale in parallel.

## Contributors / Thanks

<table>
  <tr>
    <td colspan="4" align="center">
      <img src="team.jpg" alt="Team Photo" width="100%">
    </td>
  </tr>
  <tr>
    <th>Liam Earl</th>
    <th>Alex Spaulding</th>
    <th>Mekai Johnson</th>
    <th>Joel Sivanish</th>
  </tr>
</table>

## License

See [LICENSE](LICENSE) for details.

All rights reserved.

This is proprietary software. No permission is granted to use, copy, modify,
distribute, or sublicense any part of this repository without prior written
authorization from the repository owners.
