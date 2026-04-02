# syntax=docker/dockerfile:1
# ---------- Base deps stage (install deps reproducibly) ----------
FROM node:20-slim AS deps
WORKDIR /app

# Install minimal OS packages required for some native libs (prisma runtime needs openssl)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifests first to leverage Docker cache when deps don't change
COPY package*.json ./

# Use npm ci for reproducible installs (requires package-lock.json)
RUN npm ci

# ---------- Builder stage (has dev deps, prisma generate, build) ----------
FROM deps AS builder
WORKDIR /app

# Copy everything (source + prisma schema)
# We intentionally do NOT copy .env (use runtime envs instead)
COPY . .

# Generate Prisma client (will use prisma config in repo)
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ---------- Development stage (dev image with dev deps and hot-reload) ----------
FROM deps AS development
WORKDIR /app

ENV NODE_ENV=development

# Copy everything (source + prisma schema)
# We intentionally do NOT copy .env (use runtime envs instead)
COPY . .

# Ensure Prisma client exists for dev; tolerate missing config
RUN npx prisma generate || true

# Default command for development image (expect package.json to have a `dev` script)
CMD ["npm", "run", "dev"]

# ---------- Production runtime image ----------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install runtime OS deps required by Prisma / Node native libs
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy only package manifests and install production deps (deterministic)
COPY package*.json ./
# If you have a package-lock.json it will be copied by the previous line; npm ci will use it.
RUN npm ci --omit=dev

# Copy built artifacts and generated prisma client from builder
COPY --from=builder /app/dist ./dist
# If you keep a generated client under src/generated/prisma (your prisma generator may output there),
# copy it so runtime code that imports generated client still works.
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

# Create a non-root user and set ownership
RUN addgroup --system app \
  && adduser --system --ingroup app app \
  && chown -R app:app /app

USER app

EXPOSE 3000

# Lightweight healthcheck (adjust path to your health endpoint)
# Use a Node-based check to avoid installing curl/wget in the runtime image
# Exit non-zero on request error or non-200 response
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http'); const req=http.get('http://127.0.0.1:3000/health', r=>{ process.exit(r.statusCode===200?0:1); }); req.on('error', ()=>process.exit(1));"

CMD ["node", "dist/server.js"]
