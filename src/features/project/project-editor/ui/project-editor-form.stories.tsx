import { isEditorDocsEmbed } from "./rich-markdown-editor.story-helpers";
import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { ScenarioControls, useScenarioReset } from "../../../../../.storybook/scenario-controls";
import { ProjectEditorForm } from "./project-editor-form";
import { createEditorPngFile, editorPngUrl, editorA11yLimitations, editorProject, editorProjectId, editorScenarios, maxEditorFileBytes, type EditorScenario } from "./project-editor-form.story-fixtures";
import { disposeEditorSession, editorHandlers, expectSaved, fillEditor, getEditorFileInput, getEditorRequests, getEditorSnapshot, releaseEditorResponses, resetEditorSession, subscribeEditorRequests } from "./project-editor-form.story-helpers";

type FormArgs = { mode: "create" | "edit"; scenario: EditorScenario };
/** 폼 초기값/시나리오 전환과 명시적 초기화에서만 form 인스턴스를 바꾼다. */
function FormPlayground({ mode, scenario }: FormArgs) {
  const { instanceKey, reset } = useScenarioReset();
  const requests = useSyncExternalStore(subscribeEditorRequests, getEditorSnapshot, getEditorSnapshot);
  /** 명시적 초기화는 입력·파일·요청·라우터 기록을 함께 복원한다. */
  function resetForm() { resetEditorSession(scenario); reset(); }
  useLayoutEffect(() => { resetEditorSession(scenario); }, [mode, scenario]);
  useEffect(() => () => disposeEditorSession(), []);
  return <main className="mx-auto max-w-7xl p-4" data-scenario={scenario} data-mode={mode}>
    <h1 className="mb-4 text-2xl font-bold">프로젝트 편집</h1>
    <ScenarioControls onReset={resetForm}>
      <button type="button" className="rounded border px-3 py-2" onClick={releaseEditorResponses}>지연 응답 완료</button>
    </ScenarioControls>
    <ProjectEditorForm key={`${mode}:${scenario}:${instanceKey}`} mode={mode} projectId={mode === "edit" ? editorProjectId : undefined} />
    <details className="mt-6"><summary>로컬 MSW 요청 기록</summary><pre data-testid="editor-requests" className="whitespace-pre-wrap break-all">{requests}</pre></details>
  </main>;
}

const meta = {
  title: "Features/Project/ProjectEditorForm",
  component: FormPlayground,
  args: { mode: "create", scenario: "success" },
  argTypes: {
    mode: { control: "inline-radio", options: ["create", "edit"], description: "실제 제품의 create/edit props. 변경 시 새 폼으로 시작한다." },
    scenario: { control: "select", options: editorScenarios, description: "로컬 MSW 응답과 지연/오류. 변경 시 입력/요청을 초기화한다." },
  },
  parameters: {
    layout: "fullscreen", msw: { handlers: editorHandlers },
    docs: { story: { inline: false, height: "800px" }, description: { component: "Docs는 iframe별 초기 상태와 수동 조작을 제공하며 자동 play는 Canvas와 Vitest에서 실행한다. 원래 ProjectEditorForm을 실제 브라우저에서 조작한다. Playground 진입은 create 저장/업로드를 자동 실행하지 않는다. edit는 원래 GET 조회를 실행한다. 지연 시나리오는 '지연 응답 완료'로 진행하고 초기화/재방문으로 정리한다. 링크 prompt는 RichMarkdownEditor 전용 사례에서 확인한다. 사용자 정보 명세에는 userId query가 필수지만 현재 client는 세션 방식으로 query를 생략한다. MSW는 현재 client의 UI 경계를 확인하며 실제 서버 수용·권한·업로드·저장·rollback은 보장하지 않는다. 파일 크기 50MB 문구는 50×1024×1024 bytes다. MIME과 확장자 허용은 현 제품의 OR 규칙을 따른다. 제작 연도/학기/학과는 현재 저장 payload에 포함되지 않는다.\n\n접근성 미완료(todo): 기존 업로드된 파일 문구 대비 4.34:1, 공개 등록 설명 대비 3.90:1이 4.5:1에 미달한다. loading/error를 제외한 아래 21개 ID는 동작 검사와 접근성 통과를 분리한다. 제품 색상은 변경하지 않는다.\n\n" + Object.keys(editorA11yLimitations).map((id) => "- " + id).join("\n") } },
  },
  /** 스토리/Controls 전환마다 독립된 요청·지연 세션을 사용한다. */
  beforeEach(context) {
    resetEditorSession(context.args.scenario);
    const limitation = editorA11yLimitations[context.id];
    if (limitation) {
      context.parameters.a11y = { ...context.parameters.a11y, test: "todo" };
      context.parameters.docs = { ...context.parameters.docs, description: { ...context.parameters.docs?.description, story: `${context.parameters.docs?.description?.story ?? ""}\n접근성 미완료(todo): ${limitation}` } };
    }
    return disposeEditorSession;
  },
} satisfies Meta<FormArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
const base = `/api/projects/${editorProjectId}`;
const createSequence = ["GET /api/users/me", "POST /api/projects", `PATCH ${base}`];

