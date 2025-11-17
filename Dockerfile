# =========================================
# Stage 1: Builder
# =========================================
FROM node:22-slim as builder
ARG NPM_TOKEN

WORKDIR /app

COPY package.json package-lock.json .npmrc ./

RUN npm ci

# Copy source code và build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# =========================================
# Stage 2: Runtime
# =========================================
FROM node:22-slim
ARG NPM_TOKEN

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY --from=builder /app/build ./build

RUN npm install -g pm2
RUN npm ci --production

EXPOSE 4000

ENTRYPOINT ["pm2-runtime", "start", "./build/app.js"]
