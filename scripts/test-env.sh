#!/bin/bash

# 환경변수 로딩 테스트 스크립트
set -e

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} Docker 환경변수 로딩 테스트 시작"

echo -e "${BLUE}[INFO]${NC} 현재 .env 파일 상태:"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env 파일이 존재합니다"
    echo "주요 환경변수들:"
    grep -E "^(FRONTEND_PORT|API_PORT|RPC_URL|CHAIN_ID|DEFAULT_ACCOUNTS)=" .env || echo "환경변수가 설정되지 않았습니다"
else
    echo -e "${RED}✗${NC} .env 파일이 존재하지 않습니다"
fi

echo ""
echo -e "${BLUE}[INFO]${NC} Docker Compose 환경변수 테스트:"
echo "컨테이너에서 환경변수 확인 중..."

# 컨테이너가 실행 중인지 확인
if docker compose ps -q > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker 서비스가 실행 중입니다"
    
    echo ""
    echo "Frontend 환경변수:"
    docker compose exec -T frontend sh -c 'echo "FRONTEND_PORT=$FRONTEND_PORT, API_URL=$API_URL, RPC_URL=$RPC_URL"' 2>/dev/null || echo "Frontend 컨테이너에 접근할 수 없습니다"
    
    echo ""
    echo "API 환경변수:"
    docker compose exec -T api sh -c 'echo "API_PORT=$API_PORT, RPC_URL=$RPC_URL, CHAIN_ID=$CHAIN_ID"' 2>/dev/null || echo "API 컨테이너에 접근할 수 없습니다"
else
    echo -e "${RED}✗${NC} Docker 서비스가 실행되지 않았습니다"
    echo "먼저 서비스를 시작하세요: pnpm docker:update:bg"
fi

echo ""
echo -e "${BLUE}[INFO]${NC} 환경변수 디버깅이 완료되었습니다"