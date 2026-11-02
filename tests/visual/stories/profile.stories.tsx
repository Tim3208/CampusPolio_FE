import type { StoryObj } from "@storybook/nextjs-vite";
import original, { RequiredValidation as sourceRequiredValidation } from "../../../src/features/profile/profile-settings/ui/profile-settings-form.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Features/Profile/ProfileSettingsForm" };
export default meta;
type Story = StoryObj<typeof original>;
export const RequiredValidation: Story = {
  ...sourceRequiredValidation,
  globals: { ...sourceRequiredValidation.globals, ...viewport(768, 1200).globals },
  parameters: { ...sourceRequiredValidation.parameters, ...viewport(768, 1200).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await sourceRequiredValidation.play?.(context);
    await capture(context.id);
  },
};

