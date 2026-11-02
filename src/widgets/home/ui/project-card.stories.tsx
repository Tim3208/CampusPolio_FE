import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import type { HomeProject } from "@/entities/project";
import { ProjectCard } from "./project-card";
import { homeCardFixtures } from "./project-card.story-fixtures";

type CardArgs = {
  project: HomeProject;
  title: string;
  author: string;
  viewCount: number;
  likeCount: number;
  tag: string;
  image: "normal" | "missing" | "failed";
};

/** flat Controls 값을 홈 도메인으로 조합하고 명시적 초기화만 제공한다. */
function CardPlayground(args: CardArgs & { onResetArgs: () => void }) {
  const project: HomeProject = { ...homeCardFixtures.normal, title: args.title, authorName: args.author, viewCount: args.viewCount, likeCount: args.likeCount, tag: args.tag, thumbnailUrl: args.image === "missing" ? null : args.image === "failed" ? homeCardFixtures.failedThumbnail.thumbnailUrl : homeCardFixtures.normal.thumbnailUrl };
  /** Controls와 미리보기 값을 최초 기본값으로 복원한다. */
  function reset() { args.onResetArgs(); }
  return <div className="min-w-0"><button type="button" className="mb-4 rounded border px-3 py-2" onClick={reset}>시나리오 초기화</button><ProjectCard project={project} /></div>;
}

const meta = {
  title: "Widgets/Home/ProjectCard",
  component: ProjectCard,
  /** 고정 상태에서는 원래 제품 props만 전달한다. */
  render: (args) => <ProjectCard project={args.project} />,
  args: { project: homeCardFixtures.normal, title: homeCardFixtures.normal.title, author: homeCardFixtures.normal.authorName, viewCount: 1234, likeCount: 56, tag: "공학", image: "normal" },
  argTypes: {
    project: { control: false, description: "고정 회귀용 HomeProject fixture" },
    title: { control: "text", description: "홈 카드 제목" },
    author: { control: "text", description: "빈 값은 작성자 정보 없음" },
    viewCount: { control: { type: "number", min: 0 } },
    likeCount: { control: { type: "number", min: 0 } },
    tag: { control: "text", description: "홈 도메인의 단일 태그" },
    image: { control: "select", options: ["normal", "missing", "failed"] },
  },
  parameters: { layout: "fullscreen", docs: { description: { component: "홈 HomeProject 카드. 고정 상태는 원래 fixture와 링크/이미지를 자동 검증합니다. Playground는 flat Controls를 실제 홈 타입으로 조합하며 자동 클릭 없이 자유롭게 조작하고 초기화할 수 있습니다." } } },
  decorators: [
    /** 홈 그리드의 카드 폭을 반응형 부모로 재현한다. */
    (Story) => <div className="w-full max-w-[1200px] p-4"><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"><Story /></div></div>,
  ],
  /** 타입에 맞는 fixture·상세 링크와 이미지 대체 상태를 확인한다. */
  async play({ canvasElement, args }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "/projects/9201");
    await expect(canvas.getByRole("heading", { name: args.project.title.trim() })).toBeVisible();
    await expect(canvas.getByText(args.project.authorName.trim() || "작성자 정보 없음", { exact: true })).toBeInTheDocument();
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
export const LongContent: Story = { args: { project: homeCardFixtures.longContent } };
export const MissingAuthor: Story = { args: { project: homeCardFixtures.missingAuthor } };
export const MissingThumbnail: Story = { args: { project: homeCardFixtures.missingThumbnail } };
export const FailedThumbnail: Story = { args: { project: homeCardFixtures.failedThumbnail } };
export const LargeCounts: Story = { args: { project: homeCardFixtures.largeCounts } };

export const Playground: Story = {
  /** 고정 fixture 검증과 분리해 Controls를 실제 카드에 전달한다. */
  render: function RenderPlayground(args) { const [, , resetArgs] = useArgs<CardArgs>(); return <CardPlayground {...args} onResetArgs={resetArgs} />; },
  /** 자유 조작 진입에서는 자동 클릭과 고정 문구 기대를 실행하지 않는다. */
  async play({ canvasElement }) { await expect(within(canvasElement).getByRole("link")).toBeVisible(); },
  parameters: { docs: { description: { story: "제목·작성자·수치·단일 태그·이미지를 Controls에서 변경하세요. 초기화는 Controls도 복원합니다. 링크는 /projects/9201이며 실제 서버 조회를 검증하지 않습니다." } } },
};
