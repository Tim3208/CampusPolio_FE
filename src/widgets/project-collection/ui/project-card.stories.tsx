import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import type { ProjectSearchItem } from "@/entities/project";
import { ProjectCard } from "./project-card";
import { searchCardFixtures } from "./project-card.story-fixtures";

type CardArgs = { project: ProjectSearchItem; title: string; description: string; author: string; viewCount: number; likeCount: number; tags: string; image: "normal" | "missing" | "failed" };

/** 탐색 도메인의 작성자 배열·태그 배열을 flat Controls로 조합한다. */
function CardPlayground(args: CardArgs & { onResetArgs: () => void }) {
  const project: ProjectSearchItem = { ...searchCardFixtures.normal, title: args.title, description: args.description, users: args.author.trim() ? [{ userId: 93001, name: args.author, role: "OWNER" }] : [], viewCount: args.viewCount, likeCount: args.likeCount, tags: args.tags.split(",").map(trimTag).filter(Boolean), thumbnailUrl: args.image === "missing" ? null : args.image === "failed" ? searchCardFixtures.failedThumbnail.thumbnailUrl : searchCardFixtures.normal.thumbnailUrl };
  /** 태그 입력의 앞뒤 공백을 정리한다. */
  function trimTag(tag: string) { return tag.trim(); }
  /** Controls와 카드 표시를 최초 값으로 복원한다. */
  function reset() { args.onResetArgs(); }
  return <div className="min-w-0"><button type="button" className="mb-4 rounded border px-3 py-2" onClick={reset}>시나리오 초기화</button><ProjectCard project={project} /></div>;
}

const meta = {
  title: "Widgets/ProjectCollection/ProjectCard",
  component: ProjectCard,
  /** 고정 탐색 상태는 원래 제품 props만 전달한다. */
  render: (args) => <ProjectCard project={args.project} />,
  args: { project: searchCardFixtures.normal, title: searchCardFixtures.normal.title, description: searchCardFixtures.normal.description, author: "가상 탐색팀", viewCount: 4321, likeCount: 87, tags: "공학, 시각 디자인", image: "normal" },
  argTypes: {
    project: { control: false, description: "고정 회귀용 ProjectSearchItem fixture" },
    title: { control: "text" }, description: { control: "text" },
    author: { control: "text", description: "빈 값은 작성자 배열 없음" },
    viewCount: { control: { type: "number", min: 0 } }, likeCount: { control: { type: "number", min: 0 } },
    tags: { control: "text", description: "쉼표로 구분한 탐색 태그; 빈 값은 태그 없음" },
    image: { control: "select", options: ["normal", "missing", "failed"] },
  },
  parameters: { layout: "fullscreen", docs: { description: { component: "탐색 ProjectSearchItem 카드. 홈 카드와 도메인을 분리합니다. 고정 상태는 원래 검증을 자동 실행하고 Playground는 Controls 변경·초기화를 수동으로 제공합니다." } } },
  decorators: [
    /** 탐색 그리드의 실제 반응형 카드 너비를 재현한다. */
    (Story) => <div className="w-full max-w-[1200px] p-4"><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"><Story /></div></div>,
  ],
  /** 고정 탐색 fixture와 누락·실패 표시를 확인한다. */
  async play({ canvasElement, args }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/projects/9301");
    await expect(canvas.getByRole("heading", { name: args.project.title.trim() })).toBeVisible();
    await expect(canvas.getByText(args.project.users[0]?.name || "작성자 정보 없음", { exact: true })).toBeInTheDocument();
    await expect(canvasElement.querySelectorAll("p")).toHaveLength(args.project.description ? 1 : 0);
    if (args.project.thumbnailUrl === null || args.project.thumbnailUrl.includes("missing-")) {
      await expect(await canvas.findByText("썸네일 없음")).toBeVisible();
      await expect(canvasElement.querySelector("img")).toBeNull();
    } else {
      await expect(canvasElement.querySelector("img")).toHaveAttribute("src", "/storybook/project-fixture.svg");
    }
  },
} satisfies Meta<CardArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {};
export const NoDescription: Story = { args: { project: searchCardFixtures.noDescription } };
export const NoUsers: Story = { args: { project: searchCardFixtures.noUsers } };
export const NoTags: Story = { args: { project: searchCardFixtures.noTags } };
export const ManyTags: Story = { args: { project: searchCardFixtures.manyTags } };
export const LongContent: Story = { args: { project: searchCardFixtures.longContent } };
export const MissingThumbnail: Story = { args: { project: searchCardFixtures.missingThumbnail } };
export const FailedThumbnail: Story = { args: { project: searchCardFixtures.failedThumbnail } };

export const Playground: Story = {
  /** 고정 fixture 검사에 영향을 주지 않고 탐색 카드 Controls를 렌더한다. */
  render: function RenderPlayground(args) { const [, , resetArgs] = useArgs<CardArgs>(); return <CardPlayground {...args} onResetArgs={resetArgs} />; },
  /** 자유 조작에서는 고정 문구 기대나 자동 클릭을 실행하지 않는다. */
  async play({ canvasElement }) { await expect(within(canvasElement).getByRole("link")).toBeVisible(); },
  parameters: { docs: { description: { story: "제목·설명·작성자·조회/좋아요 수·쉼표 태그·이미지를 변경하고 초기화하세요. 링크는 /projects/9301이며 fixture 표시와 실제 서버 조회는 별개입니다." } } },
};
