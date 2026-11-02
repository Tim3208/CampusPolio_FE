import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { createdProfile, updatedProfile, type ProfileScenario } from "./profile-settings-form.story-fixtures";

type WireRequest = { method: string; path: string; query: string; body: unknown; contentType: string | null; credentials: RequestCredentials };
type ScenarioState = { scenario: ProfileScenario; requests: WireRequest[]; releases: Set<() => void>; disposed: boolean };
let state: ScenarioState = { scenario: "success", requests: [], releases: new Set(), disposed: false };

/** 해당 iframe의 대기 응답을 해제하고 이전 요청 기록을 폐기한다. */
export function resetProfileScenario(scenario: ProfileScenario = "success") {
  disposeProfileScenario();
  state = { scenario, requests: [], releases: new Set(), disposed: false };
  getRouter().refresh.mockClear();
}

/** 미완료 요청이 다음 시나리오에 응답하지 않도록 인스턴스를 폐기한다. */
export function disposeProfileScenario() {
  state.disposed = true;
  for (const release of state.releases) release();
  state.releases.clear();
}

/** 사용자가 선택한 지연 응답을 타이머 없이 완료한다. */
export function releaseProfileResponse() {
  for (const release of state.releases) release();
  state.releases.clear();
}

/** 실제 fetch가 MSW에 전달한 요청 기록을 읽는다. */
export function getProfileRequests() { return state.requests; }

/** 스키마의 성공 envelope와 HTTP 오류를 로컬에서 재현한다. */
async function handleProfileRequest({ request }: { request: Request }) {
  const current = state;
  const url = new URL(request.url);
  current.requests.push({ method: request.method, path: url.pathname, query: url.search, body: await request.json(), contentType: request.headers.get("content-type"), credentials: request.credentials });
  const number = current.requests.length;
  if (current.scenario === "pending") {
    await new Promise<void>(/** 수동 해제 또는 unmount까지 해당 응답만 기다린다. */ (resolve) => current.releases.add(resolve));
  }
  if (current.disposed) return HttpResponse.error();
  const code = current.scenario.startsWith("error") ? Number(current.scenario.slice(5))
    : current.scenario === "retry" && number === 1 ? 503
      : current.scenario === "patch-failure" && request.method === "PATCH" ? 503 : 200;
  if (code !== 200) return HttpResponse.json({ success: false }, { status: code });
  const fallback = current.scenario === "fallback";
  const data = request.method === "POST"
    ? (fallback ? { profileId: createdProfile.profileId } : createdProfile)
    : (fallback || current.scenario === "create-message-fallback"
      ? { userId: updatedProfile.userId, updatedAt: updatedProfile.updatedAt } : updatedProfile);
  return HttpResponse.json({ success: true, data });
}

export const profileHandlers = [http.post("/api/profile", handleProfileRequest), http.patch("/api/profile", handleProfileRequest)];

/** 요청 횟수와 순서, JSON 값, query 생략과 credentials 계약을 함께 검증한다. */
export async function expectProfileRequests(expected: { method: string; body: unknown }[]) {
  await waitFor(() => expect(getProfileRequests()).toHaveLength(expected.length));
  expect(getProfileRequests()).toEqual(expected.map(/** 기대 요청에 현재 클라이언트 공통 wire 계약을 붙인다. */ (entry) => ({
    ...entry, path: "/api/profile", query: "", contentType: "application/json", credentials: "include",
  })));
}

/** 실제 입력을 지우고 타이핑하며 동일 DOM 노드와 포커스 유지를 확인한다. */
export async function typeProfileField(canvasElement: HTMLElement, label: string, value: string) {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText(label);
  await userEvent.clear(input);
  await userEvent.type(input, value);
  expect(canvas.getByLabelText(label)).toBe(input);
  expect(input).toHaveFocus();
  return input;
}

/** 실제 저장 버튼을 누르고 성공 안내 및 refresh 횟수를 검증한다. */
export async function saveProfile(canvasElement: HTMLElement, message: string, refreshCount = 1) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "저장" }));
  await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(message));
  expect(getRouter().refresh).toHaveBeenCalledTimes(refreshCount);
}
