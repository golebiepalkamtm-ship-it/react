FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl libc6-compat

# Copy package files
COPY server/package*.json ./
RUN npm ci

# Copy Prisma and generate client
COPY server/prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY server ./
RUN npm run build

# Final stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies
RUN apk add --no-cache openssl curl libc6-compat

# Copy production artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 8001
CMD ["node", "dist/index.js"]
