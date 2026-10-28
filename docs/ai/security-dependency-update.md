# 배포 의존성 보안 업데이트

## 목적과 범위

[이슈 #22](https://github.com/Tim3208/CampusPolio_FE/issues/22)의 기존 Next.js 및 이미지 처리 라이브러리 보안 경고를 줄인다. 기준은 Sentry 클라이언트 오류 수집이 병합된 main `8b19d4da2fbd5f1145b6679fbd32201ec6ddc814`이다. 제품 API 계약과 기존 사용자 동작은 변경하지 않는다.

## 의존성 변경

- `next`와 `eslint-config-next`를 각각 16.2.6에서 16.4.3으로 올린다. 보안 권고에 포함된 사용 여부 및 환경별 조건은 아래 근거를 따른다.
- Next.js의 이미지 처리에 설치되는 `sharp`는 잠금 파일 기준 0.34.5에서 0.35.5로 갱신한다.
- 소스에서 사용하지 않는 `react-router-dom`을 제거한다. 앱 라우팅은 기존 Next.js App Router를 사용한다.
- `shadcn` CLI를 4.7.0에서 4.23.0으로 올리고 개발 의존성으로 이동한다. 사용자의 선택에 따라 새 버전의 CSS도 적용한다. 기존 CSS 뒤에 새 스크롤 페이드·시머 유틸리티와 전역 속성 선언이 추가되며, 현재 소스에서 해당 이름을 사용하는 곳은 확인되지 않았다. `src/app/globals.css`가 `shadcn/tailwind.css`를 **빌드할 때** 사용하므로 개발 의존성을 포함해 설치한 뒤 빌드해야 한다. Vercel의 기본 설치에도 개발 의존성이 포함되지만, 설치 명령이나 환경 설정을 따로 변경한 배포는 별도 확인이 필요하다.
- `@sentry/nextjs` 11.8.0과 기존 수집 설정은 유지한다. SDK가 선언한 Next.js peer 범위는 16.x를 포함한다. 버전 범위 일치와 실제 브라우저 동작 검증은 구분한다.

## 보안 권고와 적용 조건

- [Next.js 이미지 최적화의 SVG 관련 권고](https://github.com/advisories/GHSA-2464-fhr4-w9xw)는 수정된 Next.js와 `sharp` 버전을 안내한다. 현재 앱은 Next 이미지 최적화를 사용한다.
- [AVIF 관련 권고](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)와 [Vercel의 플랫폼 완화 설명](https://vercel.com/blog/reproducing-disclosing-and-fixing-the-libheif-vulnerability-with-hacktron-and-the-maintainers)을 함께 확인한다. AVIF에 대한 Vercel의 완화를 다른 이미지 관련 권고에 확대 적용하지 않는다.
- [Cache Component 관련 권고](https://github.com/advisories/GHSA-673q-mjm6-r5xr)는 해당 기능의 특정 사용 조건을 설명하면서 수정 버전으로 업데이트하도록 권장한다. 현재 코드에서 `use cache`와 `next/og` 사용은 확인되지 않았다.
- [Windows 서버 관련 권고](https://github.com/advisories/GHSA-p293-qw3h-jr36)는 Windows 호스팅이라는 전제에 따라 운영 Vercel과 로컬 개발 환경을 구분한다.

## 개발 검증 — 2026-10-28

Node 24.22.1, npm 10.9.9, 변경 잠금 파일 SHA-256 `F814A10B680D012D22966F6C21B2ACCDC1FBB6A4683DC6E41730666027B07596` 기준이다.

- 전체 의존성 clean `npm ci`와 `npm ls`, 타입 검사(`tsc --noEmit --incremental false`), ESLint, 기본 Turbopack 프로덕션 빌드가 통과했다. 최종 빌드는 Mock API를 활성화해 수행했다.
- 초기 타입 검사에서 이전 검증용 임시 라우트를 가리키는 `.next/types`가 남아 실패했고, 프로덕션 빌드로 타입 산출물을 갱신한 뒤 재검사해 통과했다. 임시 라우트는 소스에 남아 있지 않다.
- 별도 디렉터리에서 `npm ci --omit=dev` 및 `npm ls --omit=dev --depth=0`이 통과했다. Next.js 16.4.3, Sentry 11.8.0, sharp 0.35.5가 있고 빌드 전용 shadcn·TypeScript·Tailwind는 없다. 이 결과는 해당 디렉터리에서 실제 서비스를 기동한 검증은 아니다.
- 새 shadcn CLI의 `--version` 및 `mcp --help` 명령이 실행됐다. CLI의 모든 기능을 검증한 것은 아니다.
- `npm audit --omit=dev` 결과는 기준 main의 24개 패키지 경고(critical 2)에서 0개로 감소했다. 전체 설치 기준은 3개 패키지 경고(low 3 / high 0 / critical 0)이다. 현재 수정 버전이 없는 개발용 [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4)와 이를 사용하는 `@shadcn/registry`·`shadcn`에 해당한다. 운영 감사 0개가 빌드 도구의 경고가 없다는 뜻은 아니다.
- 서버 없이 Chromium에서 원본 Sentry 초기화 파일과 전역 오류 컴포넌트를 별도 번들로 실행했다. DSN이 없으면 전송하지 않고, 가상 DSN에서는 일반 오류·Promise 거부·전역 오류 컴포넌트 effect를 수집하며 서버 digest 오류는 제외했다. 사용자·HTTP 헤더/본문·URL query는 이벤트에 없었다. 모든 수집 요청은 격리 브라우저에서 가로채 실제 Sentry로 전송하지 않았다. 테스트의 Next 오류 화면과 일부 Node 모듈은 대체 구현이므로 실제 Next 앱의 오류 전파와 대시보드 수집 검증을 대신하지 않는다.
- 실제 Next 이미지 변환 함수와 `sharp`로 작은 PNG를 WebP로 변환하고, 이미지 최적화 설정으로 허용 호스트·미허용 호스트·프로토콜 상대 URL을 검사했다. 검색 URL 생성과 로그인 복귀 경로 규칙도 서버 없이 확인했다. 이는 실제 HTTP 응답이나 사용자 흐름 전체의 검증은 아니다.
- 실제 프로젝트 작성 컴포넌트와 API 클라이언트를 격리 Chromium에 번들링하고 라우터·API 응답은 메모리 대역으로 제공했다. 빈 제목 저장 차단, 임시저장의 생성→수정 요청, 공개 등록의 생성→수정→발행 요청, 미인증 사용자 저장 차단이 통과했다. 이는 실제 Next 라우트·서버 인증·저장 지속성의 검증은 아니다.
- 새 CSS 적용 전후 `mypage/support`의 인증 확인 중 정적 초기 화면을 JavaScript와 외부 요청을 차단한 Chromium에서 비교했다. 360×800과 1280×800 모두 화면 픽셀 차이는 0개였으며 헤더·본문 위치도 같았다. 한 정적 화면의 비교이므로 동적 화면과 모든 상호작용의 동일성을 뜻하지 않는다.
- 로컬 Next.js 검증 서버 실행은 자동 승인 검토에서 `blocked by policy`로 거부됐다. 구체적 거부 사유는 반환되지 않았다. 따라서 준비한 가짜 API 기반 프로젝트 저장과 로컬 Next 앱 전체의 브라우저 회귀는 실행하지 못했다.

실제 서버·OAuth·운영 Sentry 대시보드는 검증하지 않았다. main에 아직 포함되지 않은 별도 Storybook 후속 작업의 결과도 이 검증에 포함하지 않는다.
