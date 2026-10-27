import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { HomePageSkeleton } from "./home-page-skeleton";

const meta = {
  title: "Widgets/Home/HomePageSkeleton",
  component: HomePageSkeleton,
  parameters: { layout: "fullscreen" },
  /** 실제 로딩 컴포넌트의 busy 상태와 안내 문구를 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("main")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("프로젝트를 불러오는 중입니다.");
  },
} satisfies Meta<typeof HomePageSkeleton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Loading: Story = {};
