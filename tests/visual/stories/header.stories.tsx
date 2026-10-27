import type { StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import original, { MobileMenu as sourceMobileMenu } from "../../../src/widgets/header/ui/app-header.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Widgets/Header/AppHeader" };
export default meta;
type Story = StoryObj<typeof original>;
export const MobileMenu: Story = {
  ...sourceMobileMenu,
  globals: { ...sourceMobileMenu.globals, ...viewport(375).globals },
  parameters: { ...sourceMobileMenu.parameters, ...viewport(375).parameters, a11y: { test: "todo" }, docs: { description: { story: "열린 모바일 메뉴의 기존 aria-hidden-focus 제한. 접근성 PASS가 아니다." } } },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    const canvas = within(context.canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "계정 메뉴" }));
    await expect(await within(document.body).findByRole("menu")).toBeVisible();
    await capture(context.id);
  },
};

