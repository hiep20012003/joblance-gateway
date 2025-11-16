# =========================================
# Stage 1: Builder
# =========================================
# Sử dụng phiên bản node:22-slim để có dung lượng nhỏ hơn
FROM node:22-slim as builder
ARG NPM_TOKEN

# Set working directory
WORKDIR /app

# Copy package files, lock file, and .npmrc
COPY package.json package-lock.json .npmrc ./

# 1. Định nghĩa biến ARG để nhận token từ lệnh docker build

## 2. Gán biến ARG thành biến ENV để npm có thể đọc nó trong quá trình install
## Bước này giúp đảm bảo npm có thể truy cập biến ${NPM_TOKEN} trong tệp .npmrc
#ENV NPM_TOKEN=${NPM_TOKEN}

# Cài đặt dependencies
# Sử dụng npm ci (đã có sẵn npm@latest trong base image)
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

# Set working directory
WORKDIR /app

# Tối ưu hóa: Copy các tệp cần thiết cho môi trường Production
COPY package.json package-lock.json .npmrc ./
COPY --from=builder /app/build ./build

# Install pm2 và production dependencies
# Lưu ý: Không cần npm@latest nếu đã có sẵn trong base image.
RUN npm install -g pm2
RUN npm ci --production

# Expose application port
EXPOSE 4000

# Default command
CMD ["pm2-runtime", "start", "./build/app.js"]
