# CampusPolio

교내 프로젝트 결과물을 등록·탐색하고 포트폴리오로 구성하는 웹 플랫폼의 프론트엔드 저장소다. 프로젝트 아카이브, 전시, 포트폴리오 공유를 목표로 개발 중이며 실제 구현 범위는 코드와 작업별 이슈에서 확인한다.

Next.js App Router, React, TypeScript, Tailwind CSS와 shadcn/ui 기반 공통 컴포넌트를 사용한다. 의존성 및 스크립트의 기준은 [package.json](package.json)과 [package-lock.json](package-lock.json)이다.

## 문서 안내

| 문서 | 용도 |
|---|---|
| [AGENTS.md](AGENTS.md) | 저장소 공통 작업 규칙, 코드 배치와 API 연동 원칙 |
| [CLAUDE.md](CLAUDE.md) | Claude에서 공통 규칙을 읽는 안내 |
| [api.md](api.md) | OpenAPI JSON 형식의 백엔드 명세 |
| [설계 문서 안내](docs/ai/README.md) | UI/UX 작업 계획과 시안의 위치·선택 상태 |

## 개발 실행

Node.js와 npm을 준비하고 저장소 루트에서 실행한다.

```sh
npm ci
npm run dev
```

기본 개발 주소는 `http://localhost:3000`이다. 실제 API 또는 Mock 설정은 아래 내용을 따른다.

## 환경 설정

로컬 설정은 `.env.local`에 작성한다. `.env*`는 현재 Git 추적에서 제외된다. 아래 값은 설정 예시이며 실제 발급 정보나 서버 주소는 개발 환경에 맞게 지정한다.

| 환경변수 | 현재 코드에서의 역할 | 미설정 시 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | 서버의 API 요청과 `/api/*` rewrite가 사용할 백엔드 기준 URL | 빈 문자열; 백엔드 rewrite 없음 |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google 로그인에 사용하는 웹 클라이언트 ID | 빈 문자열 |
| `NEXT_PUBLIC_USE_MOCK_API` | 문자열 `true`일 때 Mock API 사용 | 비활성 |
| `NEXT_PUBLIC_MOCK_AUTH_STATE` | `unverified`, `verified`, `invalid-domain` 중 Mock 인증 시나리오 | `unverified`; 잘못된 값도 동일 |

화면 개발용 Mock 예시:

```dotenv
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_MOCK_AUTH_STATE=unverified
```

실제 API 연결 예시:

```dotenv
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
```

브라우저는 같은 출처의 `/api/*`로 요청하고, Next.js가 설정된 백엔드로 전달한다. 서버에서 실행하는 요청은 API 기준 URL을 사용한다. 기준 URL 끝에 `/api`를 중복해서 붙이지 않는다. 설정 기준은 [env.ts](src/shared/config/env.ts), [mock.ts](src/shared/config/mock.ts), [next.config.ts](next.config.ts)다. 환경 설정을 바꾼 뒤 개발 서버를 다시 시작하고, 배포용 설정은 빌드에 반영한다.

`NEXT_PUBLIC_*`는 브라우저에 노출되는 설정이다. Google client secret 등 비밀값을 넣지 않는다. Mock 예시는 조회 화면 개발용이며, Google 로그인 UI는 Mock 사용 시에도 웹 클라이언트 ID와 외부 Google SDK를 요구한다. 실제 로그인·메일·서버 권한은 실제 백엔드에서 확인해야 하며, Mock 인증 상태만으로 해당 검증을 완료할 수 없다. 현재 Mock은 서버와 브라우저 사이 상태 및 세션 동작에 제약이 있다.

## 검증

```sh
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

저장소에 일반 자동 테스트용 `test` 스크립트는 아직 없다. 변경한 사용자 동작과 화면은 작업 범위에 맞춰 추가 검증한다. 타입·린트·빌드 통과와 실제 API 흐름의 성공은 별도로 기록한다.

빌드 결과를 로컬에서 실행하려면 빌드 성공 후 다음 명령을 사용한다.

```sh
npm run start
```

## 코드 구조

```text
src/
├── app/       라우트, 레이아웃, 메타데이터, 데이터와 화면 연결
├── widgets/   페이지와 큰 화면 영역의 UI 조합
├── features/  로그인·편집·제작 등 사용자 행동
├── entities/  project·portfolio·profile·user 도메인과 API
└── shared/    공통 UI, API 기반, 설정, 유틸리티
```

새 코드를 배치하거나 import를 추가할 때는 [AGENTS.md](AGENTS.md)의 구조와 public API 규칙을 따른다. 기능별 계획과 설계 자료는 [docs/ai](docs/ai/README.md)에서 관리한다.
