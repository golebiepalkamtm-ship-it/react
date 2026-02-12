FROM node:20

WORKDIR /app

COPY package*.json ./
RUN rm -rf node_modules && npm install --force && npm uninstall esbuild && npm install esbuild-wasm --force && rm -rf node_modules/@esbuild

COPY . .

ENV TSX_ESBUILD_LOADER=esbuild-wasm

EXPOSE 8001
CMD ["npm", "run", "dev"]
