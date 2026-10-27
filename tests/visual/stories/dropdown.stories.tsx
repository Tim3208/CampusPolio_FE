import type { StoryObj } from "@storybook/nextjs-vite";
import original, { Normal as sourceNormal } from "../../../src/shared/ui/dropdown-menu.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Shared/DropdownMenu" };
export default meta;
type Story = StoryObj<typeof original>;
export const Normal: Story = {
  ...sourceNormal,
  globals: { ...sourceNormal.globals, ...viewport(375).globals },
  parameters: { ...sourceNormal.parameters, ...viewport(375).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await sourceNormal.play?.(context);
    await capture(context.id);
  },
};

