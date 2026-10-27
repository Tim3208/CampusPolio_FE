import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ScenarioControls, useScenarioReset } from "../../../../../.storybook/scenario-controls";
import { PortfolioBuilder } from "./portfolio-builder";
import { builderA11yLimitations, builderProjects, createResult, emptyProjectsPage, fixtureImage, longProjectsPage, projectsPage, saveScenarios, saveSteps, type ListScenario, type SaveScenario, type SaveStep } from "./portfolio-builder.story-fixtures";
import { builderHandlers, disposeBuilderScenario, getBuilderEvidence, isBuilderDocsFrame, releaseBuilderRequests, resetBuilderScenario, startBuilderScenario } from "./portfolio-builder.story-helpers";

type BuilderArgs = { list: ListScenario; scenario: SaveScenario };

/** 초기 fixture/시나리오 변경과 명시적 초기화에서만 실제 빌더를 새로 마운트한다. */
function BuilderStory({ list, scenario }: BuilderArgs) {
  const { instanceKey, reset } = useScenarioReset();
  useEffect(
    /** Controls의 시나리오 변경에만 요청 카운트를 초기화한다. */
    () => { resetBuilderScenario(scenario); }, [list, scenario],
  );
  /** 요청을 취소하고 선택·입력·미리보기·파일을 새 인스턴스로 초기화한다. */
  function handleReset() { resetBuilderScenario(scenario); reset(); }
  /** 사용자가 지연 응답을 명시적으로 진행시킨다. */
  function handleRelease() { releaseBuilderRequests(); }
  return (
    <>
      <ScenarioControls onReset={handleReset}>
        {scenario === "pending" && <button type="button" onClick={handleRelease}>지연 응답 완료</button>}
        <span className="text-sm">가상 프로젝트 · 로컬 MSW · 실제 서버 저장/파일 업로드 아님</span>
      </ScenarioControls>
      <PortfolioBuilder key={`${list}-${scenario}-${instanceKey}`} projectsPage={list === "error" ? null : list === "empty" ? emptyProjectsPage : list === "long" ? longProjectsPage : projectsPage} errorMessage={list === "error" ? "프로젝트 목록을 불러오지 못했습니다." : undefined} />
    </>
  );
}

const meta = {
  title: "Features/Portfolio/PortfolioBuilder",
  component: BuilderStory,
  args: { list: "normal", scenario: "success" },
  argTypes: {
    list: { control: "select", options: ["normal", "empty", "error", "long"], description: "서버 조회 대신 projectsPage/errorMessage로 전달하는 초기 UI fixture" },
    scenario: { control: "select", options: saveScenarios, description: "success / 수동 해제 pending / 첫 생성 실패 retry / 지정 저장 단계 실패" },
  },
  parameters: {
    layout: "fullscreen",
    msw: { handlers: builderHandlers },
    nextjs: { appDirectory: true, navigation: { pathname: "/portfolios/new" } },
    docs: {
      story: { inline: false, height: "900px" },
      description: { component: "기존 PortfolioBuilder의 projectsPage/errorMessage만 사용한다. Playground는 자동 클릭 없이 자유 조작하고 고정 사례의 play는 표시된 흐름을 자동 검증한다. 초기 목록·저장 시나리오 변경과 시나리오 초기화만 새 인스턴스를 만든다. Docs 사례는 iframe별로 분리하고 자동 play를 실행하지 않는다. Docs에서는 초기 fixture와 수동 조작을 제공하고, 고정 흐름 자동 검증은 Canvas/Vitest에서 수행한다. Storybook 10.6.3의 iframe은 docs.story.autoplay 설정을 전달하지 않아 중첩 Docs 문서에서만 play를 생략한다.\n\n저장은 POST 생성 → 필요한 정보 PATCH → 선택 add/remove → 2개 이상 order → visibility false → slug 이동이다. OpenAPI의 필수 userId query를 현재 client가 생략하는 차이를 유지하며 MSW 성공은 실제 서버 수용·권한·영속 저장의 증거가 아니다. 오류는 명세 envelope success:false와 HTTP 400으로 재현한다. 파일 선택은 실제 object URL 로컬 미리보기이며 저장 썸네일은 첫 유효 프로젝트 썸네일이다. rollback·전용 업로드·공개 저장 기능을 추가하지 않는다.\n\n기존 미리보기는 요약 UI이며 dialog 역할, focus trap/복귀, Escape/외부 클릭 닫기를 구현하지 않는다. 실제 제공되는 닫기 버튼을 검증하며 별도 한계로 기록한다. 최신순과 페이지 버튼은 현재 UI의 표시/disabled 상태이며 서버 조회를 수행하지 않는다." },
    },
  },
  /** story 진입마다 실제 URL 추적·요청·라우터 상태를 새로 준비한다. */
  beforeEach(context) {
    startBuilderScenario(context.args.scenario);
    return disposeBuilderScenario;
  },
} satisfies Meta<BuilderArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = ReturnType<typeof within>;

