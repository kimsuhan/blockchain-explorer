#!/bin/bash

# Docker 백그라운드 실행 전용 스크립트
set -e

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[INFO]${NC} 기존 컨테이너 중지 중..."
docker compose down

echo -e "${BLUE}[INFO]${NC} 백그라운드에서 서비스 빌드 및 실행 중..."
docker compose up --build -d

echo -e "${GREEN}[SUCCESS]${NC} 서비스가 백그라운드에서 시작되었습니다!"
echo ""
echo -e "${BLUE}[INFO]${NC} 유용한 명령어들:"
echo "  상태 확인:    docker compose ps"
echo "  로그 확인:    docker compose logs -f"
echo "  서비스 중지:  docker compose down"
echo "  개별 로그:    docker compose logs -f [api|frontend]"

# 현재 상태 표시
echo ""
echo -e "${BLUE}[INFO]${NC} 현재 컨테이너 상태:"
docker compose ps