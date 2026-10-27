import type { StoryObj } from "@storybook/nextjs-vite";
import original, { FailedThumbnail as sourceFailedThumbnail } from "../../../src/widgets/project-collection/ui/project-card.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Widgets/ProjectCollection/ProjectCard" };
export default meta;
type Story = StoryObj<typeof original>;
export const FailedThumbnail: Story = {
  ...sourceFailedThumbnail,
  globals: { ...sourceFailedThumbnail.globals, ...viewport(375).globals },
  parameters: { ...sourceFailedThumbnail.parameters, ...viewport(375).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await original.play(context);
    await capture(context.id);
  },
};

