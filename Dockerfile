FROM node:22-alpine AS base
RUN apk add --no-cache openssl openssl1.1-compat make gcc musl-dev perl linux-headers wget tar
RUN wget https://www.openssl.org/source/openssl-1.1.1w.tar.gz && tar -xzf openssl-1.1.1w.tar.gz
RUN cd openssl-1.1.1w && ./Configure linux-x86_64 --prefix=/usr/local --openssldir=/usr/local/openssl
RUN cd openssl-1.1.1w && make -j$(nproc)
RUN cd openssl-1.1.1w && make install
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
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
