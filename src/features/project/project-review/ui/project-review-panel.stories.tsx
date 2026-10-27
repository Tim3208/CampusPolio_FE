import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { useArgs } from "storybook/preview-api";
import { expect, userEvent, within } from "storybook/test";
import { ProjectReviewPanel } from "./project-review-panel";
import { emptyProjectReview, normalProjectReview, reviewEmptyMessages, reviewFailureMessage, reviewProjectId, reviewSectionTitles } from "./project-review-panel.story-fixtures";
import { createReviewScenario, expectNormalReview, expectReviewEnvironment, expectReviewRequests, type ReviewMode, type ReviewScenario } from "./project-review-panel.story-helpers";

const scenarios = {
  ready: createReviewScenario("ready"),
  pending: createReviewScenario("pending"),
  success: createReviewScenario("success"),
  empty: createReviewScenario("empty"),
  failure: createReviewScenario("failure"),
  retry: createReviewScenario("retry"),
  playground: createReviewScenario("ready"),
};

type ReviewArgs = { projectId: number; scenario: ReviewMode };

/** 요청은 버튼에 맡기고 시나리오 전환·reset 때만 패널을 새로 만든다. */
function ReviewPlayground(args: ReviewArgs & { onResetArgs: () => void }) {
  const [generation, setGeneration] = useState(0);
  /** 변경된 응답 모드의 요청 관찰을 준비하고 unmount에서 대기를 정리한다. */
  useEffect(() => { scenarios.playground.setMode(args.scenario); return scenarios.playground.reset; }, [args.scenario, generation]);
  /** Controls·요청 카운트·결과·오류·대기와 패널을 초기화한다. */
  function reset() { scenarios.playground.reset(); args.onResetArgs(); setGeneration(generation + 1); }
  /** 지연 시나리오의 로컬 응답을 사용자가 직접 완료한다. */
  function release() { scenarios.playground.release(); }
  return <div className="min-h-screen bg-[#F5F8FB] p-4"><div className="mb-4 flex flex-wrap gap-3"><button type="button" className="rounded border px-3 py-2" onClick={reset}>시나리오 초기화</button>{args.scenario === "pending" && <button type="button" className="rounded border px-3 py-2" onClick={release}>응답 완료</button>}</div><p className="mb-4 max-w-xl text-sm">Controls의 scenario를 고른 뒤 리뷰 요청을 누르세요. pending은 응답 완료로 해제하며 retry는 첫 503 이후 재시도에서 200을 반환합니다. 실제 AI 호출은 하지 않습니다.</p><div className="w-full max-w-[380px]"><ProjectReviewPanel key={`${args.scenario}:${generation}`} projectId={reviewProjectId} /></div></div>;
}

/** 스토리 handler와 해당 요청 관찰을 같은 수명으로 연결한다. */
function scenarioParameters(scenario: ReviewScenario) {
  return { msw: { handlers: [scenario.handler] }, reviewScenario: scenario };
}

const meta = {
  title: "Features/Project/ProjectReviewPanel",
  component: ProjectReviewPanel,
  args: { projectId: reviewProjectId, scenario: "ready" },
  argTypes: { projectId: { control: false, description: "Mock wire 계약을 유지하는 고정 프로젝트 4205" }, scenario: { control: "select", options: ["ready", "pending", "success", "empty", "failure", "retry"], description: "모든 모드는 진입 시 요청 전입니다. 버튼을 누르면 선택한 로컬 응답을 반환합니다." } },
  // 같은 POST 경로를 쓰는 Docs 사례들이 handler·요청 횟수·대기 상태를 공유하지 않게 한다.
  parameters: { layout: "fullscreen", ...scenarioParameters(scenarios.ready), docs: { story: { inline: false, iframeHeight: 600 }, description: { component: "실제 ProjectReviewPanel과 body 없는 POST /api/projects/4205/review를 로컬 MSW로 검증합니다. 고정 상태는 자동 요청하며 Playground는 수동 요청/초기화입니다. Docs는 사례별 iframe으로 handler와 요청 상태를 격리합니다. 정상·재시도 성공의 긴 코드 pre는 기존 scrollable-region-focusable 접근성 제한이 있으며 todo를 PASS로 세지 않습니다." } } },
  /** 실제 상세 우측 패널과 같은 폭에서 스토리 이동마다 새 패널을 마운트한다. */
  render(args, context) {
    return <div className="min-h-screen bg-[#F5F8FB] p-4"><div className="w-full max-w-[380px]"><ProjectReviewPanel key={context.id} projectId={args.projectId} /></div></div>;
  },
  /** 시작·재방문과 종료에서 모든 요청 spy·재시도 횟수·지연을 정리한다. */
  beforeEach() {
    Object.values(scenarios).forEach((scenario) => scenario.reset());
    window.scrollTo(0, 0);
    return () => Object.values(scenarios).forEach((scenario) => scenario.reset());
  },
} satisfies Meta<ReviewArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BeforeRequest: Story = {
  /** 요청 전에는 결과·오류·네트워크 요청이 없고 요청 버튼이 활성 상태다. */
  async play({ canvasElement }) {
    await expectReviewEnvironment();
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "AI 코드 리뷰" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "리뷰 요청" })).toBeEnabled();
    await expect(canvas.queryByText("총점")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "재시도" })).not.toBeInTheDocument();
    await expectReviewRequests(scenarios.ready, 0);
  },
};

