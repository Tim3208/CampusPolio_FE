import type { StoryObj } from "@storybook/nextjs-vite";
import original, { LongContent as sourceLongContent } from "../../../src/shared/ui/markdown-viewer.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Shared/MarkdownViewer" };
export default meta;
type Story = StoryObj<typeof original>;
export const LongContent: Story = {
  ...sourceLongContent,
  globals: { ...sourceLongContent.globals, ...viewport(768, 1500).globals },
  parameters: { ...sourceLongContent.parameters, ...viewport(768, 1500).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await sourceLongContent.play?.(context);
    await capture(context.id);
  },
};

