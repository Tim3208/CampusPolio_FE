import { http, HttpResponse } from "msw";
import { verifiedHeaderUser, unverifiedHeaderUser } from "./app-header.story-fixtures";

export type HeaderScenario = "verified" | "unverified" | "anonymous" | "unauthorized" | "failure" | "pending";
export const headerRequests: { method: string; pathname: string; query: string; body: string; credentials: string }[] = [];
let generation = 0;
let release: (() => void) | undefined;

/** 대기 중인 가상 사용자 조회를 성공으로 완료한다. */
export function releaseHeaderUser() { release?.(); }
/** 사용자 조회 기록과 이전 대기 응답을 정리한다. */
export function resetHeaderRequests() {
  generation += 1;
  release?.();
  release = undefined;
  headerRequests.length = 0;
  return cleanupHeaderRequests;
}
/** 이전 스토리의 지연 응답과 기록이 다음 스토리에 남지 않게 한다. */
function cleanupHeaderRequests() {
  generation += 1;
  release?.();
  release = undefined;
  headerRequests.length = 0;
}
/** universityVerified wire 필드를 유지하여 실제 사용자 조회를 로컬에서 재현한다. */
export function headerUserHandlers(scenario: HeaderScenario) {
  return [http.get("/api/users/me", /** 요청과 제어된 사용자 응답을 기록한다. */ async ({ request }) => {
    const current = generation;
    const url = new URL(request.url);
    headerRequests.push({ method: request.method, pathname: url.pathname, query: url.search, body: await request.text(), credentials: request.credentials });
    if (scenario === "pending") await new Promise<void>(/** 완료 버튼과 cleanup에 응답 해제 함수를 제공한다. */ (resolve) => { release = resolve; });
    if (current !== generation) return new HttpResponse(null, { status: 499 });
    if (scenario === "anonymous" || scenario === "unauthorized" || scenario === "failure") {
      return HttpResponse.json({ success: false }, { status: scenario === "failure" ? 500 : 401 });
    }
    return HttpResponse.json({ success: true, data: scenario === "unverified" ? unverifiedHeaderUser : verifiedHeaderUser });
  })];
}

