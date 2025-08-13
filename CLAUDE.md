# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

이 프로젝트는 Hardhat 로컬 네트워크를 위한 블록체인 탐색기입니다. pnpm + Turborepo + Changesets를 사용하는 모노레포 구조로 구성되어 있습니다.

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

### 프론트엔드 (apps/front)
```bash
# 프론트엔드만 개발 서버 실행
pnpm --filter @blockchain-explorer/frontend dev

# 프론트엔드만 빌드
pnpm --filter @blockchain-explorer/frontend build

# 프론트엔드만 린트
pnpm --filter @blockchain-explorer/frontend lint
```

### 블록체인 네트워크 (Hardhat)
```bash
# Hardhat 로컬 노드 실행
pnpm node

# 스마트 컨트랙트 컴파일
pnpm compile
```

## 프로젝트 구조

```
blockchain-explorer/                   # 모노레포 루트
├── apps/                              # 애플리케이션들
│   ├── api/                          # API 서버 (향후 구현 예정)
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
│   └── hardhat/                      # Hardhat 설정 및 스마트 컨트랙트
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
- **스타일링**: Tailwind CSS v4
- **블록체인 상호작용**: ethers.js v6
- **아이콘**: Lucide React
- **대상 네트워크**: Hardhat Local Network (localhost:8545)

## 아키텍처 세부사항

### Web3 연결 (src/lib/web3.ts)
- `provider`: ethers.js JsonRpcProvider로 블록체인과 연결
- RPC URL은 `LOCAL_RPC_URL` 상수로 관리 (현재 `http://forlong.io:8545` 사용)
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

### 테스트 계정
프로젝트에서 사용하는 Hardhat 기본 테스트 계정들:
- Account 0: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Account 1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Account 2: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

## 주의사항

- Hardhat 로컬 노드가 실행 중이어야 정상 작동
- RPC URL 변경 시 `apps/front/src/lib/web3.ts`의 `LOCAL_RPC_URL` 수정 필요
- 모든 블록체인 상호작용은 비동기 처리되며 에러 핸들링 포함
- 개발 환경에서는 자동 새로고침으로 데이터 업데이트
- 패키지 의존성 변경 후에는 루트에서 `pnpm install` 재실행
- Turborepo 캐시 문제 시 `pnpm clean` 후 다시 빌드