/** 실제 error 실행에서 확인한 개별 story의 접근성 한계를 Canvas와 Docs에 함께 노출한다. */
function limitationParameters(name: string, description = "") {
  const limitation = builderA11yLimitations[`features-portfolio-portfoliobuilder--${name}`];
  if (!limitation) throw new Error(`접근성 관찰 근거가 없는 story: ${name}`);
  return { a11y: { test: "todo" as const }, docs: { description: { story: `${description}\n\n접근성 미완료(todo): ${limitation}` } } };
}

/** 제목 입력을 실제 브라우저 이벤트로 채우고 연속 입력 focus를 확인한다. */
async function enterTitle(canvas: Canvas, title = "  캠퍼스 포트폴리오  ") {
  const input = canvas.getByPlaceholderText("예: 공모전 포트폴리오");
  await userEvent.clear(input);
  await userEvent.type(input, title);
  await expect(input).toHaveValue(title);
  await expect(input).toHaveFocus();
}

/** 목록의 지정 프로젝트를 실제 카드 버튼으로 선택한다. */
async function selectProject(canvas: Canvas, index: number) {
  await userEvent.click(canvas.getByRole("button", { name: new RegExp(builderProjects[index].title) }));
}

/** 선택 영역의 실제 article 순서를 확인한다. */
function selectedArea(canvas: Canvas) {
  const section = canvas.getByRole("heading", { name: "선택된 프로젝트" }).closest("section");
  if (!section) throw new Error("선택 영역 section이 없습니다.");
  return within(section);
}

/** 실제 API 호출의 공통 wire 경계와 호출된 단계 순서를 검증한다. */
async function expectRequests(steps: readonly SaveStep[]) {
  await waitFor(
    /** 비동기 요청 기록이 기대 개수에 도달했는지 확인한다. */
    () => expect(getBuilderEvidence().requests).toHaveLength(steps.length),
  );
  await expect(getBuilderEvidence().requests.map(/** 단계 순서만 추출한다. */ (record) => record.step)).toEqual(steps);
  for (const record of getBuilderEvidence().requests) {
    await expect(record.query).toBe("");
    await expect(record.contentType).toBe("application/json");
    await expect(record.credentials).toBe("include");
    await expect(record.method).toBe(record.step === "create" ? "POST" : "PATCH");
  }
}

/** 모든 조건부 저장 단계를 실행할 입력과 두 프로젝트를 준비한다. */
async function prepareFullSave(canvas: Canvas) {
  await enterTitle(canvas);
  await userEvent.type(canvas.getByPlaceholderText("포트폴리오 설명을 입력하세요"), "  한 학기 기록  ");
  await selectProject(canvas, 0);
  await selectProject(canvas, 1);
  await userEvent.click(selectedArea(canvas).getAllByRole("button", { name: "위로 이동" })[1]);
}

/** 성공 후 실제 router mock의 slug 인수와 단일 호출을 검증한다. */
async function expectSaved() {
  await waitFor(/** 최종 요청 완료 뒤 이동을 기다린다. */ () => expect(getRouter().push).toHaveBeenCalledWith(`/portfolios/${createResult.slug}`));
  await expect(getRouter().push).toHaveBeenCalledTimes(1);
}