export const Playground: Story = {};
export const EditLoaded: Story = {
  args: { mode: "edit" },
  /** 실제 조회 응답으로 제목·본문·태그 초기값을 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("프로젝트 제목")).toHaveValue(editorProject.title);
    await waitFor(() => expect(canvas.getByRole("textbox", { name: "프로젝트 본문" })).toHaveTextContent(editorProject.content));
    await expect(canvas.getByRole("button", { name: "수정 저장" })).toBeEnabled();
  },
};
export const EditLoading: Story = {
  args: { mode: "edit", scenario: "load-pending" },
  /** 제어된 조회 지연 화면을 확인하고 자동으로 완료하지 않는다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return; await expect(await within(canvasElement).findByText("프로젝트 정보를 불러오는 중입니다.")).toBeVisible(); },
};
export const EditLoadError: Story = {
  args: { mode: "edit", scenario: "load-error" },
  /** 조회 실패의 기존 문구와 목록 복귀를 검증한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("프로젝트 정보를 불러오지 못했습니다")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "프로젝트 모음으로 돌아가기" }));
    await expect(getRouter().push).toHaveBeenCalledWith("/mypage/projects");
  },
};
export const Publish: Story = {
  /** 공개 create만 draft→PATCH→publish를 실행하는지 wire body와 순서를 검사한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    await fillEditor(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "등록하기" }));
    await expectSaved([...createSequence, `POST ${base}/publish`]);
    await expect(getEditorRequests()[1].body).toEqual({ title: "새 프로젝트", description: "저장 본문" });
    await expect(getEditorRequests()[2].body).toEqual({ title: "새 프로젝트", description: "저장 본문", content: "저장 본문", tags: [] });
    await expect(getEditorRequests()[3].body).toEqual({ title: "새 프로젝트", content: "저장 본문", tags: [] });
  },
};
export const Draft: Story = {
  /** 임시 저장은 본문 없이 가능하고 발행 요청을 하지 않는다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("프로젝트 제목"), "임시 제목");
    await userEvent.click(canvas.getByRole("button", { name: "임시 저장" }));
    await expectSaved(createSequence);
  },
};
export const PrivateSave: Story = {
  /** 비공개 저장의 원래 toggle과 draft→PATCH 경계를 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /공개 등록/ }));
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expect(canvas.getByText("비공개로 저장하려면 프로젝트 제목을 입력해주세요.")).toBeVisible();
    await userEvent.type(canvas.getByLabelText("프로젝트 제목"), "비공개 제목");
    await userEvent.click(canvas.getByRole("button", { name: "비공개 저장" }));
    await expectSaved(createSequence);
  },
};
export const EditSave: Story = {
  args: { mode: "edit" },
  /** edit 저장에서는 기존 ID의 PATCH만 수행하고 draft/publish를 추가하지 않는다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await canvas.findByDisplayValue(editorProject.title);
    await userEvent.click(canvas.getByRole("button", { name: "수정 저장" }));
    await expectSaved([`GET ${base}`, "GET /api/users/me", `PATCH ${base}`]);
  },
};
export const Validation: Story = {
  /** 빈 제목/본문과 실제 maxLength 255 및 연속 입력 focus를 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "임시 저장" }));
    await expect(canvas.getByText("임시 저장하려면 프로젝트 제목을 입력해주세요.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "등록하기" }));
    await expect(canvas.getByText("프로젝트 제목과 본문을 입력해주세요.")).toBeVisible();
    const title = canvas.getByLabelText("프로젝트 제목");
    await userEvent.type(title, "가".repeat(256));
    await expect(title).toHaveValue("가".repeat(255)); await expect(title).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "등록하기" }));
    await expect(canvas.getByText("프로젝트 제목과 본문을 입력해주세요.")).toBeVisible();
    await expect(getEditorRequests()).toHaveLength(0);
  },
};
export const TagsBoundary: Story = {
  /** trim/# 제거·중복·10개/11번째 제한·삭제를 실제 Enter 입력으로 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText("새로운 태그 입력 후 Enter...");
    await userEvent.type(input, "  #AI  {Enter}");
    await expect(canvas.getByRole("button", { name: /AI 태그 삭제/ })).toBeVisible();
    await userEvent.type(input, "AI{Enter}");
    await expect(canvas.getAllByRole("button", { name: /태그 삭제/ })).toHaveLength(1);
    await userEvent.clear(input);
    for (let i = 1; i < 10; i++) await userEvent.type(input, `태그${i}{Enter}`);
    await userEvent.type(input, "열한번째{Enter}");
    await expect(canvas.getAllByRole("button", { name: /태그 삭제/ })).toHaveLength(10);
    await expect(canvas.getByText("태그는 최대 10개까지 추가할 수 있습니다.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /AI 태그 삭제/ }));
    await expect(canvas.getAllByRole("button", { name: /태그 삭제/ })).toHaveLength(9);
  },
};
export const Saving: Story = {
  args: { scenario: "save-pending" },
  /** 저장 지연 동안 실제 disabled 버튼과 완료 뒤 이동을 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement); await fillEditor(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "등록하기" }));
    await waitFor(() => expect(getEditorRequests()).toHaveLength(3));
    await expect(canvas.getByRole("button", { name: "등록 중..." })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "임시 저장" })).toBeDisabled();
    await expect(getRouter().push).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "지연 응답 완료" }));
    await expectSaved([...createSequence, `POST ${base}/publish`]);
  },
};
/** 실제 저장 오류 Dialog의 action과 원래 next 경로를 확인하는 고정 사례다. */
function saveError(scenario: EditorScenario, title: string, action: string, path?: string, mode: "create" | "edit" = "create"): Story {
  return { args: { scenario, mode }, async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    if (mode === "edit") await canvas.findByDisplayValue(editorProject.title); else await fillEditor(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: mode === "edit" ? "수정 저장" : "등록하기" }));
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole("dialog", { name: title });
    await userEvent.click(within(dialog).getByRole("button", { name: action }));
    if (path) await expect(getRouter().push).toHaveBeenCalledWith(path);
    else await expect(getRouter().push).not.toHaveBeenCalled();
  } };
}
export const Unauthorized = saveError("unauthorized", "로그인이 필요합니다", "로그인하기", "/login?next=%2Fprojects%2Fnew");
export const Unverified = saveError("unverified", "학교 이메일 인증이 필요합니다", "학교 이메일 인증하기", "/verify-email?next=%2Fprojects%2Fnew");
export const ForbiddenEdit = saveError("forbidden", "학교 이메일 인증이 필요합니다", "학교 이메일 인증하기", `/verify-email?next=%2Fprojects%2F${editorProjectId}%2Fedit`, "edit");
export const SaveError = saveError("save-error", "요청을 처리하지 못했습니다", "확인");
export const Retry: Story = {
  args: { scenario: "retry" },
  /** PATCH 실패 뒤 입력과 draft ID를 보존한 채 재시도한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement); await fillEditor(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "등록하기" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "확인" }));
    await expect(canvas.getByLabelText("프로젝트 제목")).toHaveValue("  새 프로젝트  ");
    await userEvent.click(canvas.getByRole("button", { name: "등록하기" }));
    await expectSaved([...createSequence, "GET /api/users/me", `PATCH ${base}`, `POST ${base}/publish`]);
  },
};
export const FilesAllowed: Story = {
  /** 허용 확장자의 실제 multipart file과 파일 제거 UI를 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    for (const extension of ["pdf", "md", "jpg", "jpeg", "png"]) {
      await userEvent.upload(getEditorFileInput(canvasElement), new File(["fixture"], `자료.${extension}`, { type: "" }));
      await waitFor(() => expect(canvas.getByText(`자료.${extension}`)).toBeVisible());
    }
    const requests = getEditorRequests();
    await expect(requests[0].path).toBe("/api/users/me");
    await expect(requests[1].body).toEqual({ title: "새 프로젝트", description: "" });
    const uploads = requests.filter(({ path }) => path.endsWith("/files"));
    await expect(uploads).toHaveLength(5);
    for (const request of uploads) {
      await expect(request.method).toBe("POST");
      await expect(request.contentType).toContain("multipart/form-data; boundary=");
      await expect(request.body).toMatchObject({ fields: ["file"], file: { size: 7 } });
    }
    await expect(requests.filter(({ path }) => path === "/api/projects")).toHaveLength(1);
    await userEvent.click(canvas.getByRole("button", { name: "자료.pdf 제거" }));
    await expect(canvas.queryByText("자료.pdf")).not.toBeInTheDocument();
  },
};
export const FileSizeBoundary: Story = {
  /** 실제 50 MiB File을 multipart로 보내고 1 byte 초과는 요청 전에 거절한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await userEvent.upload(getEditorFileInput(canvasElement), new File([new Uint8Array(maxEditorFileBytes)], "경계.pdf", { type: "application/pdf" }));
    await waitFor(() => expect(canvas.getByText("경계.pdf")).toBeVisible(), { timeout: 20000 });
    await expect(getEditorRequests().at(-1)?.body).toMatchObject({ file: { size: maxEditorFileBytes, name: "경계.pdf" } });
    const count = getEditorRequests().length;
    await userEvent.upload(getEditorFileInput(canvasElement), new File([new Uint8Array(maxEditorFileBytes + 1)], "초과.pdf", { type: "application/pdf" }));
    await expect(canvas.getByText("초과.pdf은 최대 50MB를 초과했습니다.")).toBeVisible();
    await expect(getEditorRequests()).toHaveLength(count);
  },
};
export const UnsupportedFiles: Story = {
  /** accept 필터 우회 가능한 드롭/선택에 대비한 제품 검증을 실제 File 이벤트로 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await userEvent.upload(getEditorFileInput(canvasElement), new File(["text"], "자료.txt", { type: "text/plain" }), { applyAccept: false });
    await expect(canvas.getByText("자료.txt은 지원하지 않는 파일 형식입니다.")).toBeVisible();
    await userEvent.upload(getEditorFileInput(canvasElement, true), new File(["pdf"], "본문.pdf", { type: "application/pdf" }), { applyAccept: false });
    await expect(canvas.getByText("본문에는 JPG 또는 PNG 이미지만 삽입할 수 있습니다.")).toBeVisible();
    await userEvent.upload(getEditorFileInput(canvasElement, true), new File(["gif"], "본문.gif", { type: "image/gif" }), { applyAccept: false });
    await expect(canvas.getByText("본문.gif은 지원하지 않는 파일 형식입니다.")).toBeVisible();
    await expect(getEditorRequests()).toHaveLength(0);
  },
};
export const InlineImageKnownLimitation: Story = {
  parameters: { docs: { description: { story: "legacy ID는 수리 전 이미지 누락 관찰에서 유래한다. 현재는 JPG/JPEG/PNG 업로드 뒤 실제 DOM 이미지와 저장 PATCH.content를 검사한다. PNG는 유효한 96×64 바이트이며 업로드 응답도 같은 바이트를 사용한다. 과거 실패 원문은 보존한다." } } },
  /** 빈 본문에서 세 허용 확장자를 삽입하고 같은 이미지 Markdown의 저장까지 검증한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
    const markdown: string[] = [];
    for (const extension of ["jpg", "jpeg", "png"]) {
      await userEvent.click(editor);
      // Storybook userEvent의 Ctrl+End는 미구현이므로 네이티브 선택 영역을 끝에 둔다.
      // 실제 키보드 Ctrl+End는 별도 Chromium 수동 회귀에서 검증한다.
      editor.ownerDocument.getSelection()?.collapse(editor, editor.childNodes.length);
      await userEvent.click(canvas.getByRole("button", { name: "이미지 삽입" }));
      const file = extension === "png" ? createEditorPngFile() : new File(["image"], `본문.${extension}`, { type: "image/jpeg" });
      await userEvent.upload(getEditorFileInput(canvasElement, true), file);
      const image = await within(editor).findByRole("img", { name: file.name });
      const url = extension === "png" ? editorPngUrl : "/storybook/project-fixture.svg";
      await expect(image).toHaveAttribute("src", url);
      await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0));
      await expect(image).toBeVisible();
      await expect(editor).toHaveFocus();
      markdown.push(`![${file.name}](${url})`);
    }
    const uploads = getEditorRequests().filter(({ path }) => path.endsWith("/files"));
    await expect(uploads).toHaveLength(3);
    await expect(uploads[2].body).toMatchObject({ fields: ["file"], file: { name: "본문.png", type: "image/png", size: createEditorPngFile().size, signature: "89504e470d0a1a0a" } });
    await expect(uploads[2].response).toMatchObject({ data: { fileUrl: editorPngUrl } });
    const priorImages = Array.from(editor.querySelectorAll("img"));
    const priorNames = priorImages.map((image) => image.alt);
    await userEvent.click(editor);
    editor.ownerDocument.getSelection()?.collapse(editor, 1);
    await userEvent.click(canvas.getByRole("button", { name: "이미지 삽입" }));
    await userEvent.upload(getEditorFileInput(canvasElement, true), createEditorPngFile("중간.png"));
    const middleImage = await within(editor).findByRole("img", { name: "중간.png" });
    await expect(middleImage).toHaveAttribute("src", editorPngUrl);
    await waitFor(() => expect((middleImage as HTMLImageElement).naturalWidth).toBe(96));
    await expect(priorImages.every((image, index) => editor.contains(image) && image.alt === priorNames[index])).toBe(true);
    await expect(Array.from(editor.querySelectorAll("img"), (image) => image.alt)).toEqual(["본문.jpg", "중간.png", "본문.jpeg", "본문.png"]);
    markdown.splice(1, 0, `![중간.png](${editorPngUrl})`);
    await expect(canvas.getByText("본문에 이미지를 삽입했습니다.")).toBeVisible();
    await userEvent.type(canvas.getByLabelText("프로젝트 제목"), "삽입 이미지 저장");
    await userEvent.click(canvas.getByRole("button", { name: "임시 저장" }));
    await expectSaved(["GET /api/users/me", "POST /api/projects", `POST ${base}/files`, "GET /api/users/me", `POST ${base}/files`, "GET /api/users/me", `POST ${base}/files`, "GET /api/users/me", `POST ${base}/files`, "GET /api/users/me", `PATCH ${base}`]);
    await expect(getEditorRequests().at(-1)?.body).toMatchObject({ content: markdown.join("") });
  },
};
export const UploadPendingKnownLimitation: Story = {
  args: { scenario: "upload-pending" },
  parameters: { docs: { description: { story: "legacy ID는 수리 전 지연 완료 후 삽입 실패 관찰에서 유래한다. 현재는 업로드 중 disabled와 완료 후 실제 이미지·선택 영역·후속 편집·저장 Markdown을 검사한다." } } },
  /** 지연 응답 중 편집을 차단하고 DOM commit 후 실제 이미지 삽입과 후속 저장을 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
    await userEvent.click(editor);
    await userEvent.type(editor, "기존 본문");
    await userEvent.click(canvas.getByRole("button", { name: "이미지 삽입" }));
    await userEvent.upload(getEditorFileInput(canvasElement, true), createEditorPngFile("대기.png"));
    await waitFor(() => expect(getEditorRequests()).toHaveLength(3));
    await expect(editor).toHaveAttribute("contenteditable", "false");
    for (const name of ["제목 삽입", "굵게", "기울임", "목록 삽입", "링크 삽입", "이미지 삽입", "파일 선택", "등록하기", "임시 저장"]) {
      await expect(canvas.getByRole("button", { name })).toBeDisabled();
    }
    await userEvent.click(canvas.getByRole("button", { name: "지연 응답 완료" }));
    const image = await within(editor).findByRole("img", { name: "대기.png" });
    await expect(image).toHaveAttribute("src", editorPngUrl);
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBe(96));
    await expect(image).toBeVisible();
    await expect(editor).toHaveAttribute("contenteditable", "true");
    await expect(editor).toHaveFocus();
    await expect(editor).toHaveTextContent("기존 본문");
    await expect(editor.contains(editor.ownerDocument.getSelection()?.anchorNode ?? null)).toBe(true);
    await userEvent.keyboard(" 후속 편집");
    await userEvent.type(canvas.getByLabelText("프로젝트 제목"), "지연 이미지 저장");
    await userEvent.click(canvas.getByRole("button", { name: "임시 저장" }));
    await expectSaved(["GET /api/users/me", "POST /api/projects", `POST ${base}/files`, "GET /api/users/me", `PATCH ${base}`]);
    // userEvent는 U+0020을 넣는다. 실제 키 입력의 U+00A0은 별도 Chromium 회귀에서 그대로 검사한다.
    await expect(getEditorRequests().at(-1)?.body).toMatchObject({ content: `기존 본문![대기.png](${editorPngUrl}) 후속 편집` });
  },
};
export const UploadError: Story = {
  args: { scenario: "upload-error" },
  /** 업로드 실패 Dialog 뒤 실제 파일 목록은 비어 있고 저장 버튼이 복구되는지 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await userEvent.upload(getEditorFileInput(canvasElement), new File(["pdf"], "실패.pdf", { type: "application/pdf" }));
    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "요청을 처리하지 못했습니다" });
    await userEvent.click(within(dialog).getByRole("button", { name: "확인" }));
    await expect(canvas.getByText("아직 업로드된 파일이 없습니다.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "등록하기" })).toBeEnabled();
    resetEditorSession("retry");
    const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
    await userEvent.click(editor);
    await userEvent.type(editor, "재시도 본문");
    await userEvent.upload(getEditorFileInput(canvasElement, true), createEditorPngFile("재시도.png"));
    const retryDialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await userEvent.click(within(retryDialog).getByRole("button", { name: "확인" }));
    await expect(within(editor).queryByRole("img")).not.toBeInTheDocument();
    await expect(editor).toHaveTextContent("재시도 본문");
    await userEvent.upload(getEditorFileInput(canvasElement, true), createEditorPngFile("재시도.png"));
    const image = await within(editor).findByRole("img", { name: "재시도.png" });
    await waitFor(() => expect((image as HTMLImageElement).naturalWidth).toBe(96));
    await expect(image).toBeVisible();
    await expect(editor).toHaveTextContent("재시도 본문");
    await expect(getEditorRequests().filter(({ path }) => path.endsWith("/files"))).toHaveLength(2);
  },
};
export const Reset: Story = {
  /** 자동 입력은 고정 사례에만 두고 reset 뒤 입력·파일·요청이 초기화되는지 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement); await fillEditor(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    await expect(canvas.getByLabelText("프로젝트 제목")).toHaveValue("");
    await expect(canvas.getByRole("textbox", { name: "프로젝트 본문" })).toHaveTextContent("");
    await expect(getEditorRequests()).toHaveLength(0);
    await expect(getRouter().push).not.toHaveBeenCalled();
  },
};

