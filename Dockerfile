FROM node:22-alpine AS base
WORKDIR /app
# Invalidate cache
COPY package*.json ./
RUN npm ci --legacy-peer-deps
RUN npm install -g typescript
COPY prisma ./prisma
RUN npx prisma generate
COPY . ./
RUN tsc --skipLibCheck

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app ./
EXPOSE 8001
CMD ["node", "dist/bootstrap.js"]
