# Storybook 전용 인증 경계

제품 `src/shared/config/env.ts`, `next/script`, Google 버튼 모듈은 변경하지 않는다. `main.ts`의 Vite 설정에서만 환경 모듈과 Script를 교체하고 버튼 모듈의 singleton 정리 함수를 연결한다. 기본 API 주소와 Google ID는 빈 문자열, 내부 Mock은 false/unverified다.

- 스토리의 `beforeEach`에서 `configureGoogleScenario({ configured: true, scriptState: "waiting", sdk })`로 명백한 가상 ID와 선택적인 로컬 SDK double을 준비한다. SDK 타입은 제품의 `window.google` 계약을 따른다.
- `setGoogleScriptState("loaded" | "error" | "waiting")`로 로컬 Script 콜백만 전달한다. Script 태그나 원격 SDK/OAuth 요청은 만들지 않는다. `configured: false`는 설정 누락 표시다.
- double의 이벤트·버튼·콜백·promise 자원은 `registerGoogleCleanup`에 정리 함수를 등록한다. SDK double은 `cancel()`에서 보관한 credential callback을 버린다.
- 공통 preview가 새 스토리 전과 종료 시 `resetGoogleScenario()`를 실행한다. 가상 ID, Script 구독, 등록 자원, 제품 모듈 singleton을 정리하고 기존 window.google descriptor를 복원한다.
- 초기 props로 상태를 만드는 wrapper에는 `scenario-controls.tsx`의 `useScenarioReset` / `ScenarioControls`를 사용할 수 있다. 최초 렌더와 명시적인 reset/시나리오 전환에서만 key를 변경한다. Controls 텍스트 입력에는 `useArgs` 또는 안정된 controlled 상태를 사용한다.

`STORYBOOK_TEST_PORT=6211`처럼 1024~65535의 정수만 runner에 전달한다. Vitest browser API는 127.0.0.1과 strictPort를 사용하며 포트가 이미 사용 중이면 다른 포트로 조용히 이동하지 않는다. viewport 툴바 preset은 자동 검사 viewport를 설정하지 않는다.

이 경계의 fixture/MSW 검사는 실제 OAuth·세션·backend 성공을 뜻하지 않는다.
