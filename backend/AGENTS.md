# Global Agent & Repository Instructions

Purpose: repository-wide instructions for contributors and automated agents. Keep this file small and actionable.

Development principles
- Follow Clean Code, Clean Architecture, SOLID, KISS, DRY and YAGNI.
- Keep `src/domain` framework-agnostic. Application/business logic belongs in `src/application`. Persistence and adapters go into `src/infrastructure`. HTTP adapters and middleware go into `src/interfaces`.
- Prisma access is infrastructure-only: the generated client lives in `src/generated/prisma`, and the runtime adapter is `src/infrastructure/database/prisma/db.ts` using `@prisma/adapter-pg`.
- Depend on interfaces/abstractions, not concrete implementations. Use constructor injection for services and repositories.

Testing
- We use Vitest for both unit and integration tests.
- Unit tests: keep fast, isolated, and focused on single classes/functions. Place them under `test/unit` and name them with `.unit.test.ts` (for example, `test/unit/use-cases/CreateSchoolYearUseCase.unit.test.ts`).
- Integration tests: exercise use-cases and HTTP adapters. Place them under `test/integration` and name them with `.int.test.ts` (for example, `test/integration/SchoolYearRoutes.int.test.ts`).
- Run tests locally with:

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:int
```

Migrations
- When you change `prisma/schema.prisma`, run migrations from the project root; Prisma reads `prisma.config.ts` and the schema in `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name "<descriptive-name>"
npx prisma generate
```

Practical rules
- Never commit secrets or `.env` files with secrets. Use environment variables and a small typed config module (e.g. `src/config`).
- Hash and never store plaintext passwords. Use bcrypt/argon2 with sensible defaults.
- Use minimal JWT claims (sub, email, role) and catch/handle verification errors.
- Always use generic auth failure messages to avoid account enumeration.

Repository automation
- Keep CI/PR checks to run lint and tests. Prefer fast incremental checks in PRs and fuller checks in main branch CI.
- Run `npm run build` before `npm run seed-users`; the seed entrypoint is `src/infrastructure/database/scripts/seeds/seed_initial_user.ts`, and the script executes `dist/infrastructure/database/scripts/seeds/seed_initial_user.js`.

If you need to change these instructions, update this file and mention reviewers in the PR. Keep changes minimal and deliberate.

