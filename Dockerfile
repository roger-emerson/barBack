# Multi-stage build for optimized production image

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY backend/ ./

# Stage 3: Final Production Image
FROM node:18-alpine

RUN apk update && apk upgrade && apk add --no-cache dumb-init

RUN addgroup -g 1001 appuser && \
    adduser -u 1001 -G appuser -s /bin/sh -D appuser

WORKDIR /app

COPY --from=backend-builder --chown=appuser:appuser /app/backend ./
COPY --from=frontend-builder --chown=appuser:appuser /app/frontend/dist ./public

RUN mkdir -p /app/backups /app/logs && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
