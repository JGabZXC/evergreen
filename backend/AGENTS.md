# Global Agent & Repository Instructions

Purpose: repository-wide instructions for contributors and automated agents. Keep this file small and actionable.

Development principles
- Follow Clean Code, Clean Architecture, SOLID, KISS, DRY and YAGNI.
- Keep `src/domain` framework-agnostic. Application/business logic belongs in `src/application`. Persistence and adapters go into `src/infrastructure`. HTTP adapters and middleware go into `src/interfaces`.
- Depend on interfaces/abstractions, not concrete implementations. Use constructor injection for services and repositories.

Testing
- We use Vitest for both unit and integration tests.
- Unit tests: keep fast, isolated, and focused on single classes/functions. Place them alongside code or under `test/unit`.
- Integration tests: exercise use-cases and adapters (DB, HTTP) and may run with in-memory or test containers. Place them under `test/integration` and mark with `.int.test.ts` suffix.
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
- When you change `prisma/schema.prisma`, run migrations in the running container and regenerate the client as follows (from project root):

```bash
docker-compose exec -it backend npx prisma migrate dev --name "<descriptive-name>"
docker-compose exec -it backend npx prisma generate
npx prisma generate
```

Practical rules
- Never commit secrets or `.env` files with secrets. Use environment variables and a small typed config module (e.g. `src/config`).
- Hash and never store plaintext passwords. Use bcrypt/argon2 with sensible defaults.
- Use minimal JWT claims (sub, email, role) and catch/handle verification errors.
- Always use generic auth failure messages to avoid account enumeration.

Repository automation
- Keep CI/PR checks to run lint and tests. Prefer fast incremental checks in PRs and fuller checks in main branch CI.

If you need to change these instructions, update this file and mention reviewers in the PR. Keep changes minimal and deliberate.

