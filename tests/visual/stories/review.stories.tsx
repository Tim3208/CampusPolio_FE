import type { StoryObj } from "@storybook/nextjs-vite";
import original, { Failure as sourceFailure } from "../../../src/features/project/project-review/ui/project-review-panel.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Features/Project/ProjectReviewPanel" };
export default meta;
type Story = StoryObj<typeof original>;
export const Failure: Story = {
  ...sourceFailure,
  globals: { ...sourceFailure.globals, ...viewport(375).globals },
  parameters: { ...sourceFailure.parameters, ...viewport(375).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await sourceFailure.play?.(context);
    await capture(context.id);
  },
};

