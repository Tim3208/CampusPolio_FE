import { setupWorker } from "msw/browser";
import { http, HttpResponse } from "msw";
import { clearAllMocks } from "storybook/test";

const blockedApiRequests: string[] = [];
export const localProjectImage = "/storybook/project-fixture.svg";

// 기존 제품의 위반을 보존하며 이 상태들의 a11y todo를 PASS로 집계하지 않는다.
// 제품 수리가 승인되면 해당 항목을 제거하고 error 검사를 다시 실행한다.
// 2026-10-26 DEV-01 attempt-03의 stories-error-01에서 52개 통과/아래 5개 실패를 확인했다.
// 이 목록은 제품 수정 권한이 없는 기존 위반의 공개 기록이며 접근성 PASS가 아니다.
export const storyA11yLimitations: Record<string, string> = {
  "shared-button--variants": "color-contrast: destructive 버튼의 #e7000b/#fde5e7 대비 3.98:1이 4.5:1에 미달한다. 제품 색상 변경은 DEV-01 범위 밖이다.",
  "shared-markdownviewer--headings-and-lists": "label: GFM의 disabled checkbox에 접근 가능한 이름이 없다. Markdown 제품 렌더러 수정은 DEV-01 범위 밖이다.",
  "shared-markdownviewer--long-content": "label 및 scrollable-region-focusable: GFM checkbox 이름과 .campus-markdown-table/pre의 키보드 접근이 없다. 제품 렌더러 수정은 DEV-01 범위 밖이다.",
  "features-project-projectreviewpanel--success": "scrollable-region-focusable: 리뷰 코드 pre.max-h-48의 키보드 접근이 없다. 리뷰 제품 UI 수정은 DEV-01 범위 밖이다.",
  "features-project-projectreviewpanel--retry-success": "scrollable-region-focusable: 재시도 성공 리뷰 코드 pre.max-h-48의 키보드 접근이 없다. 리뷰 제품 UI 수정은 DEV-01 범위 밖이다.",
};

/** CSF 3 loader가 공유하고 스토리마다 handler를 초기화할 MSW worker를 준비한다. */
export async function createMockWorker() {
  const worker = setupWorker(
    // 스토리 handler는 worker.use()로 앞에 추가되고 이 마지막 handler는 나머지 API만 차단한다.
    http.all(/^https?:\/\/[^/]+\/api(?:\/|\?|$)/, 
      /** 누락된 API 응답을 네트워크 오류로 만들고 테스트 종료 때도 실패시킨다. */
      ({ request }) => {
        blockedApiRequests.push(`${request.method} ${request.url}`);
        return HttpResponse.error();
      },
    ),
  );
  await worker.start({
    quiet: true,
    serviceWorker: { url: "/mockServiceWorker.js" },
    /** 미처리 API는 실제 네트워크로 전달하지 않고 실패로 남긴다. */
    onUnhandledRequest(request, print) {
      if (/^\/api(?:\/|$)/.test(new URL(request.url).pathname)) {
        blockedApiRequests.push(`${request.method} ${request.url}`);
        print.error();
      }
    },
  });
  return worker;
}

/** 새 스토리에서 이전 API 진단과 spy 호출 기록을 정리한다. */
export function resetStoryState() {
  blockedApiRequests.length = 0;
  clearAllMocks();
}

/** 제품이 요청 오류를 처리해도 미처리 API가 있으면 테스트를 실패시킨다. */
export function assertNoUnhandledApiRequests() {
  if (blockedApiRequests.length > 0) {
    throw new Error(`Storybook 미처리 API 요청: ${blockedApiRequests.join(", ")}`);
  }
}
