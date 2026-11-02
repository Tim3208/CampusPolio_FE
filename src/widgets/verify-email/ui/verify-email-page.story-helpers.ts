import axe from "axe-core";
import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { emailUser, schoolEmail, type EmailScenario } from "./verify-email-page.story-fixtures";

type RequestRecord = { method: string; path: string; query: string; body: unknown };
export const emailRequests: RequestRecord[] = [];
let scenario: EmailScenario = "ready";
let generation = 0;
const pending = new Set<() => void>();
const countdowns = new Map<number, () => void>();
let restoreClock: (() => void) | undefined;
let nextTimerId = -1;

/** 해당 iframe의 인증 코드가 열린 동안 생성되는 1초 countdown만 수동 tick으로 제어한다. */
export function installEmailClock() {
  restoreClock?.();
  const originalSet = window.setInterval;
  const originalClear = window.clearInterval;
  window.setInterval = ((callback: TimerHandler, timeout?: number, ...args: unknown[]) => {
    const input = document.querySelector<HTMLInputElement>('[aria-label="1번째 인증번호"]');
    if (timeout === 1000 && typeof callback === "function" && input) {
      const id = nextTimerId--;
      countdowns.set(id, () => callback(...args));
      return id;
    }
    return Reflect.apply(originalSet, window, [callback, timeout, ...args]);
  }) as typeof window.setInterval;
  window.clearInterval = (id: Parameters<typeof window.clearInterval>[0]) => {
    if (typeof id === "number" && countdowns.delete(id)) return;
    Reflect.apply(originalClear, window, [id]);
  };
  restoreClock = () => {
    countdowns.clear();
    window.setInterval = originalSet;
    window.clearInterval = originalClear;
    restoreClock = undefined;
  };
}

