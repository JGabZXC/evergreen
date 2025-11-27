# Backend Dockerfile
FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm install


FROM base as development
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base as build
WORKDIR /app
COPY . .
RUN npm run build

FROM node:20-alpine as production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
COPY .env ./
RUN npm install --only=production
EXPOSE 3000
CMD ["node", "dist/server.js"]