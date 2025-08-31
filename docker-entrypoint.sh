#!/bin/sh

echo "🚀 Starting weproud application..."

# 데이터베이스 마이그레이션 실행
echo "📦 Running database migrations..."
npx prisma migrate deploy

# 데이터베이스 시드 실행 (필요한 경우)
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Running database seed..."
  npx prisma db seed
fi

# 헬스 체크 엔드포인트 생성
echo "🏥 Setting up health check..."
mkdir -p /app/src/app/api/health
cat > /app/src/app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
EOF

echo "✅ Application startup complete!"

# Next.js 애플리케이션 실행
exec "$@"
