# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 테스트넷을 위한 블록체인 탐색기입니다. pnpm + Turborepo + Changesets를 사용하는 모노레포 구조로 구성되어 있습니다.

## 개발 명령어

### 모노레포 전체 명령어 (루트에서 실행)
```bash
# 전체 패키지 의존성 설치
pnpm install

# 모든 앱 개발 서버 실행
pnpm dev

# 모든 앱 빌드
pnpm build

# 모든 앱 린트 체크
pnpm lint

# 모든 앱 린트 수정
pnpm lint:fix

# 모든 앱 타입 체크
pnpm type-check

# 모든 빌드 파일 정리
pnpm clean

# 코드 포맷팅
pnpm format

# Changeset 생성
pnpm changeset

# Changeset 버전 업데이트
pnpm changeset:version

# 패키지 배포
pnpm changeset:publish
```

### 개별 앱 실행
```bash
# 프론트엔드만 개발 서버 실행
pnpm frontend:dev
# 또는
pnpm --filter @blockchain-explorer/frontend dev

# API 서버만 개발 실행
pnpm api:dev
# 또는
pnpm --filter @blockchain-explorer/api dev

# 프론트엔드만 빌드
pnpm frontend:build

# API 서버만 빌드
pnpm api:build

# API 서버 프로덕션 실행
pnpm api:start
```

### 블록체인 네트워크 설정
```bash
# 환경변수에서 RPC URL 설정
# .env 파일에서 RPC_URL과 CHAIN_ID 수정

# 예시 테스트넷들:
# - Sepolia: https://sepolia.infura.io/v3/YOUR_KEY
# - Goerli: https://goerli.infura.io/v3/YOUR_KEY  
# - 커스텀: http://forlong.io:8545
```

## 프로젝트 구조

```
blockchain-explorer/                   # 모노레포 루트
├── apps/                              # 애플리케이션들
│   ├── api/                          # NestJS API 서버 (@blockchain-explorer/api)
│   │   ├── src/
│   │   │   ├── app.controller.ts     # 메인 컨트롤러
│   │   │   ├── app.module.ts         # 루트 모듈
│   │   │   ├── app.service.ts        # 메인 서비스
│   │   │   └── main.ts               # 앱 진입점
│   │   ├── test/                     # E2E 테스트
│   │   ├── nest-cli.json             # NestJS CLI 설정
│   │   ├── tsconfig.json             # TypeScript 설정
│   │   └── package.json
│   └── front/                        # Next.js 프론트엔드 (@blockchain-explorer/frontend)
│       ├── src/
│       │   ├── app/                  # Next.js App Router 페이지
│       │   │   ├── page.tsx          # 메인 대시보드
│       │   │   ├── blocks/           # 블록 탐색 페이지
│       │   │   ├── transactions/     # 트랜잭션 탐색 페이지
│       │   │   └── accounts/         # 계정 조회 페이지
│       │   ├── components/           # 재사용 가능한 컴포넌트
│       │   │   ├── Header.tsx        # 네트워크 상태 표시 및 네비게이션
│       │   │   ├── LoadingSpinner.tsx # 로딩 표시 컴포넌트
│       │   │   └── ErrorMessage.tsx  # 에러 메시지 컴포넌트
│       │   └── lib/
│       │       └── web3.ts           # Web3 유틸리티 함수들
│       └── package.json
├── packages/                         # 공유 패키지들 (향후 구현 예정)
├── .changeset/                       # Changesets 설정
│   └── config.json
├── package.json                      # 루트 패키지 설정
├── pnpm-workspace.yaml              # pnpm 워크스페이스 설정
├── turbo.json                       # Turborepo 설정
└── CLAUDE.md                        # 이 파일
```

## 기술 스택

- **모노레포 도구**: pnpm, Turborepo, Changesets
- **프론트엔드**: Next.js 15, React 19, TypeScript
- **백엔드**: NestJS 11, TypeScript
- **스타일링**: Tailwind CSS v4
- **블록체인 상호작용**: ethers.js v6
- **아이콘**: Lucide React
- **테스팅**: Jest, Supertest
- **대상 네트워크**: 이더리움 테스트넷 (Sepolia, Goerli 등) 및 커스텀 네트워크

## 아키텍처 세부사항

