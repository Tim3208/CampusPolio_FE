import { http, HttpResponse } from "msw";
import { expect, fn, waitFor, within } from "storybook/test";
import { mockConfig, publicEnv } from "@/shared/config";
import { emptyProjectReview, normalProjectReview, reviewFailureMessage, reviewPath, reviewSectionTitles } from "./project-review-panel.story-fixtures";

export type ReviewMode = "ready" | "pending" | "success" | "empty" | "failure" | "retry";
type RequestObservation = { method: string; url: string; body: string; mswHasBodyStream: boolean; contentType: string | null; credentials: RequestCredentials; status: number };

/** 정확한 리뷰 POST만 처리하고 스토리별 요청·재시도·지연 자원을 관리한다. */
export function createReviewScenario(mode: ReviewMode) {
  let activeMode = mode;
  const requestSpy = fn<(request: RequestObservation) => void>();
  const pending = new Set<() => void>();
  let generation = 0;
  let requestCount = 0;

  /** 현재 스토리의 지연을 해제하고 다음 마운트에서 횟수와 spy를 초기화한다. */
  function reset() {
    generation += 1;
    for (const finish of pending) finish();
    pending.clear();
    requestCount = 0;
    requestSpy.mockClear();
  }

  /** 고정 지연 또는 해제 전까지의 대기를 만들며 종료 시 타이머도 정리한다. */
  function waitForResponse(requestMode: ReviewMode) {
    return new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      /** 대기 중인 handler를 한 번 해제한다. */
      function finish() {
        if (timer) clearTimeout(timer);
        pending.delete(finish);
        resolve();
      }
      pending.add(finish);
      if (requestMode !== "pending") timer = setTimeout(finish, 350);
    });
  }

  const handler = http.post(reviewPath,
    /** 실제 fetch의 body·method·경로를 관찰하고 API wrapper 응답을 반환한다. */
    async ({ request }) => {
      const currentGeneration = generation;
      const requestMode = activeMode;
      const count = ++requestCount;
      const status = requestMode === "failure" || (requestMode === "retry" && count === 1) ? 503 : 200;
      const body = await request.clone().text();
      if (currentGeneration !== generation) return HttpResponse.json({ success: true, data: normalProjectReview }, { headers: { "X-Storybook-Fixture": "review-disposed" } });
      requestSpy({ method: request.method, url: request.url, body, mswHasBodyStream: request.body !== null, contentType: request.headers.get("content-type"), credentials: request.credentials, status });
      await waitForResponse(requestMode);
      // 이동한 패널의 대기는 로컬 응답으로 종료하고 새 스토리의 관찰은 건드리지 않는다.
      if (currentGeneration !== generation) return HttpResponse.json({ success: true, data: normalProjectReview }, { headers: { "X-Storybook-Fixture": "review-disposed" } });
      const headers = { "X-Storybook-Fixture": `review-${requestMode}`, "X-Storybook-Request-Count": String(count) };
      if (status === 503) return HttpResponse.json({ success: false, message: reviewFailureMessage }, { status, headers });
      return HttpResponse.json({ success: true, data: requestMode === "empty" ? emptyProjectReview : normalProjectReview }, { headers });
    },
  );
  /** 사용자 시나리오 전환에서 이전 요청을 정리하고 새 응답 모드를 선택한다. */
  function setMode(nextMode: ReviewMode) { reset(); activeMode = nextMode; }
  /** 자유 조작에서 제어된 대기 요청을 수동으로 완료한다. */
  function release() { for (const finish of pending) finish(); }
  return { handler, requestSpy, reset, setMode, release };
}

export type ReviewScenario = ReturnType<typeof createReviewScenario>;

/** 내부 제품 Mock과 개인 API·OAuth 설정이 스토리에 유입되지 않았는지 확인한다. */
export async function expectReviewEnvironment() {
  await expect(mockConfig.useMockApi).toBe(false);
  await expect(mockConfig.authState).toBe("unverified");
  await expect(publicEnv.apiBaseUrl).toBe("");
  await expect(publicEnv.googleClientId).toBe("");
}

/** 관찰한 모든 요청이 body 없는 정확한 POST인지와 횟수를 확인한다. */
export async function expectReviewRequests(scenario: ReviewScenario, count: number) {
  await waitFor(() => expect(scenario.requestSpy).toHaveBeenCalledTimes(count));
  for (const [request] of scenario.requestSpy.mock.calls) {
    const url = new URL(request.url);
    await expect(request.method).toBe("POST");
    await expect(url.origin).toBe(window.location.origin);
    await expect(url.pathname).toBe(reviewPath);
    await expect(url.search).toBe("");
    await expect(request.body).toBe("");
    // MSW는 body 없는 요청도 빈 stream으로 복원하므로 실제 직렬화된 바이트를 검증한다.

    await expect(request.credentials).toBe("include");
  }
}

/** 실제 정규화 경로를 거쳐 표시된 정상 결과와 각 섹션의 내용을 검증한다. */
export async function expectNormalReview(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await expect(await canvas.findByText(normalProjectReview.summary)).toBeVisible();
  await expect(canvas.getByText(String(normalProjectReview.totalScore))).toBeVisible();
  for (const title of reviewSectionTitles) await expect(canvas.getByRole("heading", { name: title })).toBeVisible();
  for (const category of normalProjectReview.categories) {
    await expect(canvas.getByText(category.category)).toBeVisible();
    await expect(canvas.getByText(category.comment)).toBeVisible();
  }
  for (const item of [...normalProjectReview.criticalIssues, ...normalProjectReview.warnings, ...normalProjectReview.strengths, ...normalProjectReview.refactoringSuggestions]) {
    await expect(canvas.getByText(item.title)).toBeVisible();
    await expect(canvas.getByText(item.description)).toBeVisible();
  }
  for (const item of [...normalProjectReview.criticalIssues, ...normalProjectReview.warnings]) await expect(canvas.getByText(`해결: ${item.solution}`)).toBeVisible();
  for (const question of normalProjectReview.interviewQuestions) await expect(canvas.getByText(question, { exact: false })).toBeVisible();
  await expect(canvas.getByText(normalProjectReview.refactoringSuggestions[0].exampleCode)).toBeVisible();
  await expect(canvas.getByRole("button", { name: "다시 생성" })).toBeEnabled();
  await expect(canvas.queryByRole("button", { name: "재시도" })).not.toBeInTheDocument();
}
