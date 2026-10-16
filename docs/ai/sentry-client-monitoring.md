# Sentry 클라이언트 오류 수집

## 목적과 범위

[이슈 #20](https://github.com/Tim3208/CampusPolio_FE/issues/20)의 멘토링 시연을 위해 브라우저 오류를 수집한다. Next.js 16.2.6, React 19.2.4에 `@sentry/nextjs` 11.8.0을 사용한다. 디자인·기존 UI·Storybook은 수정하지 않는다.

## 현재 구현

- `src/instrumentation-client.ts`: DSN이 있을 때 브라우저 SDK를 초기화한다. 처리되지 않은 JavaScript 오류와 Promise 거부를 자동 수집한다.
- `src/app/global-error.tsx`: 전역 오류 경계의 클라이언트 렌더링 오류를 전송하고 Next.js 기본 오류 화면을 표시한다. 서버 오류의 digest가 있는 경우 전송하지 않는다.
- `next.config.ts`: 기존 이미지·rewrite·헤더 설정을 보존하며 Sentry 설정을 연결한다. 서버 자동 계측과 소스맵 생성·업로드를 비활성화한다.
- 성능 추적, 세션 리플레이, 로그 수집을 활성화하지 않는다. SDK 11의 `dataCollection`에서 사용자 정보·쿠키·HTTP 헤더와 본문·URL query·스택 지역변수 수집을 끈다. 이것이 오류 메시지나 URL 경로에 포함된 모든 개인정보를 제거한다는 뜻은 아니다.
- 기존 코드에서 `catch`로 처리한 오류와 HTTP 오류 응답 자체를 일괄 전송하지 않는다.

## 로컬 설정

Sentry 프로젝트의 Settings → Client Keys (DSN)에서 주소를 복사해 `.env.local`에 추가하고 개발 서버를 재시작한다.

```dotenv
NEXT_PUBLIC_SENTRY_DSN=YOUR_SENTRY_PROJECT_DSN
```

DSN은 브라우저에서 사용하는 공개 수집 주소다. 관리용 인증 토큰과 다르며, 이번 설정에는 `SENTRY_AUTH_TOKEN`이 필요하지 않다. `.env.local`은 Git에서 제외한다. DSN이 없으면 SDK를 초기화하지 않는다. 배포 시에는 빌드 환경에도 DSN이 필요하다.

## 검증 상태

2026-10-16: SDK 설치 후 타입 검사는 통과했다. 설치 직후 전체 린트는 출력 없이 지연되어 중단했다. 연결 설정 후 검사 결과는 아래에 추가한다.

- 연결 설정 후 `npx tsc --noEmit --incremental false`, `npm run lint`, `npm run build` 모두 통과했다.
- `git diff --check` 통과, `.env.local`의 Git 제외를 확인했다.
- 빌드 경고: 상위 `C:\mytask\package-lock.json` 때문에 Next.js가 workspace root를 상위 폴더로 추론한다. 빌드는 성공했으며 이번 범위에서 상위 파일이나 프로젝트 구조를 변경하지 않았다.
- npm 설치 시 전체 의존성 보안 알림 29건이 보고되었다. Sentry 추가로 발생한 항목과 기존 항목은 아직 분류하지 않았고 자동 수정은 실행하지 않았다.

- 실제 브라우저 오류 발생·수집 서버 전송·Sentry 대시보드 표시: 아래 검증 통과.
- 소스맵 업로드: 미구현. 배포 번들의 원본 TypeScript 파일·행 번호 복원은 보장하지 않는다.
- 실제 백엔드·OAuth 회귀 검증: 아직 미실행.

## 검증 원칙

사용자 승인 후 테스트 오류를 브라우저에서 발생시켰다. 네트워크 전송 성공과 대시보드에서 동일 오류를 확인한 결과를 구분해 기록한다. 가입 시 생성된 sample error는 실제 수집 성공의 증거로 사용하지 않는다.

## 실제 브라우저 전송 검증 — 2026-10-16

프로덕션 빌드를 `npm run start -- --hostname 127.0.0.1 --port 3001`로 실행하고, 별도 임시 프로필의 headless Chrome에서 접속했다. 개인 브라우저 세션은 사용하지 않았다. Chrome DevTools Protocol로 다음 코드를 실제 페이지에서 실행했다. 앱 소스에 테스트 버튼이나 오류를 추가하지 않았다.

```js
setTimeout(() => {
  throw new Error("CampusPolio-Sentry-demo-2026-10-16T10:58:40.182Z-uncaught");
}, 0);
Promise.reject(
  new Error("CampusPolio-Sentry-demo-2026-10-16T10:58:40.182Z-rejection"),
);
```

| 항목 | 결과 |
|---|---|
| 페이지 로드 | title `CampusPolio`, readyState `complete` |
| 일반 오류 event ID | `e36af4c2829f40deac9f73a5530e7fee` |
| Promise 거부 event ID | `56578e14af0247c99112b2d75bbe1606` |
| 자동 수집 | 각각 `auto.browser.browserapierrors.setTimeout`, `auto.browser.global_handlers.onunhandledrejection`; 둘 다 `handled: false` |
| 환경 | `production` (로컬에서 프로덕션 빌드 실행) |
| 개인정보 확인 | 두 오류 이벤트 모두 `user` 필드 없음 |
| 수집 서버 응답 | 관측한 Sentry 요청 4건 모두 HTTP 200 |
| 대시보드 표시 | 2026-10-16 20:01 KST 사용자 제공 스크린샷에서 일반 오류 `JAVASCRIPT-NEXTJS-2`, Promise 거부 `JAVASCRIPT-NEXTJS-3` 확인. 각각 Events 1, Unhandled 표시 |

두 오류 이벤트의 전송과 대시보드 표시를 확인했다. 대시보드는 직접 로그인해 조회하지 않고 사용자가 제공한 화면으로 확인했다. 재확인 시 Issues에서 `CampusPolio-Sentry-demo`를 검색하고 Environment는 All Envs 또는 production으로 선택한다. React 렌더링 오류 경계의 실제 동작과 DSN 미설정 상태의 브라우저 검증은 아직 수행하지 않았다. 페이지 로드 확인은 실제 백엔드·로그인 등 전체 기능 회귀 검증을 의미하지 않는다.

## 참고

- [Sentry Next.js 수동 설정](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
- [Next.js 클라이언트 초기화 진입점](https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client)
