# Evergreen School Academy - Agent Instructions

## Architecture

**Monorepo** with two separate build/test outputs:

- **Backend**: Express + Prisma + PostgreSQL (port 3000)
- **Frontend**: React 19 + Vite (port 5173)

## Commands

### Backend (from `backend/`)

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run lint         # ESLint check
npm test             # Run all tests
npm run test:unit    # Unit tests only (.test.ts)
npm run test:int     # Integration tests only (.int.test.ts)
```

### Frontend (from `frontend/`)

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # ESLint check
npm test             # Run tests
npm run test:ui      # Run tests with UI
```

### Database (Prisma)

Run migrations from `backend/` directory:

```bash
npx prisma migrate dev --name "<migration-name>"
npx prisma generate
```

## Docker Development

From repository root:

```bash
docker-compose up --build
```

This starts frontend, backend, and postgres containers.

## Important Files

- **Backend details**: See `backend/AGENTS.md` for architecture, testing patterns, and migration rules.
- **Frontend structure**: Feature-based at `src/features/`, shared components at `src/shared/`.

## Key Conventions

- Clean Architecture in backend: `domain/` → `application/` → `infrastructure/` → `interfaces/`
- Prisma client generated at `src/generated/prisma/`
- Tests colocated: `test/unit/` and `test/integration/` in backend
- Passwords hashed (bcrypt), never stored plaintext
- JWT minimal claims (sub, email, role); generic auth failure messages