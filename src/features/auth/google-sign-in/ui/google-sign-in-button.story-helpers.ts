import { http, HttpResponse } from "msw";
import { configureGoogleScenario, registerGoogleCleanup, resetGoogleScenario } from "../../../../../.storybook/mocks/google-scenario";
import { fakeCredential, googleUser, type GoogleScenario } from "./google-sign-in-button.story-fixtures";

type Sdk = NonNullable<Window["google"]>;
type CredentialCallback = Parameters<Sdk["accounts"]["id"]["initialize"]>[0]["callback"];
export const googleRequests: { method: string; path: string; query: string; body: unknown }[] = [];
export const sdkObservations = { initialized: 0, rendered: 0, cancelled: 0, clientId: "", callbacks: 0 };
let scenario: GoogleScenario = "missing";
let generation = 0;
const pending = new Set<() => void>();

/** 로컬 로그인 응답 대기를 풀며 실제 OAuth는 실행하지 않는다. */
export function releaseGoogleResponse() {
  for (const resolve of pending) resolve();
  pending.clear();
}

/** 승인된 공통 경계에 로컬 SDK와 명시적 시나리오를 설정한다. */
export function setupGoogleStory(next: GoogleScenario) {
  generation++;
  releaseGoogleResponse();
  resetGoogleScenario();
  scenario = next;
  googleRequests.length = 0;
  Object.assign(sdkObservations, { initialized: 0, rendered: 0, cancelled: 0, clientId: "", callbacks: 0 });
  let callback: CredentialCallback | undefined;
  const buttons = new Set<HTMLButtonElement>();
  /** 가상 SDK 버튼을 직접 누른 경우에만 credential callback을 호출한다. */
  function onClick() {
    sdkObservations.callbacks++;
    callback?.(next === "no-credential" ? {} : { credential: fakeCredential });
  }
  const sdk: Sdk = { accounts: { id: {
    /** 제품 initialize 인수와 callback을 관찰한다. */
    initialize(options) {
      sdkObservations.initialized++;
      sdkObservations.clientId = options.client_id;
      callback = options.callback;
    },
    /** Google 원격 UI 대신 명확히 표시된 로컬 버튼을 만든다. */
    renderButton(parent) {
      sdkObservations.rendered++;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "가상 Google 계정으로 계속";
      button.className = "rounded border border-slate-500 px-4 py-2 text-slate-900";
      button.addEventListener("click", onClick);
      buttons.add(button);
      parent.replaceChildren(button);
    },
    /** 보관한 callback을 폐기한다. */
    cancel() { callback = undefined; sdkObservations.cancelled++; },
  } } };
  const useSdk = !["missing", "waiting", "script-error"].includes(next);
  configureGoogleScenario({ configured: next !== "missing", scriptState: next === "script-error" ? "error" : useSdk ? "loaded" : "waiting", ...(useSdk ? { sdk } : {}) });
  registerGoogleCleanup(() => {
    generation++;
    releaseGoogleResponse();
    callback = undefined;
    for (const button of buttons) { button.removeEventListener("click", onClick); button.remove(); }
    buttons.clear();
  });
}

/** 스토리 종료 시 전역 SDK·singleton·이벤트·대기 응답을 복원한다. */
export function cleanupGoogleStory() {
  generation++;
  releaseGoogleResponse();
  resetGoogleScenario();
  googleRequests.length = 0;
}

export const googleHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const url = new URL(request.url);
    googleRequests.push({ method: request.method, path: url.pathname, query: url.search, body: await request.json() });
    const current = scenario;
    const requestGeneration = generation;
    if (current === "pending") await new Promise<void>((resolve) => pending.add(resolve));
    if (requestGeneration !== generation) return HttpResponse.error();
    const status = current === "bad-request" ? 400 : current === "unauthorized" ? 401 : current === "server-error" ? 503 : 200;
    if (status !== 200) return HttpResponse.json({ success: false }, { status });
    return HttpResponse.json({ success: true, data: { ...googleUser, universityVerified: current !== "unverified" } });
  }),
];

