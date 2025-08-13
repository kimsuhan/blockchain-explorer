#!/bin/bash

# Docker 빌드 및 배포 스크립트
set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 사용법 표시
show_usage() {
    echo "사용법: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "명령어:"
    echo "  build        전체 스택을 하나의 이미지로 빌드"
    echo "  compose      Docker Compose로 개별 서비스 빌드 및 실행"
    echo "  dev          개발 환경으로 실행"
    echo "  prod         프로덕션 환경으로 실행"
    echo "  stop         모든 컨테이너 중지"
    echo "  clean        모든 이미지와 컨테이너 정리"
    echo ""
    echo "옵션:"
    echo "  -t TAG       이미지 태그 지정 (기본값: latest)"
    echo "  -h           이 도움말 표시"
}

# 환경 확인
check_requirements() {
    log_info "Docker 환경 확인 중..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 데몬이 실행되지 않았습니다."
        exit 1
    fi
    
    log_success "Docker 환경 확인 완료"
}

# 단일 이미지 빌드
build_single() {
    local tag=${1:-latest}
    
    log_info "전체 스택을 하나의 이미지로 빌드 중... (태그: $tag)"
    
    docker build -t blockchain-explorer:$tag .
    
    log_success "빌드 완료: blockchain-explorer:$tag"
    
    # 이미지 크기 표시
    local size=$(docker images blockchain-explorer:$tag --format "{{.Size}}")
    log_info "이미지 크기: $size"
}

# Docker Compose 빌드 및 실행
compose_up() {
    local env=${1:-prod}
    
    if [ "$env" = "dev" ]; then
        log_info "개발 환경으로 실행 중..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
    else
        log_info "프로덕션 환경으로 실행 중..."
        docker-compose up --build
    fi
}

# 컨테이너 중지
stop_containers() {
    log_info "모든 컨테이너 중지 중..."
    docker-compose down
    log_success "컨테이너 중지 완료"
}

# 정리
clean_all() {
    log_warning "모든 blockchain-explorer 관련 이미지와 컨테이너를 정리합니다."
    read -p "계속하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "컨테이너 중지 및 제거 중..."
        docker-compose down --rmi all --volumes --remove-orphans
        
        log_info "관련 이미지 제거 중..."
        docker rmi $(docker images "blockchain-explorer*" -q) 2>/dev/null || true
        
        log_success "정리 완료"
    else
        log_info "정리 취소됨"
    fi
}

# 메인 실행 부분
main() {
    local command=""
    local tag="latest"
    
    # 파라미터 파싱
    while [[ $# -gt 0 ]]; do
        case $1 in
            build)
                command="build"
                shift
                ;;
            compose)
                command="compose"
                shift
                ;;
            dev)
                command="dev"
                shift
                ;;
            prod)
                command="prod"
                shift
                ;;
            stop)
                command="stop"
                shift
                ;;
            clean)
                command="clean"
                shift
                ;;
            -t)
                tag="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                log_error "알 수 없는 옵션: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # 명령어가 없으면 사용법 표시
    if [ -z "$command" ]; then
        show_usage
        exit 1
    fi
    
    # 환경 확인
    check_requirements
    
    # 명령어 실행
    case $command in
        build)
            build_single "$tag"
            ;;
        compose)
            compose_up "prod"
            ;;
        dev)
            compose_up "dev"
            ;;
        prod)
            compose_up "prod"
            ;;
        stop)
            stop_containers
            ;;
        clean)
            clean_all
            ;;
    esac
}

# 스크립트 실행
main "$@"