import type { StoryObj } from "@storybook/nextjs-vite";
import original, { Bottom as sourceBottom } from "../../../src/shared/ui/sheet.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Shared/Sheet" };
export default meta;
type Story = StoryObj<typeof original>;
export const Bottom: Story = {
  ...sourceBottom,
  globals: { ...sourceBottom.globals, ...viewport(375).globals },
  parameters: { ...sourceBottom.parameters, ...viewport(375).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await sourceBottom.play?.(context);
    await capture(context.id);
  },
};

