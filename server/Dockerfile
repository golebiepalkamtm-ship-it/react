FROM node:22-alpine AS base
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --legacy-peer-deps
COPY server ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app ./
EXPOSE 8001
CMD ["node", "dist/bootstrap.js"]
