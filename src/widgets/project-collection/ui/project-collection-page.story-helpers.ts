import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";

/** 스토리 진입·종료 때 라우터 호출과 문서 스크롤을 비운다. */
export function resetCollectionStory() {
  getRouter().push.mockClear();
  getRouter().refresh.mockClear();
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
}

/** 호출된 URL만 확인하며 서버 조회 결과가 갱신되었다고 간주하지 않는다. */
export async function expectCollectionPush(href: string) {
  await expect(getRouter().push).toHaveBeenCalledTimes(1);
  await expect(getRouter().push).toHaveBeenLastCalledWith(href);
}

/** 숨김으로 우회하지 않은 문서 전체 가로 넘침을 검사한다. */
export async function expectCollectionWidth(document: Document) {
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    document.documentElement.clientWidth + 1,
  );
  await expect(getComputedStyle(document.documentElement).overflowX).not.toBe("hidden");
}

/** 실제 폭에 맞는 필터 접근점과 결과 그리드 열 개수를 확인한다. */
export async function expectCollectionLayout(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  if (window.innerWidth < 1024) {
    await expect(canvas.getByRole("button", { name: /^필터/ })).toBeVisible();
    await expect(canvas.queryByRole("checkbox", { name: "공학" })).not.toBeInTheDocument();
  } else {
    await expect(canvas.getByRole("checkbox", { name: "공학" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /^필터/ })).not.toBeInTheDocument();
  }
  const grid = canvasElement.querySelector("[data-search-grid]");
  if (grid) {
    const columns = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    await expect(columns).toBe(window.innerWidth >= 1280 ? 3 : window.innerWidth >= 768 ? 2 : 1);
  }
  await expectCollectionWidth(canvasElement.ownerDocument);
}

/** 모바일에서 실제 portal을 열고 현재 fixture 태그와 최초 포커스를 확인한다. */
export async function openCollectionFilter(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: /^필터/ }));
  const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "태그 필터" });
  const sheet = within(dialog);
  await expect(sheet.getByRole("checkbox", { name: "공학" })).toBeChecked();
  await expect(sheet.getByRole("checkbox", { name: "시각 디자인" })).toBeChecked();
  await expect(sheet.getByRole("checkbox", { name: "건축학" })).not.toBeChecked();
  await waitFor(
    /** 열림 후 첫 항목으로 이동한 실제 포커스를 기다린다. */
    () => expect(sheet.getByRole("checkbox", { name: "시각 디자인" })).toHaveFocus(),
  );
  return sheet;
}

/** 모달 닫힘과 필터 트리거의 포커스 복귀를 기다린다. */
export async function expectCollectionFilterClosed(canvasElement: HTMLElement) {
  await waitFor(
    /** 포털이 제거되고 원래 트리거가 활성화됐는지 확인한다. */
    () => {
      expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
      expect(within(canvasElement).getByRole("button", { name: /^필터/ })).toHaveFocus();
    },
  );
}
