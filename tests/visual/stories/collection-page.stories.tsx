import type { StoryObj } from "@storybook/nextjs-vite";
import original, { GridFirstPage as sourceGridFirstPage, ListFirstPage as sourceListFirstPage } from "../../../src/widgets/project-collection/ui/project-collection-page.stories";
import { capture, viewport } from "../capture";
const meta = { ...original, title: "Widgets/ProjectCollection/ProjectCollectionPage" };
export default meta;
type Story = StoryObj<typeof original>;
export const GridFirstPage: Story = {
  ...sourceGridFirstPage,
  globals: { ...sourceGridFirstPage.globals, ...viewport(1280, 1400).globals },
  parameters: { ...sourceGridFirstPage.parameters, ...viewport(1280, 1400).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await sourceGridFirstPage.play?.(context);
    await capture(context.id);
  },
};
export const ListFirstPage: Story = {
  ...sourceListFirstPage,
  globals: { ...sourceListFirstPage.globals, ...viewport(375, 1800).globals },
  parameters: { ...sourceListFirstPage.parameters, ...viewport(375, 1800).parameters },
  /** 기존 제품 story의 검증을 실행한 뒤 고정된 실제 화면을 비교한다. */
  async play(context) {
    await sourceListFirstPage.play?.(context);
    await capture(context.id);
  },
};

