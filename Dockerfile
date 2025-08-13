# 전체 스택을 하나의 이미지로 빌드하는 다단계 Dockerfile
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# 의존성 설치 단계
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/front/package.json ./apps/front/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# API 빌드 단계
FROM base AS api-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY apps/api ./apps/api
COPY .env* ./
RUN cd apps/api && pnpm build

# Frontend 빌드 단계  
FROM base AS frontend-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/front/node_modules ./apps/front/node_modules
COPY apps/front ./apps/front
COPY .env* ./
RUN cd apps/front && pnpm build

# 최종 런타임 이미지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# API 파일들 복사 (루트 node_modules와 앱별 node_modules 모두 필요)
COPY --from=api-builder --chown=appuser:nodejs /app/apps/api/dist ./api
COPY --from=api-builder --chown=appuser:nodejs /app/node_modules ./api/node_modules
COPY --from=api-builder --chown=appuser:nodejs /app/apps/api/package.json ./api/

# Frontend 파일들 복사 (standalone 빌드의 모든 필요한 파일들)
COPY --from=frontend-builder --chown=appuser:nodejs /app/apps/front/.next/standalone ./frontend
COPY --from=frontend-builder --chown=appuser:nodejs /app/apps/front/.next/static ./frontend/.next/static
COPY --from=frontend-builder --chown=appuser:nodejs /app/apps/front/public ./frontend/public

# 환경변수 복사
COPY --chown=appuser:nodejs .env* ./

# 시작 스크립트 생성
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Starting API server..."' >> /app/start.sh && \
    echo 'cd /app/api && NODE_PATH=/app/api/node_modules/.pnpm/node_modules:/app/api/node_modules node main.js &' >> /app/start.sh && \
    echo 'echo "Starting Frontend server..."' >> /app/start.sh && \
    echo 'cd /app/frontend && node server.js &' >> /app/start.sh && \
    echo 'wait' >> /app/start.sh && \
    chmod +x /app/start.sh

USER appuser

EXPOSE 3000 4000

CMD ["/app/start.sh"]