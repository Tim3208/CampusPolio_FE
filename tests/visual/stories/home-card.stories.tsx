import type { StoryObj } from "@storybook/nextjs-vite";
import original, { Normal as sourceNormal, LongContent as sourceLongContent } from "../../../src/widgets/home/ui/project-card.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Widgets/Home/ProjectCard" };
export default meta;
type Story = StoryObj<typeof original>;
export const Normal: Story = {
  ...sourceNormal,
  globals: { ...sourceNormal.globals, ...viewport(1280).globals },
  parameters: { ...sourceNormal.parameters, ...viewport(1280).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await original.play(context);
    await capture(context.id);
  },
};
export const LongContent: Story = {
  ...sourceLongContent,
  globals: { ...sourceLongContent.globals, ...viewport(375).globals },
  parameters: { ...sourceLongContent.parameters, ...viewport(375).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await original.play(context);
    await capture(context.id);
  },
};

