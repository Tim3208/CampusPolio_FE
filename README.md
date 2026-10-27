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
| [Storybook 사용 안내](docs/ai/storybook-guide.md) | 설치·상태 스토리·Mock·동작 테스트와 개발 확인 기록 |

## 개발 실행

[.nvmrc](.nvmrc)의 Node **24.22.1**, packageManager의 npm **10.9.9**를 준비하고 저장소 루트에서 실행한다. 실행별 런타임을 사용할 수 있으며 사용자 전역 설치를 바꿀 필요는 없다.

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

종료형 Storybook 동작 테스트는 다음과 같다. 일반 `test` 스크립트는 없으며 `test:storybook`을 사용한다.

```sh
npm exec -- playwright install chromium
npm run test:storybook
npm run test:visual
npm run build-storybook
```

2026-10-27 현재 전체 **28개 파일·273개 기능 스토리**를 실제 Chromium에서 실행한다. 별도 시각 프로젝트는 **10개 wrapper 파일·12개 기준 화면**을 비교한다. 접근성 error 설정 180개와 미완료 todo 93개를 구분하며 기능 테스트 통과가 todo 해결을 뜻하지 않는다. `npm run storybook`은 `http://localhost:6006`의 개발 서버다. 정적 산출물은 `build/storybook`을 HTTP 서버로 열어 확인한다. 설치 버전, 정적 서버 실행 예시, 스토리 추가·MSW·개인 환경 차단과 실제 개발 결과는 [Storybook 사용 안내](docs/ai/storybook-guide.md)를 따른다. 타입·린트·빌드 및 Mock 확인은 실제 backend/OAuth/AI 성공과 별도로 기록한다.

과거 2026-10-24 도입 단계 DEV-06 개발 확인에서 clean 설치·57개 Chromium 테스트·Storybook 빌드·타입·린트가 통과했다. 긴 Windows 중앙 작업 경로의 기본 Turbopack 빌드는 실패했고 별도 `npm run build -- --webpack`은 통과했다. 기본 스크립트는 변경하지 않았다. 경로 진단·앱 Mock 화면·한계와 시점별 근거는 [가이드의 개발 확인 기록](docs/ai/storybook-guide.md#dev-06-개발-단계-확인-기록)을 따른다. 최종 독립 QA·검수·전달 상태는 run 증거와 Wiki에서 확인한다.

2026-10-27 확장 DEV-13 개발 확인에서 전체273 기능·12시각 비교·타입·린트·정적 Storybook이 통과했다. 긴 경로 기본 build 실패와 별도 webpack/자체 clean 설치한 짧은 실제 복사본의 기본 build 성공을 각각 기록했다. audit21과 개별 접근성·제품 한계는 남는다. [현재 개발 확인 기록](docs/ai/storybook-extension-verification.md)과 [PR workflow](.github/workflows/storybook.yml)를 참고한다. 원격 CI 실행과 이후 독립 QA·Claude 검수·Wiki·finish·문서 동기화·원본 전달은 별도 증거로 확인한다.

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