export const Playground: Story = { parameters: limitationParameters("playground", "진입 시 저장·선택·미리보기를 자동 실행하지 않는다. Controls 또는 초기화 버튼으로만 새 시나리오를 시작한다.") };

export const Empty: Story = {
  parameters: limitationParameters("empty"),
  args: { list: "empty" },
  /** 빈 목록과 비활성 페이지 버튼을 확인한다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await expect(canvas.getByText("표시할 프로젝트가 없습니다.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "이전" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "다음" })).toBeDisabled();
    await expectRequests([]);
  },
};
export const LoadError: Story = {
  parameters: limitationParameters("load-error"),
  args: { list: "error" },
  /** 조회 오류는 props 표시이며 새 조회 요청을 보내지 않는다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    await expect(within(canvasElement).getByText("프로젝트 목록을 불러오지 못했습니다.")).toBeVisible();
    await expectRequests([]);
  },
};
export const LongContent: Story = { args: { list: "long" }, parameters: limitationParameters("long-content") };

export const SelectionAndPreview: Story = {
  parameters: limitationParameters("selection-and-preview"),
  /** 검색·키보드 선택·순서 경계·해제·미리보기 순서와 닫기를 검증한다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    const search = canvas.getByPlaceholderText("프로젝트 검색");
    await userEvent.type(search, "  TYPESCRIPT  ");
    await expect(canvas.getByRole("button", { name: /도서관 지도/ })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /캠퍼스 기록/ })).not.toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, "없는검색결과");
    await expect(canvas.getByText("표시할 프로젝트가 없습니다.")).toBeVisible();
    await userEvent.clear(search);
    const first = canvas.getByRole("button", { name: /캠퍼스 기록/ });
    first.focus();
    await userEvent.keyboard("{Enter}");
    await selectProject(canvas, 1);
    const selected = selectedArea(canvas);
    await expect(selected.getAllByRole("button", { name: "위로 이동" })[0]).toBeDisabled();
    await expect(selected.getAllByRole("button", { name: "아래로 이동" })[1]).toBeDisabled();
    const down = selected.getAllByRole("button", { name: "아래로 이동" })[0];
    down.focus();
    await userEvent.keyboard(" ");
    await expect(selected.getAllByRole("heading", { level: 3 }).map(/** 표시 제목을 순서대로 읽는다. */ (heading) => heading.textContent)).toEqual(["도서관 지도", "캠퍼스 기록"]);
    await userEvent.click(canvas.getByRole("button", { name: "미리보기" }));
    await expect(canvas.getByRole("heading", { name: "포트폴리오 미리보기" })).toBeVisible();
    await expect(canvas.getAllByRole("heading", { level: 4 }).map(/** 미리보기 순서를 읽는다. */ (heading) => heading.textContent)).toEqual(["도서관 지도", "캠퍼스 기록"]);
    await userEvent.click(canvas.getByRole("button", { name: "미리보기 닫기" }));
    await expect(canvas.queryByRole("heading", { name: "포트폴리오 미리보기" })).not.toBeInTheDocument();
    await userEvent.click(selected.getAllByRole("button", { name: "선택 해제" })[0]);
    await expect(selected.getAllByRole("article")).toHaveLength(1);
    await selectProject(canvas, 0);
    await expect(selected.queryAllByRole("article")).toHaveLength(0);
    await selectProject(canvas, 2);
    await userEvent.click(canvas.getAllByRole("button", { name: "선택 해제" })[0]);
    await expect(selected.queryAllByRole("article")).toHaveLength(0);
    await expectRequests([]);
  },
};

