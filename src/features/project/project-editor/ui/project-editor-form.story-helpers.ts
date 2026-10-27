import { http, HttpResponse } from "msw";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { editorProject, editorProjectId, editorUser, type EditorScenario } from "./project-editor-form.story-fixtures";

export type EditorRequest = { method: string; path: string; search: string; contentType: string | null; body: unknown; response?: unknown };
type Session = { scenario: EditorScenario; requests: EditorRequest[]; release: Set<() => void>; disposed: boolean; patches: number; uploads: number };
let session: Session = makeSession("success");
let snapshot = "[]";
const listeners = new Set<() => void>();

/** 요청·지연을 새 스토리나 명시적 reset에만 초기화한다. */
function makeSession(scenario: EditorScenario): Session { return { scenario, requests: [], release: new Set(), disposed: false, patches: 0, uploads: 0 }; }
/** 관찰 출력에 요청 목록의 불변 snapshot을 알린다. */
function notify() { snapshot = JSON.stringify(session.requests, null, 2); listeners.forEach((listener) => listener()); }
/** 다음 스토리에 pending promise를 남기지 않고 이전 세션을 종료한다. */
export function disposeEditorSession() { session.disposed = true; session.release.forEach((release) => release()); session.release.clear(); }
/** 시나리오를 교체하고 라우터 기록도 초기화한다. */
export function resetEditorSession(scenario: EditorScenario) { disposeEditorSession(); session = makeSession(scenario); getRouter().push.mockClear(); notify(); }
/** 현재 스토리의 요청 관찰값을 반환한다. */
export function getEditorRequests() { return session.requests; }
/** React가 요청 변화를 구독한다. */
export function subscribeEditorRequests(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
/** 요청 변화가 있을 때만 새 문자열 snapshot을 반환한다. */
export function getEditorSnapshot() { return snapshot; }
/** 사용자가 지연 응답 완료를 눌렀을 때 이 스토리의 대기를 해제한다. */
export function releaseEditorResponses() { session.release.forEach((release) => release()); session.release.clear(); }
/** 지정된 단계만 제어 가능한 promise로 기다린다. */
async function waitForRelease(current: Session) { await new Promise<void>((resolve) => { current.release.add(resolve); }); }
/** 실제 fetch 요청의 JSON 또는 multipart file을 원래 wire 경계에서 관찰한다. */
async function recordRequest(request: Request, current: Session) {
  let body: unknown = null;
  const contentType = request.headers.get("content-type");
  if (contentType?.includes("multipart/form-data")) {
    const data = await request.formData();
    const file = data.get("file");
    const bytes = file instanceof File ? new Uint8Array(await file.arrayBuffer()) : null;
    const sha256 = bytes ? Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (byte) => byte.toString(16).padStart(2, "0")).join("") : null;
    body = { fields: [...data.keys()], file: file instanceof File ? { name: file.name, size: file.size, type: file.type, signature: Array.from(bytes!.slice(0, 8), (byte) => byte.toString(16).padStart(2, "0")).join(""), sha256 } : null };
  } else if (request.method !== "GET") { body = await request.json(); }
  const url = new URL(request.url);
  current.requests.push({ method: request.method, path: url.pathname, search: url.search, contentType, body });
  if (current === session) notify();
}
/** 로컬 오류 응답은 현재 client가 처리하는 success/message 형식으로만 제공한다. */
function errorResponse(status: number) { return HttpResponse.json({ success: false, message: "로컬 시나리오 요청 실패" }, { status }); }
/** 끝난 스토리의 응답을 성공으로 만들지 않는다. */
function disposedResponse() { return errorResponse(499); }

export const editorHandlers = [
  http.get("/api/users/me", async ({ request }) => {
    const current = session; await recordRequest(request, current);
    if (current.scenario === "unauthorized") return errorResponse(401);
    return HttpResponse.json({ success: true, data: { ...editorUser, universityVerified: current.scenario !== "unverified" } });
  }),
  http.get(`/api/projects/${editorProjectId}`, async ({ request }) => {
    const current = session; await recordRequest(request, current);
    if (current.scenario === "load-pending") await waitForRelease(current);
    if (current.disposed) return disposedResponse();
    if (current.scenario === "load-error") return errorResponse(500);
    return HttpResponse.json({ success: true, data: editorProject });
  }),
  http.post("/api/projects", async ({ request }) => {
    const current = session; await recordRequest(request, current);
    return HttpResponse.json({ success: true, data: { projectId: editorProjectId } });
  }),
  http.patch(`/api/projects/${editorProjectId}`, async ({ request }) => {
    const current = session; await recordRequest(request, current); current.patches += 1;
    if (current.scenario === "save-pending") await waitForRelease(current);
    if (current.disposed) return disposedResponse();
    if (current.scenario === "forbidden") return errorResponse(403);
    if (current.scenario === "save-error" || (current.scenario === "retry" && current.patches === 1)) return errorResponse(500);
    return HttpResponse.json({ success: true, data: { projectId: editorProjectId } });
  }),
  http.post(`/api/projects/${editorProjectId}/publish`, async ({ request }) => {
    const current = session; await recordRequest(request, current);
    return HttpResponse.json({ success: true });
  }),
  http.post(`/api/projects/${editorProjectId}/files`, async ({ request }) => {
    const current = session;
    const data = await request.clone().formData();
    const file = data.get("file");
    const bytes = file instanceof File && file.type === "image/png" ? new Uint8Array(await file.arrayBuffer()) : null;
    const isPng = bytes?.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]) && bytes.length >= 8;
    await recordRequest(request, current);
    current.uploads += 1;
    if (current.scenario === "upload-pending") await waitForRelease(current);
    if (current.disposed) return disposedResponse();
    if (current.scenario === "upload-error" || (current.scenario === "retry" && current.uploads === 1)) return errorResponse(500);
    const response = { success: true, data: { fileId: current.requests.length, fileUrl: isPng ? `data:image/png;base64,${btoa(Array.from(bytes!, (byte) => String.fromCharCode(byte)).join(""))}` : "/storybook/project-fixture.svg" } };
    current.requests.at(-1)!.response = response;
    notify();
    return HttpResponse.json(response);
  }),
];

/** 실제 제목·본문 입력으로 공개 저장에 필요한 값을 준비한다. */
export async function fillEditor(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const title = await canvas.findByLabelText("프로젝트 제목");
  await userEvent.clear(title); await userEvent.type(title, "  새 프로젝트  ");
  const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
  await userEvent.click(editor); await userEvent.type(editor, "저장 본문");
  await expect(editor).toHaveFocus();
}
/** fixture 응답 뒤 현재 client의 라우터 호출과 요청 순서를 검증한다. */
export async function expectSaved(expectedMethods: string[]) {
  await waitFor(() => expect(getRouter().push).toHaveBeenCalledWith("/mypage/projects"));
  await expect(getEditorRequests().map(({ method, path }) => `${method} ${path}`)).toEqual(expectedMethods);
  await expect(getEditorRequests().every(({ search }) => search === "")).toBe(true);
}
/** 제품의 숨겨진 원래 파일 input을 File 선택 이벤트로 조작한다. */
export function getEditorFileInput(canvasElement: HTMLElement, inline = false) {
  const inputs = canvasElement.querySelectorAll<HTMLInputElement>('input[type="file"]');
  const input = inputs[inline ? 0 : 1];
  if (!input) throw new Error("제품 파일 input을 찾지 못했습니다.");
  return input;
}

