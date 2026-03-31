# 1. Base Stage (Debian-based)
FROM node:20-slim as base
WORKDIR /app

# Install OpenSSL - Required for Prisma on Debian/Slim
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates

COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies and generate Prisma Client
RUN npm install
RUN npx prisma generate

# 2. Development Stage
FROM base as development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# 3. Build Stage
FROM base as build
COPY . .
RUN npm run build

# 4. Production Stage (Staying on Slim to avoid binary mismatch)
FROM node:20-slim as production
WORKDIR /app

# Re-install OpenSSL in production image
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
COPY .env ./

EXPOSE 3000
CMD ["node", "dist/server.js"]