### Web3 연결 (src/lib/web3.ts)
- `provider`: ethers.js JsonRpcProvider로 테스트넷과 연결
- RPC URL은 환경변수 `RPC_URL`로 관리 (기본값: `http://forlong.io:8545`)
- 다양한 테스트넷 지원 (Sepolia, Goerli, 커스텀 네트워크 등)
- 모든 Web3 관련 유틸리티 함수들이 정의됨

### 주요 유틸리티 함수들
- `getLatestBlock()`: 최신 블록 정보
- `getBlockByNumber()`: 특정 블록 번호로 블록 조회
- `getRecentBlocks()`: 최근 블록 목록
- `getTransactionByHash()`: 트랜잭션 해시로 트랜잭션 조회
- `getAccountBalance()`: 계정 잔액 조회
- `getTransactionsFromBlock()`: 특정 블록의 모든 트랜잭션
- `checkNetworkConnection()`: 네트워크 연결 상태 확인

### 타입 정의
- `BlockInfo`: 블록 정보 타입
- `TransactionInfo`: 트랜잭션 정보 타입

### 컴포넌트 패턴
- 모든 페이지 컴포넌트는 `'use client'` 지시어 사용
- 상태 관리는 React hooks (useState, useEffect) 사용
- 로딩 상태와 에러 상태를 일관되게 처리
- 10초마다 자동 새로고침 기능 구현

### UI/UX 특징
- 반응형 디자인 (모바일/데스크톱 대응)
- 네트워크 연결 상태 실시간 표시
- 사용자 친화적인 에러 메시지
- 해시값 및 주소는 축약 표시 (hover로 전체 표시)
- 한국어 UI로 초보자도 이해하기 쉽게 구성

## 개발 가이드라인

### 모노레포 작업 시
1. 루트에서 `pnpm install`로 전체 의존성 설치
2. 특정 패키지만 작업할 때는 `pnpm --filter <패키지명>` 사용
3. 새로운 패키지 추가 시 `pnpm-workspace.yaml`에 경로 추가
4. 버전 변경 시 Changesets 사용: `pnpm changeset`

### 새로운 앱/패키지 추가 시
1. `apps/` 또는 `packages/` 디렉토리에 생성
2. 패키지명은 `@blockchain-explorer/` 스코프 사용
3. `package.json`에 필요한 스크립트 추가 (`dev`, `build`, `lint`, `type-check`, `clean`)
4. `turbo.json`에 새 태스크가 있다면 추가

### 새로운 페이지 추가 시 (프론트엔드)
1. `apps/front/src/app/` 디렉토리에 새 폴더/파일 생성
2. `src/components/Header.tsx`의 네비게이션 메뉴에 링크 추가
3. Web3 관련 로직은 `src/lib/web3.ts`의 함수들 활용

### 새로운 Web3 기능 추가 시
1. `apps/front/src/lib/web3.ts`에 유틸리티 함수 추가
2. 필요한 경우 타입 정의 추가
3. 에러 처리를 포함하여 구현

### 스타일링
- Tailwind CSS 클래스 사용
- 기존 컴포넌트의 스타일 패턴 따르기
- 반응형 디자인 고려 (`md:`, `lg:` 등의 prefix 사용)

### 테스트 계정 설정
환경변수 `DEFAULT_ACCOUNTS`에서 기본 계정들을 설정할 수 있습니다:
- `.env` 파일에서 `DEFAULT_ACCOUNTS`에 쉼표로 구분된 주소들 설정
- 테스트넷에서 사용할 계정들의 주소를 등록
- `getDefaultAccounts()` 함수로 설정된 계정들 조회 가능

## 환경변수 설정

루트 디렉토리의 `.env` 파일에서 모든 환경변수를 관리합니다:

```bash
# .env 파일 예시
FRONTEND_PORT=3000
API_PORT=4000

# 테스트넷 설정
RPC_URL=http://forlong.io:8545
CHAIN_ID=31337

# 또는 다른 테스트넷 사용 시:
# RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# CHAIN_ID=11155111

API_URL=http://localhost:4000
NODE_ENV=development
DEFAULT_ACCOUNTS=0x주소1,0x주소2,0x주소3
```

### 환경변수 사용법:
- **API**: `process.env.API_PORT` 등으로 직접 접근
- **Frontend**: `process.env.RPC_URL` 등으로 접근 (next.config.ts에서 설정)
- **포트 변경**: `.env`에서 `FRONTEND_PORT`, `API_PORT` 수정

## 주의사항

