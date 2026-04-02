# Copilot Instructions for my Evergreen School Academy

**Architecture Overview**
This is a full-stack school management system. The key architectural pattern is monorepo with separate build/test outputs:

- **Backend**: Express.JS API paired with Prisma ORM at http://localhost:3000
- **Frontend**: React + Vite SPA at http://localhost:5173; uses client-side routing with page-based state

**Agents & Workflow**
This document collects conventions and commands for developers and automation agents (CI, local scripts, Copilot helpers).

**Prisma + Docker (preferred)**
Use Docker when running migrations or generating the Prisma client to ensure the container environment matches runtime configuration.

Recommended sequence:

- Run the migration inside the backend container:
- Generate the Prisma client inside the container:
- Run a local generate to sync the generated client with your workspace (so the IDE and local scripts pick up changes): `npx prisma generate`

**Notes:**
-Ensure the compose service name backend matches docker-compose.yml. If you use a different compose file, add -f <file> (example: docker-compose -f docker-compose.dev.yml exec -it backend ...).
-Run these commands from the repository root where docker-compose.yml lives so relative paths and env files resolve.
-The local npx prisma generate ensures the generated client in your workspace (and your IDE) matches the container state.

**Quick Tips**
-If migrations fail due to DB connectivity, confirm the DB container is healthy and Prisma environment variables point to the correct host (often db in compose network).

- Use descriptive migration names (e.g., add-students-table) for clarity.
- CI pipelines should perform migrations in a controlled manner (review & backups) rather than migrate dev in production environments.

**Do**
Follow the commands above when running migrations or updating the Prisma schema.
