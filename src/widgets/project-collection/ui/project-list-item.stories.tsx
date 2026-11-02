import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ProjectListItem } from "./project-list-item";
import { listItemFixtures } from "./project-list-item.story-fixtures";
import { expectCollectionWidth, resetCollectionStory } from "./project-collection-page.story-helpers";

const meta = {
  title: "Widgets/ProjectCollection/ProjectListItem",
  component: ProjectListItem,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "탐색 list에서 사용하는 실제 링크 항목입니다. 고정 가상 ProjectSearchItem과 로컬 이미지를 사용하며 정상/누락/실패/긴 값을 분리합니다. 제품 목록은 description을 표시하지 않습니다. href 검사는 상세 서버 조회 성공을 뜻하지 않습니다." } },
  },
  args: { project: listItemFixtures.normal },
  argTypes: { project: { control: "object", description: "공개 ProjectSearchItem 타입을 만족하는 표시 fixture" } },
  /** 다른 스토리의 포커스와 라우터 호출을 남기지 않는다. */
  beforeEach() {
    resetCollectionStory();
    return resetCollectionStory;
  },
  /** 실제 목록의 한 항목 폭으로 보여 주며 문서 넘침을 숨기지 않는다. */
  render(args, context) {
    return <div className="mx-auto max-w-[1000px] p-4"><ProjectListItem key={context.id} {...args} /></div>;
  },
  /** 모든 fixture에서 상세 href·제목·112px 썸네일·내부 높이와 전체 폭을 확인한다. */
  async play({ canvasElement, args }) {
    const canvas = within(canvasElement);
    const item = canvas.getByRole("link");
    await expect(item).toHaveAttribute("href", "/projects/9301");
    await expect(canvas.getByRole("heading", { level: 2 })).toHaveTextContent(args.project.title.trim());
    await expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(112);
    const thumbnail = item.firstElementChild;
    if (!thumbnail) throw new Error("목록 썸네일 영역이 없습니다.");
    await expect(thumbnail.getBoundingClientRect().width).toBe(112);
    await expectCollectionWidth(canvasElement.ownerDocument);
    if (!args.project.users.length) await expect(canvas.getByText("작성자 정보 없음")).toBeVisible();
    if (!args.project.thumbnailUrl || args.project.thumbnailUrl.includes("missing")) {
      await expect(await canvas.findByText("썸네일 없음")).toBeVisible();
      await expect(item.querySelector("img")).toBeNull();
    } else {
      await waitFor(
        /** 정상 로컬 이미지가 실제로 로드되었는지 확인한다. */
        () => expect(item.querySelector("img")?.naturalWidth).toBeGreaterThan(0),
      );
    }
    if (args.project.description) await expect(canvas.queryByText(args.project.description)).not.toBeInTheDocument();
    item.blur();
    canvasElement.ownerDocument.body.focus();
    await userEvent.tab();
    await expect(item).toHaveFocus();
  },
} satisfies Meta<typeof ProjectListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};
export const NoDescription: Story = { args: { project: listItemFixtures.noDescription } };
export const NoAuthor: Story = { args: { project: listItemFixtures.noAuthor } };
export const NoTags: Story = { args: { project: listItemFixtures.noTags } };
export const NoImage: Story = { args: { project: listItemFixtures.noImage } };
export const FailedImage: Story = { args: { project: listItemFixtures.failedImage } };
export const EmptyOptional: Story = { args: { project: listItemFixtures.emptyOptional } };
export const LongContent: Story = { args: { project: listItemFixtures.longContent } };