export const Pending: Story = {
  parameters: scenarioParameters(scenarios.pending),
  /** 응답을 제어된 대기로 유지하고 더블클릭·추가 클릭도 중복 POST를 만들지 않음을 확인한다. */
  async play({ canvasElement }) {
    await expectReviewEnvironment();
    const canvas = within(canvasElement);
    await userEvent.dblClick(canvas.getByRole("button", { name: "리뷰 요청" }));
    const button = await canvas.findByRole("button", { name: "리뷰 생성 중" });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expectReviewRequests(scenarios.pending, 1);
    await expect(canvas.queryByText("총점")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "재시도" })).not.toBeInTheDocument();
  },
};

export const Success: Story = {
  parameters: scenarioParameters(scenarios.success),
  /** 실제 요청 후 모든 정상 결과 섹션을 검증한다. */
  async play({ canvasElement }) {
    await expectReviewEnvironment();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "리뷰 요청" }));
    await expectNormalReview(canvasElement);
    await expectReviewRequests(scenarios.success, 1);
  },
};

export const EmptyLists: Story = {
  parameters: scenarioParameters(scenarios.empty),
  /** 모든 목록이 빈 응답의 총점·요약과 여섯 기존 빈 안내를 확인한다. */
  async play({ canvasElement }) {
    await expectReviewEnvironment();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    await expect(await canvas.findByText(emptyProjectReview.summary)).toBeVisible();
    await expect(canvas.getByText("0")).toBeVisible();
    for (const title of reviewSectionTitles) await expect(canvas.getByRole("heading", { name: title })).toBeVisible();
    for (const message of reviewEmptyMessages) await expect(canvas.getByText(message)).toBeVisible();
    await expect(canvas.getByRole("button", { name: "다시 생성" })).toBeEnabled();
    await expectReviewRequests(scenarios.empty, 1);
  },
};

export const Failure: Story = {
  parameters: scenarioParameters(scenarios.failure),
  /** 실제 API client가 처리한 고정 실패와 활성 재시도를 표시한다. */
  async play({ canvasElement }) {
    await expectReviewEnvironment();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    await expect(await canvas.findByText(reviewFailureMessage)).toBeVisible();
    await expect(canvas.getByRole("button", { name: "재시도" })).toBeEnabled();
    await expect(canvas.getByRole("button", { name: "리뷰 요청" })).toBeEnabled();
    await expect(canvas.queryByText("총점")).not.toBeInTheDocument();
    await expectReviewRequests(scenarios.failure, 1);
  },
};

export const RetrySuccess: Story = {
  parameters: scenarioParameters(scenarios.retry),
  /** 첫 503 실패 후 재시도만 두 번째 POST를 보내고 오류를 해소한다. */
  async play({ canvasElement }) {
    await expectReviewEnvironment();
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "리뷰 요청" }));
    await expect(await canvas.findByText(reviewFailureMessage)).toBeVisible();
    await expectReviewRequests(scenarios.retry, 1);
    await userEvent.click(canvas.getByRole("button", { name: "재시도" }));
    await expect(await canvas.findByRole("button", { name: "리뷰 생성 중" })).toBeDisabled();
    await expect(canvas.queryByText(reviewFailureMessage)).not.toBeInTheDocument();
    await expectNormalReview(canvasElement);
    await expectReviewRequests(scenarios.retry, 2);
    await expect(scenarios.retry.requestSpy.mock.calls.map(([request]) => request.status)).toEqual([503, 200]);
    await expect(canvas.getByText(normalProjectReview.summary)).toBeVisible();
  },
};

export const Playground: Story = {
  parameters: { ...scenarioParameters(scenarios.playground), docs: { description: { story: "요청 전·제어된 지연·성공·빈 결과·실패·재시도를 Controls에서 선택합니다. 진입 시 자동 요청하지 않습니다. 초기화/모드 변경/재방문은 이전 요청을 정리합니다. 초기 화면은 a11y error 검사 대상이며 수동 성공 결과의 긴 코드 영역에는 기존 접근성 미완료가 남습니다." } } },
  /** 고정 play와 분리된 수동 패널을 제공한다. */
  render: function RenderPlayground(args) { const [, , resetArgs] = useArgs<ReviewArgs>(); return <ReviewPlayground {...args} onResetArgs={resetArgs} />; },
};

export const PlaygroundDelayAndReset: Story = {
  ...Playground,
  args: { scenario: "pending" },
  /** 수동 wrapper의 진입 무요청·중복 차단·응답 해제·reset을 검증한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expectReviewRequests(scenarios.playground, 0);
    await userEvent.dblClick(canvas.getByRole("button", { name: "리뷰 요청" }));
    await expect(await canvas.findByRole("button", { name: "리뷰 생성 중" })).toBeDisabled();
    await expectReviewRequests(scenarios.playground, 1);
    await userEvent.click(canvas.getByRole("button", { name: "응답 완료" }));
    await expectNormalReview(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    await expect(canvas.getByRole("button", { name: "리뷰 요청" })).toBeEnabled();
    await expect(canvas.queryByText("총점")).not.toBeInTheDocument();
    await expectReviewRequests(scenarios.playground, 0);
  },
};
