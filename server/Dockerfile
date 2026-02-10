# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++ openssl libc6-compat

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm ci

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Production dependencies stage
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Final stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies
RUN apk add --no-cache openssl curl libc6-compat

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy production artifacts
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 8001
CMD ["node", "dist/index.js"]
