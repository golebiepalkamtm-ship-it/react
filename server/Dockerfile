# Multi-stage build for optimal production image

# Stage 1: Builder (Builds source code)
FROM node:22-alpine AS builder
WORKDIR /app
# Install build dependencies for potential native modules
RUN apk add --no-cache python3 make g++ openssl
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
# Run build command (prisma generate + tsc + copy-runtime)
RUN npm run build

# Stage 2: Production Dependencies (Clean install)
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma
# Install only production dependencies
RUN npm ci --omit=dev
# Generate Prisma Client for production runtime
RUN npx prisma generate

# Stage 3: Runner (Minimal runtime image)
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies
RUN apk add --no-cache openssl curl

# Copy artifacts from previous stages
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/api/health || exit 1

EXPOSE 8001
CMD ["node", "dist/index.js"]
