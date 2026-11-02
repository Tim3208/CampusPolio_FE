import { http, HttpResponse } from "msw";
import { detailReview, emptyDetailReview, missingDetailImage } from "./project-detail-page.story-fixtures";

export type DetailReviewScenario = "success" | "empty" | "pending" | "failure" | "retry";
export const detailReviewRequests: { method: string; pathname: string; query: string; body: string }[] = [];
let generation = 0;
let release: (() => void) | undefined;
let pending: Promise<void> | undefined;

/** 제어된 리뷰 응답을 완료하여 대기 상태를 벗어난다. */
export function releaseDetailReview() { release?.(); }
/** 이전 대기 요청을 해제하고 현재 스토리의 요청 기록을 새로 만든다. */
export function resetDetailReview() {
  generation += 1;
  release?.();
  release = undefined;
  pending = undefined;
  detailReviewRequests.length = 0;
  return cleanupDetailReview;
}
/** 종료한 스토리의 대기 응답이 다음 스토리에 남지 않게 해제한다. */
function cleanupDetailReview() {
  generation += 1;
  release?.();
  release = undefined;
  pending = undefined;
  detailReviewRequests.length = 0;
}
/** 실제 body 없는 POST와 시나리오별 성공·실패를 로컬 MSW에서 관찰한다. */
export function detailReviewHandlers(scenario: DetailReviewScenario = "success") {
  return [
    http.get(missingDetailImage, /** 실패 이미지의 실제 HTTP 오류를 재현한다. */ () => new HttpResponse(null, { status: 404 })),
    http.post("/api/projects/4205/review", /** wire 요청을 기록하고 현재 시나리오 응답을 반환한다. */ async ({ request }) => {
      const current = generation;
      const url = new URL(request.url);
      const body = await request.text();
      detailReviewRequests.push({ method: request.method, pathname: url.pathname, query: url.search, body });
      const count = detailReviewRequests.length;
      if (scenario === "pending") {
        pending = new Promise<void>(/** 명시적 완료 또는 cleanup 때만 응답 대기를 푼다. */ (resolve) => { release = resolve; });
        await pending;
      }
      if (current !== generation) return new HttpResponse(null, { status: 499 });
      if (scenario === "failure" || (scenario === "retry" && count === 1)) {
        return HttpResponse.json({ success: false, message: "리뷰 서버가 잠시 응답하지 않습니다." }, { status: 503 });
      }
      return HttpResponse.json({ success: true, data: scenario === "empty" ? emptyDetailReview : detailReview });
    }),
  ];
}

