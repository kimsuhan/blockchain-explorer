# Frontend Dockerfile - Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files from monorepo root
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/front/package*.json ./apps/front/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/front/node_modules ./apps/front/node_modules
COPY apps/front ./apps/front
COPY package.json pnpm-workspace.yaml ./

# Copy root env for build
COPY .env* ./

# Install pnpm
RUN npm install -g pnpm

# Build the application
WORKDIR /app/apps/front
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application
COPY --from=builder /app/apps/front/public ./public

# Standalone 빌드의 경우, 필요한 파일들을 올바른 위치에 복사
COPY --from=builder --chown=nextjs:nodejs /app/apps/front/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/front/.next/static ./.next/static

# 환경변수 파일 복사
COPY --from=builder /app/.env* ./

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Standalone 모드에서는 apps/front 디렉토리 안의 server.js를 실행
CMD ["node", "apps/front/server.js"]