import { http, HttpResponse } from "msw";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { createResult, updateResult, projectsResult, orderResult, visibilityResult, type SaveScenario, type SaveStep } from "./portfolio-builder.story-fixtures";

export type WireRecord = { step: SaveStep; method: string; path: string; query: string; body: unknown; contentType: string | null; credentials: RequestCredentials };
export type UrlRecord = { action: "create" | "revoke" | "cleanup-revoke"; url: string };
const requests: WireRecord[] = [];
const urls: UrlRecord[] = [];
const activeUrls = new Set<string>();
let scenario: SaveScenario = "success";
let epoch = 0;
let failedOnce = false;
const pending = new Set<(proceed: boolean) => void>();
let restoreUrls: (() => void) | undefined;

/** Docs의 중첩 iframe에서는 병렬 play가 브라우저 focus를 빼앗지 않도록 수동 조작만 제공한다. */
export function isBuilderDocsFrame() {
  return window.parent !== window && new URL(window.parent.location.href).searchParams.get("viewMode") === "docs";
}

/** 현재 문서에 속한 요청/URL 관찰을 반환한다. Docs는 iframe별로 격리한다. */
export function getBuilderEvidence() { return { requests, urls, activeUrls: [...activeUrls], pending: pending.size }; }

/** 지연된 로컬 응답을 해제한다. 취소일 때 후속 저장 요청은 실행되지 않는다. */
export function releaseBuilderRequests(proceed = true) {
  if (proceed) scenario = "success";
  for (const resolve of pending) resolve(proceed);
  pending.clear();
}

/** 새 시나리오에서 이전 요청을 중단하고 요청 수와 라우터 기록을 초기화한다. */
export function resetBuilderScenario(next: SaveScenario) {
  epoch += 1;
  releaseBuilderRequests(false);
  requests.length = 0;
  failedOnce = false;
  scenario = next;
  getRouter().push.mockClear();
}

/** 실제 브라우저 object URL을 사용하면서 생성/해제와 남은 자원을 관찰한다. */
export function startBuilderScenario(next: SaveScenario) {
  disposeBuilderScenario();
  urls.length = 0;
  resetBuilderScenario(next);
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  /** 제품의 실제 object URL 생성을 기록한다. */
  URL.createObjectURL = function createTrackedUrl(object) {
    const url = originalCreate.call(URL, object);
    activeUrls.add(url);
    urls.push({ action: "create", url });
    return url;
  };
  /** 제품이 요청한 실제 object URL 해제를 기록한다. */
  URL.revokeObjectURL = function revokeTrackedUrl(url) {
    urls.push({ action: "revoke", url });
    activeUrls.delete(url);
    originalRevoke.call(URL, url);
  };
  /** 테스트 종료에서 남은 자원만 별도로 정리하고 원래 API를 복원한다. */
  restoreUrls = function restoreObjectUrls() {
    for (const url of activeUrls) {
      originalRevoke.call(URL, url);
      urls.push({ action: "cleanup-revoke", url });
    }
    activeUrls.clear();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  };
}

/** pending 응답·URL 추적·스크롤을 정리하고 다음 story에 상태를 남기지 않는다. */
export function disposeBuilderScenario() {
  epoch += 1;
  releaseBuilderRequests(false);
  restoreUrls?.();
  restoreUrls = undefined;
  requests.length = 0;
  window.scrollTo(0, 0);
}

/** 실제 fetch의 wire 계약을 기록하고 지정 단계의 명세 응답을 반환한다. */
async function respond(step: SaveStep, request: Request, data: object) {
  const requestEpoch = epoch;
  const url = new URL(request.url);
  requests.push({ step, method: request.method, path: url.pathname, query: url.search, body: await request.json(), contentType: request.headers.get("content-type"), credentials: request.credentials });
  if (scenario === "pending") {
    const proceed = await new Promise<boolean>(
      /** 응답 해제 버튼이나 story cleanup이 결정할 때까지 대기한다. */
      (resolve) => pending.add(resolve),
    );
    if (!proceed || requestEpoch !== epoch) return HttpResponse.error();
  }
  if (scenario === step || (scenario === "retry" && step === "create" && !failedOnce)) {
    failedOnce = true;
    // OpenAPI 오류 응답에도 success/data 형식이 지정된다. 미명세 최상위 message를 만들지 않는다.
    return HttpResponse.json({ success: false }, { status: 400 });
  }
  return HttpResponse.json({ success: true, data });
}

export const builderHandlers = [
  http.post("/api/portfolios", /** 생성 요청을 로컬에서 처리한다. */ ({ request }) => respond("create", request, createResult)),
  http.patch("/api/portfolios/9201", /** 정보 수정 요청을 로컬에서 처리한다. */ ({ request }) => respond("info", request, updateResult)),
  http.patch("/api/portfolios/9201/projects", /** 선택 목록 요청을 로컬에서 처리한다. */ ({ request }) => respond("projects", request, projectsResult)),
  http.patch("/api/portfolios/9201/order", /** 순서 요청을 로컬에서 처리한다. */ ({ request }) => respond("order", request, orderResult)),
  http.patch("/api/portfolios/9201/visibility", /** 공개 여부 요청을 로컬에서 처리한다. */ ({ request }) => respond("visibility", request, visibilityResult)),
];
