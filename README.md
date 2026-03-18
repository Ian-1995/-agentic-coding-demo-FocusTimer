# FocusTimer

A full-stack Pomodoro Timer web application built with React and Express.

## Features

- **Pomodoro Timer** - Configurable work/break cycles with automatic phase transitions
- **Browser Notifications** - Audio alerts and system notifications when a session completes
- **Task Management** - Create, archive, and associate tasks with pomodoro sessions
- **Statistics** - Daily/weekly summaries, per-task breakdowns, trend charts, and hourly distribution
- **Cross-Device Sync** - Register an account to sync sessions and settings across devices
- **Offline-First** - Works without an account using localStorage; data syncs automatically after login
- **Data Export** - Download your session history as CSV
- **Responsive** - Optimized for desktop and mobile browsers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | PostgreSQL, Prisma ORM |
| Deployment | Vercel (frontend), Railway (backend + DB) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)

### Setup

```bash
# Clone the repository
git clone https://github.com/<your-username>/focustimer.git
cd focustimer/focustimer

# Install dependencies
npm install

# Copy environment variables and fill in your values
cp .env.example .env

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start frontend dev server (http://localhost:5173)
npm run dev

# Start backend dev server (http://localhost:4000) in another terminal
npm run dev:server
```

### Environment Variables

See [focustimer/.env.example](focustimer/.env.example) for the full list. `JWT_SECRET` and `JWT_REFRESH_SECRET` are **required** - the server will not start without them.

## Project Structure

```
focustimer/
├── src/                  # Frontend (React)
│   ├── components/       # Shared UI components
│   ├── modules/          # Feature modules (timer, tasks, stats, auth, settings)
│   ├── stores/           # Zustand state stores
│   ├── services/         # API client, localStorage, sync
│   └── hooks/            # Custom React hooks
├── server/               # Backend (Express)
│   ├── routes/           # API route handlers
│   ├── middleware/        # Auth, validation, error handling
│   └── services/         # Business logic
├── prisma/               # Database schema
└── docs/                 # Project documentation (PRD, Architecture, etc.)
```

## Documentation

This project follows a structured documentation system:

| Doc | Description |
|-----|------------|
| DOC-02 | Product Requirements Document (PRD) |
| DOC-03 | System Architecture |
| DOC-04 | Delivery Plan |
| DOC-05 | Data & Schema Spec |
| DOC-06 | API Contract |

See [docs/00_Document_Inventory.md](docs/00_Document_Inventory.md) for the full index.

## Development Phases

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | Timer, notifications, localStorage, Vercel deploy | In Progress |
| Phase 2 | Auth, tasks, sessions, stats, backend + DB | Planned |
| Phase 3 | Custom settings, charts, export, password reset | Planned |

## License

Private - All rights reserved.
