import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ProjectDetailPage } from "./project-detail-page";
import { detailImage, detailProject, emptyDetailProject, failedImageProject, longDetailProject } from "./project-detail-page.story-fixtures";
import { detailReviewHandlers, detailReviewRequests, releaseDetailReview, resetDetailReview } from "./project-detail-page.story-helpers";

/** 실패한 대표·본문 이미지 URL을 정상 URL로 교체하는 실제 컴포넌트 사례다. */
function ImageRecoveryExample() {
  const [recovered, setRecovered] = useState(false);
  return <><button type="button" onClick={/** 정상 URL만 교체하여 제품의 실패 상태 회복을 확인한다. */ () => setRecovered(true)}>정상 이미지로 변경</button>
    <ProjectDetailPage project={recovered ? { ...failedImageProject, thumbnailUrl: detailImage, content: "## 본문 이미지\n\n![본문 자료](" + detailImage + ")" } : failedImageProject} /></>;
}

const meta = {
  title: "Widgets/Project/ProjectDetailPage",
  component: ProjectDetailPage,
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, height: "700px" }, description: { component: "조회된 ProjectDetail props를 표시하는 실제 위젯입니다. Controls는 fixture만 바꿉니다. 서버 컴포넌트 조회·SSR·권한·저장·실제 AI 성공은 검증하지 않습니다. 자료 링크는 로컬 fixture이며 리뷰만 body 없는 POST /api/projects/4205/review를 MSW로 처리합니다. 오류의 다시 시도는 실제 window.location.reload이므로 여기서는 실행하지 않고 별도 앱 QA에서 확인합니다. 고정 play는 자동 조작되며 Default는 수동 조작용입니다." } },
    msw: { handlers: detailReviewHandlers() },
  },
  args: { project: detailProject },
  argTypes: {
    project: { control: "object", description: "기존 공개 ProjectDetail 타입의 조회 결과 fixture. 실제 서버 요청을 실행하지 않습니다." },
    errorMessage: { control: "text", description: "조회 실패 표시. 값이 있으면 상세 대신 오류 UI를 표시합니다." },
  },
  beforeEach: resetDetailReview,
} satisfies Meta<typeof ProjectDetailPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Normal: Story = {
  /** 상세의 실제 자료·모음 링크와 대표 이미지, 초기 리뷰 상태를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: detailProject.title })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "프로젝트 모음으로" })).toHaveAttribute("href", "/projects");
    const file = canvas.getByRole("link", { name: detailProject.files[0].originalName });
    await expect(file).toHaveAttribute("href", detailProject.files[0].fileUrl);
    await expect(file).toHaveAttribute("target", "_blank");
    await expect(file).toHaveAttribute("rel", "noreferrer");
    await expect(canvas.getByText("가상 작성자")).toBeVisible();
    await expect(canvas.getByText("가상 참여자")).toBeVisible();
    await expect(canvas.getByRole("img", { name: detailProject.title + " 대표 이미지" })).toBeVisible();
    await expect(detailReviewRequests).toHaveLength(0);
  },
};
export const EmptyContent: Story = {
  args: { project: emptyDetailProject },
  /** 본문·자료·이미지·작성자·참여자가 없을 때의 실제 표시를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "아직 본문이 작성되지 않았어요" })).toBeVisible();
    await expect(canvas.getByText("첨부된 자료가 없어요.")).toBeVisible();
    await expect(canvas.getByText("작성자 정보 없음")).toBeVisible();
    await expect(canvas.getByText("없음", { exact: true })).toBeVisible();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
export const WithoutOwner: Story = { args: { project: { ...detailProject, users: [detailProject.users[1]] } } };
export const WithoutMembers: Story = { args: { project: { ...detailProject, users: [detailProject.users[0]] } } };
export const LongContent: Story = {
  args: { project: longDetailProject },
  parameters: { a11y: { test: "todo" }, docs: { description: { story: "긴 제목·첨부명·표·코드. 표와 코드는 내부 스크롤이어야 하며 전체 문서 넘침을 숨기지 않습니다. 접근성 미완료(todo): 실제 error 검사에서 .campus-markdown-table과 pre의 scrollable-region-focusable 위반을 확인했습니다. 기존 MarkdownViewer의 키보드 접근 문제이며 제품 수정은 이 스토리 작업 소유 범위 밖입니다. 동작 통과와 접근성 미완료를 구분합니다." } } },
  /** 실제 넘치는 표와 코드의 내부 스크롤 및 문서 폭을 확인한다. */
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector<HTMLElement>(".campus-markdown-table")!;
    const code = canvasElement.querySelector<HTMLElement>("pre")!;
    await expect(table.scrollWidth).toBeGreaterThan(table.clientWidth);
    await expect(code.scrollWidth).toBeGreaterThan(code.clientWidth);
    table.scrollLeft = 100;
    code.scrollLeft = 100;
    await expect(table.scrollLeft).toBeGreaterThan(0);
    await expect(code.scrollLeft).toBeGreaterThan(0);
    table.scrollLeft = 0;
    code.scrollLeft = 0;
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
export const FailedImages: Story = {
  args: { project: failedImageProject },
  /** 대표와 본문 이미지의 HTTP 실패가 각각 대체 표시로 바뀌는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(/** 대표와 본문에서 실패 안내가 렌더될 때까지 확인한다. */ () => expect(canvas.getByText("이미지 없음")).toBeVisible());
    await expect(canvas.getByText("이미지를 불러오지 못했어요")).toBeVisible();
  },
};
export const ImageRecovery: Story = {
  render: ImageRecoveryExample,
  /** 같은 컴포넌트의 src 변경으로 실패 이미지가 회복되는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(/** 두 이미지의 실패가 확인된 뒤 복구한다. */ () => expect(canvas.getByText("이미지 없음")).toBeVisible());
    await expect(canvas.getByText("이미지를 불러오지 못했어요")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "정상 이미지로 변경" }));
    await waitFor(/** 새 정상 이미지를 실제로 내려받았는지 확인한다. */ () => {
      const images = Array.from(canvasElement.querySelectorAll("img"));
      expect(images).toHaveLength(2);
      images.forEach(/** 각 이미지의 실제 로드 상태를 검사한다. */ (image) => expect(image.naturalWidth).toBeGreaterThan(0));
    });
    await expect(canvas.queryByText("이미지를 불러오지 못했어요")).not.toBeInTheDocument();
  },
};
export const QueryError: Story = {
  args: { project: undefined, errorMessage: "프로젝트 조회에 실패했습니다." },
  /** 실제 reload를 호출하지 않고 오류 문구·버튼·복귀 링크만 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "프로젝트를 불러오지 못했어요" })).toBeVisible();
    await expect(canvas.getByText("프로젝트 조회에 실패했습니다.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "다시 시도" })).toBeEnabled();
    await expect(canvas.getByRole("link", { name: "프로젝트 모음으로" })).toHaveAttribute("href", "/projects");
    await expect(detailReviewRequests).toHaveLength(0);
  },
};
export const MissingProject: Story = { args: { project: undefined } };
export const ReviewSuccess: Story = {
  /** 실제 리뷰 버튼의 성공 결과와 body 없는 단일 POST를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    await expect(await canvas.findByText("구조와 책임이 명확한 프로젝트입니다.")).toBeVisible();
    await expect(detailReviewRequests).toEqual([{ method: "POST", pathname: "/api/projects/4205/review", query: "", body: "" }]);
  },
};
export const ReviewEmpty: Story = {
  parameters: { msw: { handlers: detailReviewHandlers("empty") } },
  /** 빈 목록과 요약의 실제 대체 문구를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    await expect(await canvas.findByText("요약이 없습니다.")).toBeVisible();
    for (const text of ["카테고리 점수 없음", "치명 이슈 없음", "경고 없음", "강점 정보 없음", "면접 질문 없음", "리팩토링 제안 없음"]) await expect(canvas.getByText(text)).toBeVisible();
  },
};
export const ReviewPending: Story = {
  parameters: { msw: { handlers: detailReviewHandlers("pending") } },
  /** 수동으로 응답을 완료할 수 있는 대기 상태를 제공한다. */
  render: (args) => <><button type="button" onClick={releaseDetailReview}>리뷰 응답 완료</button><ProjectDetailPage {...args} /></>,
  /** 대기 상태에서 중복 클릭이 추가 요청을 만들지 않는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    const pendingButton = await canvas.findByRole("button", { name: "리뷰 생성 중" });
    await expect(pendingButton).toBeDisabled();
    await userEvent.click(pendingButton);
    await waitFor(/** 첫 요청의 wire 기록을 기다린다. */ () => expect(detailReviewRequests).toHaveLength(1));
    await expect(detailReviewRequests[0].body).toBe("");
  },
};
export const ReviewFailure: Story = {
  parameters: { msw: { handlers: detailReviewHandlers("failure") } },
  /** 503 실패 UI를 실제 요청 후 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    await expect(await canvas.findByText("리뷰 서버가 잠시 응답하지 않습니다.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "재시도" })).toBeEnabled();
  },
};
export const ReviewRetry: Story = {
  parameters: { msw: { handlers: detailReviewHandlers("retry") } },
  /** 503 뒤 재시도가 두 번째 body 없는 POST로 성공하는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    await userEvent.click(await canvas.findByRole("button", { name: "재시도" }));
    await expect(await canvas.findByText("구조와 책임이 명확한 프로젝트입니다.")).toBeVisible();
    await expect(detailReviewRequests).toHaveLength(2);
    for (const request of detailReviewRequests) await expect(request).toEqual({ method: "POST", pathname: "/api/projects/4205/review", query: "", body: "" });
  },
};



