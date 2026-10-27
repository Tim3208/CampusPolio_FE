> **후속 기록 안내 — 2026-10-27:** 아래는 2026-10-26 제안 원문이다. 현재 구현·명령은 [사용 안내](storybook-guide.md), 실제 개발 확인과 제한은 [확장 개발 확인](storybook-extension-verification.md)을 따른다. 당시57개 검사/계획을 후속 승인·전체 QA로 바꾸지 않는다.

# Storybook UI 조작과 검증 확장 계획

2026-10-26 기준 분석 및 제안이다. 현재 작업 트리의 Storybook 기반을 유지하고, 직접 속성을 바꾸는 Playground와 반복 가능한 UI 검증을 단계적으로 확장한다. 우선 적용 범위는 공통 UI와 확정된 홈·탐색·상세·헤더다. 이후 프로필·편집기·포트폴리오로 넓힌다.

실행 방법과 기존 구현은 [Storybook 사용 안내](storybook-guide.md), 시각 기준은 [설계 문서 안내](README.md)와 [확정 디자인 명세](uiux-phase1-design-spec.md)를 따른다. 아래 확장 항목은 계획이며 구현 완료를 뜻하지 않는다.

## 현재 준비 상태

분석한 브랜치는 `feat/#18`, HEAD는 `a4e0061`이다. Storybook 설정·스토리·의존성·사용 안내는 작업 시작 전부터 미커밋 변경으로 존재했다. 이 계획에서는 해당 변경을 보존했다.

| 항목 | 확인된 상태 | 판단 |
|---|---|---|
| 앱 환경 | Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS 4, Radix/shadcn UI | 현재 프레임워크 구성을 유지할 수 있음 |
| Storybook | 10.6.3, `@storybook/nextjs-vite` 10.6.3 | Next.js 16·React 19가 설치 패키지의 peer 범위에 포함됨 |
| 동작 테스트 | Vitest 4.1.12, Playwright 1.64.1, Chromium | 기존 브라우저 테스트를 확장할 수 있음 |
| Mock | MSW 2.15.0, msw-storybook-addon 3.0.3 | API 성공·지연·실패를 스토리별로 제어하는 기반 있음 |
| 스토리 | 9개 파일, 57개 상태 | Button, Markdown, 홈/탐색 카드, 편집 오류 대화상자, 홈, 홈 로딩, 태그 필터, 리뷰 패널 |
| 스타일·라우팅 | 앱 CSS 공유, 한국어 문서, App Router mock | 제품과 같은 스타일·경로 의존성을 재사용 |
| 직접 조작 | `args`와 자동 추론 가능한 Controls는 있으나 명시적 `argTypes`와 전용 Playground 없음 | 가장 먼저 보강할 부분 |
| 자동 접근성·시각 비교 | a11y addon과 기준 이미지 비교 없음 | 현재 테스트 통과만으로 보장되지 않는 범위 |
| 문서·자동 검사 | 사용 안내 있음. Autodocs와 CI workflow 없음 | 개발 사용성을 갖춘 뒤 추가할 범위 |

2026-10-26에 기존 `npm run test:storybook`을 실행하여 **9개 파일·57개 테스트 PASS, exit 0**을 확인했다. 렌더 확인과 `play` 동작 검증이 함께 포함된 수치이며, 57개가 모두 별개의 상세 상호작용 테스트인 것은 아니다.

근거: [package.json](../../package.json), [main.ts](../../.storybook/main.ts), [preview.ts](../../.storybook/preview.ts), [Vitest 설정](../../vitest.config.mts), [Mock·테스트 지원 코드](../../.storybook/test-support.ts).

## 적용 방식

### 기존 FSD와 컴포넌트를 유지한다

스토리는 현재처럼 대상 컴포넌트 옆의 `*.stories.tsx`에 둔다. 가상 데이터는 같은 폴더의 `*.story-fixtures.ts`에 두고 실제 도메인 타입을 만족하게 만든다. 같은 slice는 상대 import, 다른 slice는 public API를 사용한다. Storybook 때문에 제품 컴포넌트를 이동하거나 모든 내부 컴포넌트를 공개할 필요는 없다.

