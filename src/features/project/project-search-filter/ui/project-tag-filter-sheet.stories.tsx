import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ProjectTagFilterSheet } from "./project-tag-filter-sheet";
import { expectedGridFilterHref, expectedListFilterHref, gridFilterQuery, listFilterQuery } from "./project-tag-filter-sheet.story-fixtures";
import { expectFilterClosed, expectSelectedTags, openFilterSheet, selectFilterTag, verifyFilterCancellation } from "./project-tag-filter-sheet.story-helpers";

type FilterArgs = ComponentProps<typeof ProjectTagFilterSheet> & { initialTags: string; keyword: string };

/** 초기 Controls 변경이나 명시적 reset 때만 필터 인스턴스를 바꾼다. */
function FilterPlayground(args: FilterArgs & { onResetArgs: () => void }) {
  const [generation, setGeneration] = useState(0);
  const query = { ...args.query, keyword: args.keyword, tags: args.initialTags.split(",").map(trimTag).filter(Boolean) };
  /** 쉼표로 구분한 초기 태그의 공백을 정리한다. */
  function trimTag(tag: string) { return tag.trim(); }
  /** 현재 초안·열림·라우터 관찰과 초기 Controls를 함께 초기화한다. */
  function reset() { getRouter().push.mockClear(); args.onResetArgs(); setGeneration(generation + 1); }
  return <div className="min-h-screen bg-[#F5F8FB] p-4"><button type="button" className="mb-4 rounded border px-3 py-2" onClick={reset}>시나리오 초기화</button><p className="mb-4 max-w-xl text-sm">적용 URL은 Actions의 router.push로 확인합니다. 이 미리보기의 초기 query는 자동으로 바뀌지 않으며 재열기는 Controls의 초기 태그를 복원합니다.</p><ProjectTagFilterSheet key={JSON.stringify([query, args.viewMode, generation])} query={query} viewMode={args.viewMode} /></div>;
}

const meta = {
  title: "Features/Project/ProjectTagFilterSheet",
  component: ProjectTagFilterSheet,
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 600 }, description: { component: "모바일 필터의 초안 선택·초기화·취소·적용을 재현합니다. 고정 play는 정확한 URL/호출 횟수를 검사하고 Playground는 수동 조작입니다. Docs iframe은 사례별 portal과 router 관찰을 격리합니다. router mock 이동과 서버에서 새 query로 받은 결과는 별개입니다." } } },
  args: { query: listFilterQuery, viewMode: "list", initialTags: "공학", keyword: "  story book  " },
  argTypes: {
    query: { control: false, description: "고정 회귀용 query. Playground도 기존 정렬/page fixture를 유지합니다." },
    viewMode: { control: "select", options: ["grid", "list"] },
    initialTags: { control: "text", description: "쉼표로 구분한 초기 태그. 변경 시 열린 초안을 초기화합니다." },
    keyword: { control: "text", description: "초기 keyword. 적용 URL에서 기존 제품 trim 규칙을 사용합니다." },
  },
  /** 스토리별 새 필터와 태그 배열로 초안·열린 상태를 격리한다. */
  render(args, context) {
    return <div className="min-h-screen bg-[#F5F8FB] p-4"><ProjectTagFilterSheet key={context.id} viewMode={args.viewMode} query={{ ...args.query, tags: [...(args.query.tags ?? [])] }} /></div>;
  },
  /** 재방문·새로고침마다 라우터 관찰과 문서 스크롤을 초기화한다. */
  beforeEach() {
    getRouter().push.mockClear();
    window.scrollTo(0, 0);
  },
} satisfies Meta<FilterArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const InitialList: Story = {};
export const InitialGrid: Story = { args: { query: gridFilterQuery, viewMode: "grid" } };

export const DraftAndReset: Story = {
  /** 선택·해제·초기화가 적용 전에는 라우터를 호출하지 않음을 확인한다. */
  async play({ canvasElement }) {
    const dialog = await openFilterSheet(canvasElement);
    await selectFilterTag(dialog, "시각 디자인");
    await expectSelectedTags(dialog, ["공학", "시각 디자인"]);
    await selectFilterTag(dialog, "공학");
    await expectSelectedTags(dialog, ["시각 디자인"]);
    await userEvent.click(within(dialog).getByRole("button", { name: "선택 초기화" }));
    await expectSelectedTags(dialog, []);
    await expect(getRouter().push).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await expectFilterClosed(canvasElement);
  },
};

