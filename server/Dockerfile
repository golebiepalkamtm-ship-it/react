FROM node:22-alpine AS base

# Etap 1: Budowanie aplikacji
WORKDIR /app

# 1. Kopiujemy tylko pliki zależności
COPY package*.json ./
COPY prisma ./prisma

# 2. Instalujemy zależności
RUN apk add --no-cache openssl
RUN npm install --legacy-peer-deps

# 3. Ustawiamy URL bazy dla Prisma (wymagany do generate)
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
ARG DIRECT_URL=${DATABASE_URL}
ENV DATABASE_URL=${DATABASE_URL}
ENV DIRECT_URL=${DIRECT_URL}

# 4. Generujemy klienta Prisma
RUN npx prisma generate

# 5. Kopiujemy resztę kodu PO zainstalowaniu zależności
COPY . .

# 6. Kompilujemy TypeScript
RUN npx tsc --skipLibCheck

# Etap 2: Obraz produkcyjny
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Kopiujemy tylko niezbędne pliki z etapu budowania
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

EXPOSE 8001

CMD ["node", "dist/bootstrap.js"]
