# syntax=docker/dockerfile:1
# Build da app web (Vite) do monorepo npm workspaces.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm ci
# Lockfile gerado noutra OS pode omitir binários opcionais no Linux (npm#4828).
RUN npm install \
  @rollup/rollup-linux-x64-gnu@4.59.0 \
  lightningcss-linux-x64-gnu@1.32.0 \
  @tailwindcss/oxide-linux-x64-gnu@4.2.2 \
  --workspace=web --no-save

FROM deps AS build
COPY apps/web ./apps/web
WORKDIR /app/apps/web
ARG VITE_API_URL=http://localhost:3001/api
ARG VITE_APP_NAME=Gwan Social
ARG VITE_APP_VERSION=0.0.0
ENV VITE_API_URL=$VITE_API_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_VERSION=$VITE_APP_VERSION
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