/** React 업데이트를 반영하며 실제 제품 countdown callback을 지정 횟수 실행한다. */
export async function advanceEmailSeconds(seconds: number) {
  for (let index = 0; index < seconds; index++) {
    for (const tick of [...countdowns.values()]) tick();
  }
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

/** 대기 중인 로컬 응답을 해제한다. 실제 메일 서버는 사용하지 않는다. */
export function releaseEmailResponse() {
  for (const release of pending) release();
  pending.clear();
}

/** 이전 응답을 무효화하고 요청 기록과 시나리오를 초기화한다. */
export function resetEmailScenario(next: EmailScenario) {
  generation++;
  releaseEmailResponse();
  scenario = next;
  emailRequests.length = 0;
  countdowns.clear();
}

/** 스토리 종료 시 대기 응답과 제어된 interval을 정리한다. */
export function cleanupEmailScenario() {
  generation++;
  releaseEmailResponse();
  restoreClock?.();
  emailRequests.length = 0;
}

/** 요청 자체의 method/path/query/body를 보존한다. */
async function record(request: Request, requestGeneration: number) {
  const url = new URL(request.url);
  const body = request.method === "GET" ? null : await request.json();
  if (requestGeneration !== generation) return;
  emailRequests.push({ method: request.method, path: url.pathname, query: url.search, body });
}

/** 명시적 해제 또는 cleanup까지 로컬 응답을 기다린다. */
async function hold() {
  await new Promise<void>((resolve) => pending.add(resolve));
}

/** OpenAPI의 success/data envelope를 유지하여 실패를 반환한다. */
function failure(status: number) {
  return HttpResponse.json({ success: false, data: { message: "가상 인증 오류" } }, { status });
}

export const emailHandlers = [
  http.get("/api/users/me", async ({ request }) => {
    const current = scenario;
    const requestGeneration = generation;
    await record(request, requestGeneration);
    if (requestGeneration !== generation) return HttpResponse.error();
    const attempt = emailRequests.filter((item) => item.method === "GET").length;
    if (current === "user-pending" || (current === "user-retry-pending" && attempt > 1)) await hold();
    if (requestGeneration !== generation) return HttpResponse.error();
    if (current === "signed-out") return failure(401);
    if (current === "user-error" || current === "user-retry-error" || (current.startsWith("user-retry-") && attempt === 1)) return failure(404);
    if (current === "user-retry-unauthorized") return failure(401);
    return HttpResponse.json({ success: true, data: { ...emailUser, email: current === "user-retry-pending" ? schoolEmail : emailUser.email, universityVerified: current === "already-verified" || current === "user-retry-verified" } });
  }),
  ...(["send", "resend", "verify"] as const).map((action) =>
    http.post(`/api/auth/email/${action}`, async ({ request }) => {
      const current = scenario;
      const requestGeneration = generation;
      await record(request, requestGeneration);
      if (requestGeneration !== generation) return HttpResponse.error();
      if (current === `${action}-pending`) await hold();
      if (requestGeneration !== generation) return HttpResponse.error();
      if (current === `${action}-unauthorized`) return failure(401);
      if (current === `${action}-error` && emailRequests.filter((item) => item.path.endsWith("/" + action)).length === 1) return failure(400);
      return HttpResponse.json({ success: true, data: { message: action === "verify" ? "학교 이메일 인증이 완료되었습니다." : "인증번호가 발송되었습니다." } });
    }),
  ),
];

/** 현재 UI에서 이메일을 입력하고 코드 발송을 실행한다. */
export async function sendEmailFromCanvas(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const email = canvas.getByLabelText("UNIVERSITY EMAIL");
  await waitFor(() => expect(email).toBeEnabled());
  await userEvent.clear(email);
  await userEvent.type(email, schoolEmail);
  await userEvent.click(canvas.getByRole("button", { name: "코드 전송" }));
}

/** 6개 입력칸에 실제 클립보드 이벤트로 숫자·비숫자 혼합 값을 붙여넣는다. */
export async function pasteEmailCode(canvasElement: HTMLElement, text = "12a3456") {
  const first = within(canvasElement).getByLabelText("1번째 인증번호");
  await userEvent.click(first);
  const data = new DataTransfer();
  data.setData("text", text);
  first.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }));
  await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
}

/** API 송신의 userId query·JSON·횟수를 실제 기록과 비교한다. */
export async function expectEmailRequest(action: string, body: unknown, count = 1) {
  await waitFor(() => {
    const requests = emailRequests.filter((item) => item.path === `/api/auth/email/${action}`);
    expect(requests).toHaveLength(count);
    expect(requests[count - 1]).toEqual({ method: "POST", path: `/api/auth/email/${action}`, query: `?userId=${emailUser.id}`, body });
  });
}

/** 현재 인증 화면으로 돌아오는 next를 포함한 로그인 URL을 만든다. */
export function emailLoginPath(nextPath: string) {
  return "/login?" + new URLSearchParams({ next: "/verify-email?" + new URLSearchParams({ next: nextPath }) });
}



/** 같은 이벤트 차례의 반복 클릭과 form Enter에 해당하는 제출도 실제 DOM으로 전달한다. */
export function repeatEmailAction(canvasElement: HTMLElement, button: HTMLElement) {
  for (let index = 0; index < 3; index++) {
    button.click();
    canvasElement.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  }
}

/** 현재 렌더 상태 전체의 실제 axe 위반을 확인한다. 기본 규칙을 생략하지 않는다. */
export async function expectEmailAccessibility(canvasElement: HTMLElement) {
  const result = await axe.run(canvasElement);
  expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
}

/** 코드 값과 관련 설명·오류 연결을 검사한다. */
export function expectEmailDigits(canvasElement: HTMLElement, code: string) {
  const canvas = within(canvasElement);
  for (let index = 0; index < 6; index++) {
    expect(canvas.getByLabelText(`${index + 1}번째 인증번호`)).toHaveValue(code[index] ?? "");
  }
}
