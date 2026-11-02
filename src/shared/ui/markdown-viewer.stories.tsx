import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { useState, type ComponentProps } from "react";
import { ScenarioControls } from "../../../.storybook/scenario-controls";
import { Button } from "./button";
import { MarkdownViewer } from "./markdown-viewer";
import { basicMarkdown, failedImageMarkdown, longMarkdown, normalImageMarkdown } from "./markdown-viewer.story-fixtures";

type MarkdownStoryArgs = ComponentProps<typeof MarkdownViewer> & { parentWidth: number };

/** 부모 폭과 원문을 Controls에서 받아 remount 없이 실제 뷰어에 전달한다. */
function MarkdownPlayground() {
  const [args, , resetArgs] = useArgs<MarkdownStoryArgs>();
  /** 원문과 부모 폭을 최초 값으로 복원한다. */
  function handleReset() { resetArgs(); }
  return <><ScenarioControls onReset={handleReset} />
    <div style={{ width: args.parentWidth, maxWidth: "100%" }} data-testid="markdown-parent"><MarkdownViewer content={args.content} /></div>
  </>;
}

/** 같은 이미지 위치의 실패 src를 정상 로컬 src로 바꿔 회복을 시연한다. */
function RecoverableImage() {
  const [recovered, setRecovered] = useState(false);
  /** 뷰어 인스턴스를 보존한 채 이미지 주소만 교체한다. */
  function handleRecover() { setRecovered(true); }
  return <><Button onClick={handleRecover}>정상 이미지로 변경</Button>
    <MarkdownViewer content={`## 이미지 회복\n\n![회복 확인 이미지](${recovered ? "/storybook/project-fixture.svg" : "/storybook/missing-markdown-image.svg"})`} />
  </>;
}

const meta = {
  title: "Shared/MarkdownViewer",
  component: MarkdownViewer,
  args: { content: basicMarkdown, parentWidth: 720 },
  argTypes: {
    content: { control: "text", description: "일반 Markdown/GFM 원문. HTML은 제품 규칙에 따라 생략됩니다." },
    parentWidth: { control: { type: "range", min: 240, max: 1040, step: 10 }, description: "Playground 부모 표시 폭(CSS px). 화면 폭을 넘으면 100%로 제한합니다." },
    className: { control: false },
  },
  parameters: { layout: "fullscreen", docs: { description: { component: "실제 MarkdownViewer로 일반/GFM, 내부 스크롤, 로컬 이미지 상태를 확인합니다. 고정 play와 수동 Playground를 구분하며 실제 서버 조회·SSR 검증은 포함하지 않습니다." } } },
  decorators: [
    /** 상세 본문과 같은 최대 너비와 페이지 여백을 제공한다. */
    (Story, context) => <div key={context.id} className="mx-auto w-full max-w-[1040px] p-4 md:p-8"><Story /></div>,
  ],
} satisfies Meta<MarkdownStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HeadingsAndLists: Story = {
  /** 제목과 일반·순서·작업 목록을 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "캠퍼스 프로젝트 기록" })).toBeVisible();
    await expect(canvas.getAllByRole("list")).toHaveLength(3);
    await expect(canvas.getByRole("checkbox")).toBeChecked();
  },
};
export const LongContent: Story = {
  args: { content: longMarkdown },
  /** 넓은 GFM 표와 코드가 내부 스크롤 영역에 표시되는지 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("table")).toBeVisible();
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "https://example.invalid/project");
    await expect(canvasElement.querySelector(".campus-markdown-table")).toHaveStyle({ overflowX: "auto" });
    await expect(canvasElement.querySelector("pre")).toHaveStyle({ overflowX: "auto" });
  },
};
export const NormalImage: Story = {
  args: { content: normalImageMarkdown },
  /** 정상 이미지 URL이 실패 대체로 남지 않는지 확인한다. */
  async play({ canvasElement }) {
    const image = within(canvasElement).getByRole("img", { name: "가상 프로젝트 이미지" });
    await expect(image).toHaveAttribute("src", "/storybook/project-fixture.svg");
    await expect(within(canvasElement).queryByText("이미지 없음")).not.toBeInTheDocument();
  },
};
export const FailedImage: Story = {
  args: { content: failedImageMarkdown },
  /** 실제 로컬 이미지 로드 실패 후 접근 가능한 대체 표시를 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("이미지 없음", {}, { timeout: 10000 })).toBeVisible();
    await expect(canvas.getByRole("img", { name: "실패한 프로젝트 이미지" })).toHaveAttribute("role", "img");
    await expect(canvasElement.querySelector("img")).toBeNull();
  },
};

export const Playground: Story = {
  args: { content: normalImageMarkdown, parentWidth: 720 },
  render: MarkdownPlayground,
  parameters: { docs: { description: { story: "원문과 부모 폭을 변경하고 시나리오 초기화로 복원합니다. 본문을 숨기는 overflow:hidden은 사용하지 않습니다. GFM 작업 목록의 이름 없는 checkbox는 기존 제품의 알려진 접근성 제한입니다." } } },
};

export const ImageRecovery: Story = {
  render: RecoverableImage,
  parameters: { docs: { description: { story: "실패 대체를 확인한 뒤 같은 뷰어의 src만 바꾸어 정상 이미지 회복을 자동 검증합니다." } } },
  /** 실패 대체 이후 새 정상 src의 실제 이미지 로드를 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("이미지 없음", {}, { timeout: 10000 })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "정상 이미지로 변경" }));
    const image = await canvas.findByRole("img", { name: "회복 확인 이미지" });
    await waitFor(() => expect(image).toHaveAttribute("src", "/storybook/project-fixture.svg"));
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
    await expect(canvas.queryByText("이미지 없음")).not.toBeInTheDocument();
  },
};
