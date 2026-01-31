FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . ./
RUN tsc --skipLibCheck

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app ./
EXPOSE 8001
CMD ["node", "dist/bootstrap.js"]
