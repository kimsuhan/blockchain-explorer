# Frontend Dockerfile - Multi-stage build for production
FROM node:22-alpine AS base

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

# Standalone 빌드의 모든 필요한 파일들을 복사
COPY --from=builder --chown=nextjs:nodejs /app/apps/front/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/front/.next/static ./.next/static

# 환경변수 파일 복사
COPY --from=builder /app/.env* ./

# Standalone을 위한 필수 모듈 설치 (npm 사용으로 심볼릭 링크 문제 해결)
COPY --from=builder --chown=nextjs:nodejs /app/apps/front/package.json ./package.json
RUN npm install --production --no-package-lock next react react-dom

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Next.js standalone에서 생성된 server.js 직접 실행
CMD ["node", "server.js"]