export const CancelWithClose: Story = {
  /** 닫기 버튼 취소와 원조건 복원을 확인한다. */
  async play({ canvasElement }) { await verifyFilterCancellation(canvasElement, "close"); },
};
export const CancelWithEscape: Story = {
  /** Escape 취소와 원조건 복원을 확인한다. */
  async play({ canvasElement }) { await verifyFilterCancellation(canvasElement, "escape"); },
};
export const CancelWithOutsideClick: Story = {
  /** document portal 바깥 배경 클릭 취소와 원조건 복원을 확인한다. */
  async play({ canvasElement }) { await verifyFilterCancellation(canvasElement, "outside"); },
};

export const ApplyList: Story = {
  /** 페이지 초기화·keyword trim·반복 태그·정렬과 list 보존의 정확한 URL을 확인한다. */
  async play({ canvasElement }) {
    const dialog = await openFilterSheet(canvasElement);
    await selectFilterTag(dialog, "시각 디자인");
    await expectSelectedTags(dialog, ["공학", "시각 디자인"]);
    await expect(getRouter().push).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "적용하기 (2)" }));
    await expectFilterClosed(canvasElement, 1);
    await expect(getRouter().push).toHaveBeenNthCalledWith(1, expectedListFilterHref);
    // router mock은 props를 갱신하지 않으므로 재열기는 전달받은 공학 조건을 사용한다.
    await openFilterSheet(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expectFilterClosed(canvasElement, 1);
  },
};

export const ApplyGrid: Story = {
  args: { query: gridFilterQuery, viewMode: "grid" },
  /** grid·LATEST·page·size와 빈 keyword 생략 및 반복 태그를 확인한다. */
  async play({ canvasElement }) {
    const dialog = await openFilterSheet(canvasElement, ["건축학"]);
    await selectFilterTag(dialog, "공학");
    await userEvent.click(within(dialog).getByRole("button", { name: "적용하기 (2)" }));
    await expectFilterClosed(canvasElement, 1);
    await expect(getRouter().push).toHaveBeenNthCalledWith(1, expectedGridFilterHref);
  },
};
export const ApplyEmptyGrid: Story = {
  args: { query: gridFilterQuery, viewMode: "grid" },
  /** 전체 선택 초기화 적용은 기본 경로만 한 번 요청하는지 확인한다. */
  async play({ canvasElement }) {
    const dialog = await openFilterSheet(canvasElement, ["건축학"]);
    await userEvent.click(within(dialog).getByRole("button", { name: "선택 초기화" }));
    await expectSelectedTags(dialog, []);
    await expect(getRouter().push).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "적용하기 (0)" }));
    await expectFilterClosed(canvasElement, 1);
    await expect(getRouter().push).toHaveBeenNthCalledWith(1, "/projects");
  },
};
export const Keyboard: Story = {
  /** Enter 열기·첫 입력 포커스·Space 선택·Tab·Escape·포커스 복귀를 확인한다. */
  async play({ canvasElement }) {
    const trigger = within(canvasElement).getByRole("button", { name: /필터/ });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "태그 필터" });
    const first = within(dialog).getByRole("checkbox", { name: "시각 디자인" });
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.keyboard(" ");
    await expect(first).toBeChecked();
    await userEvent.tab();
    await expect(within(dialog).getByRole("checkbox", { name: "건축학" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expectFilterClosed(canvasElement);
  },
};

export const Playground: Story = {
  /** 안정된 wrapper에서 자유 조작과 명시적 reset을 제공한다. */
  render: function RenderPlayground(args) { const [, , resetArgs] = useArgs<FilterArgs>(); return <FilterPlayground {...args} onResetArgs={resetArgs} />; },
};

export const PlaygroundReset: Story = {
  ...Playground,
  /** 수동 wrapper의 취소·적용 URL·초기화·재열기 동작을 별도 자동 검사한다. */
  async play({ canvasElement }) {
    await verifyFilterCancellation(canvasElement, "escape");
    const dialog = await openFilterSheet(canvasElement);
    await selectFilterTag(dialog, "시각 디자인");
    await userEvent.click(within(dialog).getByRole("button", { name: "적용하기 (2)" }));
    await expectFilterClosed(canvasElement, 1);
    await expect(getRouter().push).toHaveBeenNthCalledWith(1, expectedListFilterHref);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "시나리오 초기화" }));
    await expect(getRouter().push).not.toHaveBeenCalled();
    await openFilterSheet(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expectFilterClosed(canvasElement);
  },
};