export const PreviewOpen: Story = {
  parameters: limitationParameters("preview-open"),
  /** 미리보기의 실제 열린 상태를 유지한다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await selectProject(canvas, 0);
    await selectProject(canvas, 2);
    await userEvent.click(canvas.getByRole("button", { name: "미리보기" }));
    await expect(canvas.getByText("프로젝트 상세 설명은 다음 단계에서 연결됩니다.")).toBeVisible();
  },
};

export const ValidationBoundaries: Story = {
  parameters: limitationParameters("validation-boundaries"),
  /** 제목 필수·100자 입력 제한 및 설명 500/501자 저장 경계를 검증한다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expect(canvas.getByText("포트폴리오 제목을 입력해주세요.")).toBeVisible();
    await expectRequests([]);
    await enterTitle(canvas, " ");
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectRequests([]);
    const title = canvas.getByPlaceholderText("예: 공모전 포트폴리오");
    await userEvent.clear(title);
    title.focus();
    await userEvent.paste("가".repeat(101));
    await expect(title).toHaveValue("가".repeat(100));
    const description = canvas.getByPlaceholderText("포트폴리오 설명을 입력하세요");
    description.focus();
    await userEvent.paste("나".repeat(502));
    await expect(description).toHaveValue("나".repeat(501));
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expect(canvas.getByText("포트폴리오 설명은 500자 이하로 입력해주세요.")).toBeVisible();
    await expectRequests([]);
    description.focus();
    await userEvent.keyboard("{End}{Backspace}");
    await expect(description).toHaveValue("나".repeat(500));
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectSaved();
    await expectRequests(["create", "info", "visibility"]);
    await expect(getBuilderEvidence().requests[1].body).toEqual({ title: "가".repeat(100), description: "나".repeat(500), thumbnailUrl: null });
  },
};

export const MinimalSave: Story = {
  parameters: limitationParameters("minimal-save"),
  /** 제목만 저장하면 조건부 요청 세 개가 생략된다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await enterTitle(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectSaved();
    await expectRequests(["create", "visibility"]);
    await expect(getBuilderEvidence().requests.map(/** 각 JSON 본문을 읽는다. */ (record) => record.body)).toEqual([{ title: "캠퍼스 포트폴리오" }, { isPublic: false }]);
  },
};
export const SingleProjectSave: Story = {
  parameters: limitationParameters("single-project-save"),
  /** 썸네일 없는 프로젝트 하나는 info/order 없이 추가 요청만 보낸다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await enterTitle(canvas);
    await selectProject(canvas, 0);
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectSaved();
    await expectRequests(["create", "projects", "visibility"]);
    await expect(getBuilderEvidence().requests[1].body).toEqual({ add: [9101], remove: [] });
  },
};
export const OrderedSave: Story = {
  parameters: limitationParameters("ordered-save"),
  /** 순서를 바꾼 선택과 trim된 정보가 정확한 순서의 JSON 요청으로 전송된다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await prepareFullSave(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectSaved();
    await expectRequests(saveSteps);
    await expect(getBuilderEvidence().requests.map(/** 저장 본문 목록을 읽는다. */ (record) => record.body)).toEqual([
      { title: "캠퍼스 포트폴리오" },
      { title: "캠퍼스 포트폴리오", description: "한 학기 기록", thumbnailUrl: fixtureImage },
      { add: [9102, 9101], remove: [] }, { projectOrder: [9102, 9101] }, { isPublic: false },
    ]);
  },
};

export const Saving: Story = {
  parameters: limitationParameters("saving"),
  args: { scenario: "pending" },
  /** 지연 상태에서 버튼 disabled와 중복 요청 차단을 확인하고 사용자가 해제할 수 있게 남긴다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await enterTitle(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await waitFor(/** pending 생성 요청을 기다린다. */ () => expect(getBuilderEvidence().pending).toBe(1));
    const saving = canvas.getByRole("button", { name: "저장 중" });
    await expect(saving).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "미리보기" })).toBeDisabled();
    await userEvent.click(saving);
    await expectRequests(["create"]);
    await expect(getRouter().push).not.toHaveBeenCalled();
  },
};