- **테스트넷 연결**: 설정된 RPC URL의 테스트넷이 정상 작동해야 함
- **네트워크 설정**: CHAIN_ID가 연결할 테스트넷과 일치해야 함
- **환경변수**: 변경 시 서버 재시작 필요
- **RPC 제한**: 공용 RPC의 경우 요청 제한이 있을 수 있음
- 모든 블록체인 상호작용은 비동기 처리되며 에러 핸들링 포함
- 개발 환경에서는 자동 새로고침으로 데이터 업데이트
- 패키지 의존성 변경 후에는 루트에서 `pnpm install` 재실행
- Turborepo 캐시 문제 시 `pnpm clean` 후 다시 빌드

## Docker 배포

이 프로젝트는 Docker를 통한 컨테이너 배포를 지원합니다.

### Docker 배포 옵션

#### 1. Docker Compose를 통한 개별 서비스 배포 (추천)
```bash
# 프로덕션 환경
pnpm docker:compose:prod

# 개발 환경 (Hot Reload 지원)
pnpm docker:compose:dev

# 수동 실행
docker compose up --build                    # 프로덕션
docker compose -f docker-compose.yml -f docker-compose.dev.yml up  # 개발
```

#### 2. 단일 이미지 배포
```bash
# 단일 이미지 빌드 및 실행
pnpm docker:build
pnpm docker:run

# 수동 실행
docker build -t blockchain-explorer .
docker run -p 3000:3000 -p 4000:4000 blockchain-explorer
```

### Docker 빌드 스크립트 사용법
```bash
# 편리한 스크립트 사용
./scripts/docker-build.sh build          # 단일 이미지 빌드
./scripts/docker-build.sh compose        # Docker Compose 프로덕션
./scripts/docker-build.sh dev           # Docker Compose 개발환경
./scripts/docker-build.sh stop          # 컨테이너 중지
./scripts/docker-build.sh clean         # 이미지 정리
```

### 환경변수 설정
Docker 배포 시 `.env` 파일의 환경변수들이 자동으로 컨테이너에 전달됩니다:
- `RPC_URL`: 테스트넷 RPC 엔드포인트
- `CHAIN_ID`: 블록체인 네트워크 ID  
- `FRONTEND_PORT`: 프론트엔드 포트 (기본값: 3000)
- `API_PORT`: API 서버 포트 (기본값: 4000)

### Docker 이미지 구조
```
blockchain-explorer/
├── Dockerfile                    # 전체 스택 단일 이미지
├── docker-compose.yml           # 프로덕션 환경 구성
├── docker-compose.dev.yml       # 개발 환경 오버라이드
├── apps/front/Dockerfile        # 프론트엔드 개별 이미지
├── apps/api/Dockerfile          # API 서버 개별 이미지
└── scripts/docker-build.sh      # 빌드 스크립트
```

### 배포 포트
- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **Internal Communication**: Frontend → API (http://api:4000)

### 업데이트 및 재배포

코드 변경 후 서비스를 업데이트하는 방법:

#### ⚡ 빠른 업데이트 명령어
```bash
# 전체 서비스 업데이트 (중지 → 빌드 → 실행)
pnpm docker:update
./scripts/docker-build.sh update

# 서비스 재시작만 (빌드 없이)
pnpm docker:restart  
./scripts/docker-build.sh restart

# 개발환경 업데이트
./scripts/docker-build.sh dev
```

#### 🔄 단계별 업데이트
```bash
# 1. 기존 컨테이너 중지
docker compose down

# 2. 새로 빌드하여 실행
docker compose up --build

# 3. 캐시 무시하고 강제 리빌드 (필요시)
docker compose build --no-cache
docker compose up
```

#### 🏷️ 버전 관리
```bash
# Git 태그와 함께 배포
git tag v1.1.0
./scripts/docker-build.sh build -t v1.1.0

# Changesets로 버전 관리
pnpm changeset
pnpm changeset:version
```

### Docker 관련 주의사항
- **빌드 시간**: 첫 빌드 시 의존성 설치로 인해 시간이 걸릴 수 있음
- **이미지 크기**: 멀티스테이지 빌드로 최적화됨
- **네트워크**: Docker Compose 사용 시 자동으로 내부 네트워크 구성
- **볼륨**: 개발 환경에서는 소스 코드 변경 시 자동 반영
- **환경변수**: 컨테이너 실행 시 `.env` 파일 필요
- **업데이트**: 코드 변경 시 `pnpm docker:update` 명령어로 간편하게 재배포