Next.js의 서버 조회를 받는 widget부터 다룬다. [탐색 화면](../../src/widgets/project-collection/ui/project-collection-page.tsx)은 `projectsPage/query/viewMode/errorMessage`, [상세 화면](../../src/widgets/project/ui/project-detail-page.tsx)은 `project/errorMessage`로 상태를 재현할 수 있다. 전체 페이지 스토리에 실제 `app/page.tsx`나 서버 layout을 연결하는 방식은 기본 경로로 삼지 않는다. `next/headers`를 사용하는 [포트폴리오 생성 widget](../../src/widgets/portfolio/ui/portfolio-create-page.tsx)은 하위 `PortfolioBuilder`를 대상으로 한다.

현재 `@storybook/nextjs-vite`를 유지한다. 공식 문서도 Next.js의 독립 UI 개발과 Vitest 연동에 이 구성을 권장한다. Storybook 설정 추가가 앱의 Next.js 빌드 도구 변경을 요구하지는 않는다. [Next.js Vite 공식 문서](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite), [Vitest addon 공식 문서](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon).

### 자유 조작과 고정 상태 검증을 함께 제공한다

각 주요 컴포넌트에 사람이 조작하는 `Playground`를 추가하고, 기존 정상·빈 데이터·오류·긴 내용 등의 상태 스토리와 자동 테스트는 유지한다. Playground는 선택하자마자 클릭·닫기·요청을 수행하지 않게 구성한다. 기존 테스트의 고정 문구와 데이터 기대값은 고정 시나리오에서 검증한다.

| 대상 | Playground에서 바꾸는 값 | 사용자가 확인할 결과 |
|---|---|---|
| Button | 문구, variant, size, disabled, 아이콘 유무 | 크기·줄바꿈·비활성 표시, 클릭 이벤트 |
| 홈/탐색 카드 | 제목, 작성자, 조회 수, 태그, 이미지 정상/누락/실패 | 긴 텍스트 처리, 태그 배치, 대체 이미지 |
| MarkdownViewer | Markdown 원문, 부모 표시 폭 | 표·코드 스크롤, 긴 링크, 이미지 실패 |
| 오류 대화상자 | 오류 종류, 제목, 본문, 다시 열기 | 버튼과 문구, 닫기, 키보드 포커스 |
| 필터 Sheet | 초기 태그, 검색어, grid/list | 선택·초기화·취소·적용, 라우터 호출 |
| 리뷰 패널 | 요청 전/지연/성공/실패 시나리오 | 요청 버튼, 대기 표시, 재시도 |