/** 지정된 실제 API 단계가 실패하면 후속 요청·이동을 중단하는 고정 사례를 만든다. */
function failureStory(step: SaveStep): Story {
  return {
    args: { scenario: step },
    parameters: limitationParameters(`${step}-failure`, `${step} 단계의 HTTP 400 실패. 이전 요청은 취소/rollback하지 않고 이후 요청과 이동만 중단하는 현재 제품 동작이다.`),
    /** 모든 저장 단계를 준비한 뒤 지정 실패 지점까지의 실제 요청을 확인한다. */
    async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
      const canvas = within(canvasElement);
      await prepareFullSave(canvas);
      await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
      await expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
      await expectRequests(saveSteps.slice(0, saveSteps.indexOf(step) + 1));
      await expect(canvas.getByRole("button", { name: "비공개 저장" })).toBeEnabled();
      await expect(canvas.getByPlaceholderText("예: 공모전 포트폴리오")).toHaveValue("  캠퍼스 포트폴리오  ");
      await expect(getRouter().push).not.toHaveBeenCalled();
    },
  };
}
export const CreateFailure: Story = { ...failureStory("create") };
export const InfoFailure: Story = { ...failureStory("info") };
export const ProjectsFailure: Story = { ...failureStory("projects") };
export const OrderFailure: Story = { ...failureStory("order") };
export const VisibilityFailure: Story = { ...failureStory("visibility") };

export const RetrySuccess: Story = {
  parameters: limitationParameters("retry-success"),
  args: { scenario: "retry" },
  /** 첫 생성 실패 뒤 입력을 수정하고 다시 저장하는 현재 재시도 동작을 확인한다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await enterTitle(canvas);
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await canvas.findByText("요청을 처리하지 못했습니다.");
    await enterTitle(canvas, "다시 저장");
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectSaved();
    await expectRequests(["create", "create", "visibility"]);
    await expect(getBuilderEvidence().requests[1].body).toEqual({ title: "다시 저장" });
  },
};

export const FilePreviewAndReset: Story = {
  parameters: limitationParameters("file-preview-and-reset"),
  /** 실제 파일 URL 생성/교체/해제와 저장 썸네일 분리 및 초기화를 검증한다. */
  async play({ canvasElement }) {
    if (isBuilderDocsFrame()) return;
    const canvas = within(canvasElement);
    await enterTitle(canvas);
    await selectProject(canvas, 0);
    await selectProject(canvas, 1);
    const fileInput = canvas.getByLabelText("파일 선택");
    // 유효한 작은 PNG를 사용하므로 실제 CSS 이미지 로드까지 로컬에서 가능하다.
    const bytes = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII="), /** 이진 문자열의 바이트를 읽는다. */ (char) => char.charCodeAt(0));
    await userEvent.upload(fileInput, new File([bytes], "first.png", { type: "image/png" }));
    const firstUrl = getBuilderEvidence().activeUrls[0];
    await expect(canvas.getByRole("img", { name: "선택한 썸네일 미리보기" })).toHaveStyle({ backgroundImage: `url("${firstUrl}")` });
    await userEvent.upload(fileInput, new File([bytes], "second.png", { type: "image/png" }));
    await expect(getBuilderEvidence().urls).toContainEqual({ action: "revoke", url: firstUrl });
    await expect(getBuilderEvidence().activeUrls).toHaveLength(1);
    await expect(canvas.getByText("second.png 미리보기 중")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectSaved();
    await expectRequests(saveSteps);
    await expect(getBuilderEvidence().requests[1].body).toEqual({ title: "캠퍼스 포트폴리오", description: "", thumbnailUrl: fixtureImage });
    await userEvent.click(canvas.getByRole("button", { name: "미리보기" }));
    const secondUrl = getBuilderEvidence().activeUrls[0];
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    await waitFor(/** unmount cleanup이 실제 URL을 해제했는지 확인한다. */ () => expect(getBuilderEvidence().activeUrls).toHaveLength(0));
    await expect(getBuilderEvidence().urls).toContainEqual({ action: "revoke", url: secondUrl });
    await expect(getBuilderEvidence().urls.filter(/** harness 보조 해제 여부를 구분한다. */ (record) => record.action === "cleanup-revoke")).toHaveLength(0);
    await expect(selectedArea(canvas).queryAllByRole("article")).toHaveLength(0);
    await expect(canvas.getByPlaceholderText("예: 공모전 포트폴리오")).toHaveValue("");
    await expect(canvas.queryByRole("heading", { name: "포트폴리오 미리보기" })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("img", { name: "선택한 썸네일 미리보기" })).not.toBeInTheDocument();
    await expectRequests([]);
    await expect(getRouter().push).not.toHaveBeenCalled();
  },
};
