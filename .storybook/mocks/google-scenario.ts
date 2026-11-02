type GoogleSdk = NonNullable<Window["google"]>;
type ScriptState = "waiting" | "loaded" | "error";
type ScriptListener = (state: ScriptState) => void;

const listeners = new Set<ScriptListener>();
let moduleReset: (() => void) | undefined;
let previousGoogle: PropertyDescriptor | undefined;
let ownsGoogle = false;
let configured = false;
let scriptState: ScriptState = "waiting";
const cleanups = new Set<() => void>();

/** 실제 설정과 구분되는 가상 client ID만 지정 시나리오에 제공한다. */
export function getStorybookGoogleClientId() {
  return configured ? "storybook-only.invalid.apps.googleusercontent.com" : "";
}

/** Vite의 Storybook 전용 변환이 제품 모듈 singleton 정리 함수를 등록한다. */
export function registerGoogleModuleReset(reset: () => void) {
  moduleReset = reset;
}

/** 스토리의 이벤트·콜백·SDK double 정리 함수를 종료 시 실행하도록 등록한다. */
export function registerGoogleCleanup(cleanup: () => void) {
  cleanups.add(cleanup);
  return () => cleanups.delete(cleanup);
}

/** 원격 Script를 만들지 않고 로컬 로드 상태 변경을 구독한다. */
export function subscribeGoogleScript(listener: ScriptListener) {
  listeners.add(listener);
  listener(scriptState);
  return () => { listeners.delete(listener); };
}

/** waiting/loaded/error 표시 상태를 로컬 Script double에 전달한다. */
export function setGoogleScriptState(state: ScriptState) {
  scriptState = state;
  listeners.forEach((listener) => listener(state));
}

/** 지정된 인증 스토리만 가상 설정과 선택적 SDK double을 사용한다. */
export function configureGoogleScenario(options: { configured: boolean; scriptState?: ScriptState; sdk?: GoogleSdk }) {
  resetGoogleScenario();
  configured = options.configured;
  if (options.sdk) {
    previousGoogle = Object.getOwnPropertyDescriptor(window, "google");
    ownsGoogle = true;
    Object.defineProperty(window, "google", { configurable: true, writable: true, value: options.sdk });
  }
  setGoogleScriptState(options.scriptState ?? "waiting");
}

/** 기본 빈 설정과 기존 SDK를 복원하고 시나리오 자원 및 제품 singleton을 정리한다. */
export function resetGoogleScenario() {
  for (const cleanup of cleanups) cleanup();
  cleanups.clear();
  moduleReset?.();
  if (ownsGoogle) {
    window.google?.accounts.id.cancel();
    if (previousGoogle) Object.defineProperty(window, "google", previousGoogle);
    else delete window.google;
  }
  previousGoogle = undefined;
  ownsGoogle = false;
  configured = false;
  scriptState = "waiting";
  listeners.clear();
}