복잡한 `project` 객체는 제목·태그·이미지 상태처럼 의미 있는 스토리 전용 입력으로 풀고 wrapper에서 실제 타입으로 조합한다. 테스트 편의만을 위한 제품 props는 추가하지 않는다. Controlled 입력은 `useArgs` 등으로 화면과 Controls를 동기화하고, 최초 props로 상태를 만드는 폼은 시나리오 변경이나 명시적 초기화 때만 재마운트한다. 매 키 입력마다 재마운트해서 포커스가 사라지지 않게 한다. [Controls 공식 문서](https://storybook.js.org/docs/essentials/controls).

현재 오류 대화상자는 닫은 후 같은 action의 제목만 바꾸면 다시 열리지 않을 수 있다. Playground에 다시 열기·초기화를 제공한다. 라우터 mock은 실제 조회 결과 props를 바꾸지 않으므로, URL 호출 확인과 화면 상태 전환을 구분해 설명한다.

Controls 변경은 미리보기 입력을 바꾼다. 제품 기본값이나 CSS를 영구 수정하려면 해당 소스를 수정해야 한다. 확정한 상태를 재사용하려면 새 스토리의 `args`나 fixture로 저장한다.

### 실제 요청 경계에서 상태를 재현한다

현재 Storybook의 `NEXT_PUBLIC_USE_MOCK_API=false`를 유지한다. 앱 내부 Mock은 `fetch`보다 먼저 응답하므로 MSW와 동시에 켜면 스토리별 API 제어가 작동하지 않을 수 있다. 새 handler는 [api.md](../../api.md)와 기존 `entities/*/api`의 Method·URL·응답·오류 계약을 따른다.

순수 표시 상태는 fixture props로, 요청 결과는 MSW로, Next 라우팅은 기존 navigation mock으로 제어한다. 실제 API·OAuth 설정을 Storybook에 연결하지 않고 현재의 환경 분리와 미처리 `/api` 요청 실패 처리를 유지한다. 이는 모든 외부 자산 요청까지 차단한다는 의미는 아니다.

## 컴포넌트 확장 우선순위

| 순서 | 대상 파일 또는 영역 | 필수 상태·조작 | 선행조건과 범위 |
|---|---|---|---|
| 1 | 기존 Button·카드·Markdown·오류 Dialog 스토리 | Playground, 정상/빈 값/긴 내용/비활성/이미지 실패 | 현재 fixture 재사용. 기존 57개 검증 유지 |
| 2 | `shared/ui/input.tsx`, `sheet.tsx`, `dropdown-menu.tsx` | 입력·오류·disabled, 열기·닫기, 메뉴 키보드 선택 | Radix portal을 iframe document 전체에서 검사 |
| 3 | `widgets/project-collection/ui/project-collection-page.tsx`, `project-list-item.tsx`와 skeleton | grid/list, 빈 결과, 오류, 페이지 처음/중간/마지막, 검색·정렬·태그 | props 주입으로 가능. URL 조건 보존·페이지 초기화 검사 |
| 4 | `widgets/project/ui/project-detail-page.tsx`와 skeleton | 정상, 본문/자료 없음, 긴 제목·파일명, 이미지 실패, 조회 오류 | 내부 리뷰 요청은 MSW. 실제 reload 재시도는 앱 검증 |
| 5 | `widgets/header/ui/app-header.tsx` | 로그인/비로그인, 조회 지연/실패, 모바일 메뉴, 검색 | 사용자 조회 MSW, pathname mock, 실제 viewport 필요 |
| 6 | `widgets/mypage`의 nav·shell·프로젝트/포트폴리오 목록 | 메뉴 활성, 목록 없음/오류, 공개/임시 상태, 카드/수정 이동 | 표시 widget부터 적용. 인증 게이트는 별도 흐름 |
| 7 | `features/profile/profile-settings`, `features/project/project-editor` | 필수 입력, 저장 중/오류/성공, create/edit, 업로드·권한 오류 | 초기값 재설정·여러 API handler 준비. Markdown 편집기는 먼저 독립 적용 |
| 8 | `features/portfolio/portfolio-builder`, 이메일 인증·Google 로그인 | 선택·순서·저장, 재전송·만료, SDK 로딩/오류 | 파일·타이머·SDK 의존성이 있어 별도 후속 작업 |

1~5를 첫 확장 범위로 권한다. 확정된 열람 흐름에서 사용 빈도가 높고, 대부분 props와 기존 Mock만으로 재현할 수 있다. 두 종류의 `ProjectCard`는 사용하는 도메인 타입이 다르므로 각각의 현재 slice에서 유지한다.

## 단계별 실행 계획

| 단계 | 작업과 주요 변경 대상 | 완료 조건 |
|---|---|---|
| 0. 실행 기준 정리 | 기존 변경 보존, Node/npm 팀 기준 기록, `.storybook`와 lockfile 재현 확인 | 같은 도구 버전의 clean 설치에서 기존 테스트·Storybook 빌드·타입·린트 통과 |
| 1. 조작 환경 보강 | 기존 스토리의 Playground·`argTypes`, preview의 화면 폭 preset, 같은 버전의 `@storybook/addon-docs`와 선택적 Autodocs | 대표 컴포넌트의 값 변경·이벤트 확인·초기화가 가능하고 기존 테스트 유지 |
| 2. 우선 컴포넌트 확대 | 위 우선순위 2~5의 스토리·fixture·MSW·`play`, `@storybook/addon-a11y` | 빈 상태·오류·키보드·재시도와 해당 반응형 폭 확인, 대상 접근성 검사 통과 |
| 3. PR 자동 검사 | `.github/workflows`에 설치·타입·린트·브라우저 테스트·Storybook 빌드 작업 구성 | PR에서 테스트 실패를 확인하고 빌드 산출물·실패 자료를 열람 가능 |
| 4. 화면 변화 비교 | 대표 상태 10~15개를 선정해 기준 이미지·차이 이미지 비교 추가 | 의도적인 스타일 변경을 탐지하고, 같은 환경 재실행에서 안정적으로 통과 |
| 5. 복잡한 폼 확대 | 프로필·편집기·포트폴리오·인증의 순서로 적용 | 기능별 요청·브라우저 의존성을 분리해 성공/실패·초기화 검증 |

단계 0~2가 일상적인 UI 조작·검증을 위한 첫 전달 단위다. 단계 3~4는 팀의 회귀 검증을 강화한다. 기존 가이드에서 범위 밖으로 둔 CI와 화면 비교는 이번 계획의 후속 제안이며, 기존 도입의 미완료 항목으로 소급하지 않는다.

현재 호스트는 Node 25.9.0/npm 9.9.4이며, 기존 개발 가이드는 npm 10.9.9의 clean 설치 결과를 기록한다. 이번 `npm run` 성공이 npm 9 설치 호환성을 증명하지는 않는다. 팀과 CI에는 **Node 24 LTS와 npm 10.9.9를 후보 기준으로 고정하고 clean 설치부터 재검증**하는 편이 적합하다. Node 24는 현재 공식 LTS 목록에 포함되어 있다. [Node.js 릴리스 현황](https://nodejs.org/en/about/previous-releases).

추가하는 Storybook addon은 현재 10.6.3 계열과 버전을 맞춘다. 기존 설정이 있으므로 전체 초기화 명령을 다시 실행할 필요는 없다. 자동 문서는 사용 목적·props 설명·대표 상태부터 제공하고, MDX가 실제로 필요해질 때 검색 패턴을 확장한다. [Autodocs 공식 문서](https://storybook.js.org/docs/writing-docs/autodocs).

## 검증 기준

### 화면과 반응형

시각 기준은 기존 최종 HTML 시안과 확정 토큰이다. Storybook 도입을 이유로 색·크기·FSD·API 계약을 재선정하지 않는다. `.dark` 토큰이 있어도 전체 화면의 다크 테마 완성을 첫 도입 조건으로 추가하지 않는다.

프로젝트용 viewport preset은 **360·375·768·1024·1280·1440px**을 제공한다. 360/768/1024/1280은 확정 디자인, 375/768/1440은 기존 Storybook 개발 확인 폭이다. 모든 스토리를 모든 폭으로 늘리지 않고 다음처럼 선택한다.

- 공통 입력·카드: 실제 부모 폭과 모바일·데스크톱 대표 폭.
- 헤더·필터·화면 조합: 360/768/1024/1280, 필요 시 375/1440.
- 배치 전환이 중요한 화면: 767/768, 1023/1024, 1279/1280 경계 추가.
- Markdown: 긴 표·코드의 내부 스크롤과 문서 전체 가로 넘침을 구분.

Storybook 툴바 preset과 자동 테스트의 실제 viewport를 각각 설정한다. 툴바를 추가한 것만으로 여러 폭의 자동 테스트가 실행되지는 않는다. [Viewport 공식 문서](https://storybook.js.org/docs/essentials/viewport).

### 동작과 접근성

기존 `play`에 역할·접근 가능한 이름 기반의 클릭·입력·Tab·Enter·Space·Escape 검증을 추가한다. 필터는 취소 시 미적용, 적용 시 정확한 URL, 메뉴·Dialog는 포커스 복귀, 리뷰는 중복 요청 방지와 실패 후 재시도를 확인한다. 스토리 재방문 시 spy·MSW 요청 횟수·지연 응답·스크롤·열림 상태가 초기화되어야 한다.

`@storybook/addon-a11y`를 추가하고 정상 지원 대상은 `parameters.a11y.test='error'`로 실패를 드러낸다. 기존 위반이 있다면 항목별 근거와 수정 작업을 남기고 제한적으로 `todo`를 사용한다. `todo`는 CI 통과 차단 장치가 아니므로 접근성 검증 완료로 계산하지 않는다. 자동 검사와 함께 키보드 이동·포커스·축소 폭은 직접 확인한다. [접근성 검사 공식 문서](https://storybook.js.org/docs/writing-tests/accessibility-testing).

### 시각 회귀

현재 `screenshotDirectory`는 출력 경로이며 기준 이미지 비교 기능은 구성되지 않았다. 기존 Vitest 4 Browser Mode의 `toMatchScreenshot`를 활용하는 방식을 우선 검토한다. 먼저 카드 하나를 별도 시각 테스트에서 재현해 Next mock·MSW·CSS가 동일하게 적용되는지 확인한 뒤 확대한다. 일상 스토리의 `play`에 Vitest 전용 import를 섞지 않고, 같은 story/fixture를 재사용하는 테스트 경계를 둔다. [Vitest 4 시각 회귀 지원](https://v4.vitest.dev/blog/vitest-4#visual-regression-testing).

다음 조건을 고정해야 이미지 차이가 UI 변경을 의미한다.

- CI의 운영체제·Chromium·viewport·배율·로케일·시간대.
- 로컬 이미지, fixture의 날짜·수치, 폰트 로딩 완료, 애니메이션·캐럿 처리.
- 현재 CDN Pretendard의 동일 버전 공급 방식. 폰트가 로드되지 않은 대체 글꼴 화면을 기준으로 채택하지 않음.
- 모바일 Sheet·Dialog 등 portal을 포함한 캡처 범위.

기준 이미지는 Git 추적 위치에, 실제/차이 이미지는 `build/` 산출물에 보관한다. 현재 `build/`는 무시되므로 그 안에만 기준 이미지를 두지 않는다. PR에서 의도한 디자인 변경을 확인한 뒤 기준을 갱신한다. 유료 서비스나 공개 호스팅은 첫 확장에 필요하지 않으며, 공유·승인 UI가 필요해지면 Chromatic 등 별도 서비스를 비교한다.

### 실제 앱에서 남길 검증

Storybook은 컴포넌트 표시·조작·Mock 요청 경계를 확인한다. 실제 서버 인증·저장·공개 권한·SSR·라우팅 결과는 앱에서 검증한다. 특히 다음 항목을 구분한다.

| 항목 | Storybook에서 확인 | 앱에서 확인 |
|---|---|---|
| 탐색 | 검색·정렬·필터의 URL, 전달된 목록·오류 표시 | URL에 따른 서버 조회와 결과 갱신 |
| 상세 | 본문·이미지·자료·리뷰 Mock 상태 | 서버 조회·404·SSR·실제 재조회 |
| 프로필·편집 | 입력·검증·요청 payload·Mock 오류 | 세션·실제 저장·파일 업로드·권한 |
| 로그인 | 설정 누락·SDK 대기·오류 UI | Google OAuth와 실제 세션 생성 |

`ProjectDetailError`의 재시도는 현재 `window.location.reload()`이므로 초기 스토리에서는 오류 표시를 확인한다. 이를 Storybook 내부에서 검증할 필요가 생길 때만 기본 동작을 유지하는 callback 경계를 검토한다. Markdown 편집기의 선택 영역·`execCommand`·`window.prompt`, 인증의 타이머도 해당 기능 확장 단계에서 다룬다.

## 개발 흐름과 첫 전달 기준

UI 변경 시 관련 스토리에서 상태와 폭을 선택하고 Playground로 경계값을 확인한다. 실제 컴포넌트를 수정한 뒤 재발 방지가 필요한 동작을 `play`에 남기고 관련 테스트를 실행한다. 전달 시 전체 Storybook 테스트와 타입·린트·빌드를 확인하고, 변경과 관련된 실제 앱 흐름을 별도로 확인한다.

```sh
npm run storybook
npm run test:storybook
npm run build-storybook
npx tsc --noEmit --incremental false
npm run lint
npm run build
```

첫 전달의 완료 조건은 다음과 같다.

1. 기존 57개 테스트가 유지되고 새 스토리의 상태·조작 검증이 통과한다.
2. Button·두 카드·Markdown·오류 Dialog를 Controls에서 조작하고 초기화할 수 있다.
3. 탐색·상세·헤더에서 정상·빈 데이터·오류와 모바일 배치를 재현한다.
4. API Mock 누락이 실패로 드러나고 스토리 간 상태가 남지 않는다.
5. 대상 접근성 자동 검사와 관련 키보드 흐름을 확인한다.
6. 사용 안내에서 조작용 스토리, 자동 실행 스토리, 실제 앱 검증 범위를 구분한다.

## 이번 분석의 확인 결과

| 확인 | 결과 |
|---|---|
| 브랜치·변경 상태, 코드·설정·문서 대조 | 기존 미커밋 Storybook 기반과 9개 파일·57개 스토리 확인 |
| 설치 패키지 버전·peer 범위 | 현재 Next.js·React·Storybook·Vitest 조합의 선언 범위 확인 |
| `npm run test:storybook` | 2026-10-26, Node 25.9.0/npm 9.9.4, Chromium 9개 파일·57개 PASS, exit 0 |
| 실행 안내 | 기존 `setProjectAnnotations`의 수동 설정을 자동 제공 방식으로 정리할 수 있다는 안내 출력. 테스트 오류는 아님 |
| 이번 변경 | 이 계획 문서와 문서 목차 링크만 작성 |
| 재실행하지 않은 범위 | clean 설치, Storybook 개발 화면 수동 조작, 정적 빌드, 앱 빌드, 실제 백엔드·OAuth |

기존 가이드에는 긴 Windows 작업 경로에서 기본 Turbopack 빌드 실패와 별도 webpack 빌드 성공이 기록되어 있다. 이번 분석에서는 앱 빌드를 재현하지 않았다. 단계 0에서는 실제 짧은 체크아웃 경로 또는 CI에서 기본 빌드를 확인하며, webpack 대체 실행만으로 기본 빌드 성공이라고 기록하지 않는다.


## 2026-10-27 확장 개발 인계

DEV01 공통기반 → DEV02~10 대상 스토리 → DEV11 시각12개 → DEV12 PR workflow가 각각 실제 Claude 승인된 입력이며, DEV13은 이 통합 후보의 사용 문서와 최종 개발자 확인을 기록한다. 현재28파일273개 기능, 접근성error180/todo93, 별도시각10파일12개다. 원래 계획의 전체 독립QA18개를 축소하거나 실행한 것으로 대체하지 않는다.

전체 타입·린트·기능·시각·정적빌드 검사와 개발/정적Storybook·별도내부Mock앱 대표조작을 새 증거로 확인했다. 긴경로 기본Next실패/별도webpack성공/짧은실제copy자체clean설치·기본build성공은 구분한다. UIUX·과거Storybook·57개·SKIPPED_QUOTA·WAITING_QUOTA·BLOCKED 이력은 유지한다. DEV13 작성시점 후속 실제Claude검수·독립QA·Wiki·finish·문서동기화·원본전달은 각각 별도gate이며 이후 결과는 run증거를 따른다.
