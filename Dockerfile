# 멀티 스테이지 빌드 사용
FROM node:20-alpine AS base

# pnpm 설치 (더 빠르고 효율적인 패키지 매니저)
RUN corepack enable && corepack prepare pnpm@latest --activate

# 의존성 설치 스테이지
FROM base AS deps
WORKDIR /app

# 패키지 파일들 복사
COPY package.json bun.lock ./

# 의존성 설치 (프로덕션용)
RUN pnpm install --frozen-lockfile --prod

# 빌드 스테이지
FROM base AS builder
WORKDIR /app

# 빌드용 의존성 설치
COPY package.json bun.lock ./
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 환경 변수 설정 (빌드 시 필요)
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 애플리케이션 빌드
RUN pnpm run build

# 프로덕션 스테이지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 보안: non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드된 애플리케이션 복사
COPY --from=builder /app/public ./public

# Next.js 빌드 출력 복사 (standalone 모드)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma 관련 파일들 복사
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/lib/prisma.ts ./src/lib/prisma.ts

# 사용자 전환
USER nextjs

# 데이터베이스 마이그레이션 실행을 위한 스크립트
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 애플리케이션 실행
CMD ["./docker-entrypoint.sh"]
