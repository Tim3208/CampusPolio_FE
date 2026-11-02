import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ProjectCollectionSkeleton } from "./project-collection-skeleton";
import { expectCollectionWidth, resetCollectionStory } from "./project-collection-page.story-helpers";

const meta = {
  title: "Widgets/ProjectCollection/ProjectCollectionSkeleton",
  component: ProjectCollectionSkeleton,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "실제 탐색 로딩 UI입니다. aria-busy와 읽기 보조용 status를 제공하고 장식 skeleton은 aria-hidden입니다. 데이터 요청을 만들거나 실제 로딩 시간을 증명하지 않습니다. 768/1024/1280 CSS px에서 열과 사이드바가 전환됩니다." } },
  },
  /** 각 진입에서 이전 화면의 스크롤을 정리한다. */
  beforeEach() {
    resetCollectionStory();
    return resetCollectionStory;
  },
} satisfies Meta<typeof ProjectCollectionSkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  /** 로딩 의미와 장식 숨김·실제 반응형 열·사이드바·문서 폭을 검사한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("main")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("프로젝트를 불러오는 중입니다.");
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]');
    await expect(skeletons.length).toBeGreaterThan(6);
    for (const skeleton of skeletons) await expect(skeleton).toHaveAttribute("aria-hidden", "true");
    const grid = canvasElement.querySelector(".grid.grid-cols-1");
    if (!grid) throw new Error("실제 skeleton 그리드가 없습니다.");
    await expect(grid.children).toHaveLength(6);
    await expect(getComputedStyle(grid).gridTemplateColumns.split(" ").length).toBe(window.innerWidth >= 1280 ? 3 : window.innerWidth >= 768 ? 2 : 1);
    const aside = canvasElement.querySelector("aside");
    if (!aside) throw new Error("실제 skeleton 사이드바가 없습니다.");
    await expect(getComputedStyle(aside).display).toBe(window.innerWidth >= 1024 ? "block" : "none");
    await expectCollectionWidth(canvasElement.ownerDocument);
  },
};
