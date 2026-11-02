import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ProjectDetailSkeleton } from "./project-detail-skeleton";

const meta = {
  title: "Widgets/Project/ProjectDetailSkeleton",
  component: ProjectDetailSkeleton,
  parameters: { layout: "fullscreen", docs: { story: { inline: false }, description: { component: "상세 조회 중의 실제 반응형 skeleton입니다. aria-busy와 안내를 제공합니다. 서버 조회 완료나 네트워크 지연을 구현하는 스토리가 아닙니다. props가 없으며 폭은 viewport에서 조작합니다." } } },
} satisfies Meta<typeof ProjectDetailSkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {
  /** 로딩 영역의 의미와 숨김 안내를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("main")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByText("프로젝트를 불러오는 중")).toBeInTheDocument();
  },
};

