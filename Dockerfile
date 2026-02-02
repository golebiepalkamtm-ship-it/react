FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
# Invalidate cache
COPY server/package*.json ./
COPY server/package-lock.json ./
RUN npm ci --legacy-peer-deps
RUN npm install -g typescript
COPY server/prisma ./prisma
RUN npx prisma generate
COPY server ./
RUN npx tsc --skipLibCheck

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app ./
EXPOSE 8001
CMD ["node", "dist/bootstrap.js"]
