# Base stage - install dependencies only
FROM node:20 AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Development stage
FROM node:20 AS development
WORKDIR /app
COPY package.*json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

FROM base AS build
WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
