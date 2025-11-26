# Base stage
FROM node:20 AS base
WORKDIR /app
COPY package*.json ./
# Install dependencies here
RUN npm install

# Development stage
FROM base AS development
WORKDIR /app
# We copy source, but docker-compose bind mount will override this anyway
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Build Stage
FROM base AS build
WORKDIR /app
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]