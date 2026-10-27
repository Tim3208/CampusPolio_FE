import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, spyOn, userEvent, within } from "storybook/test";
import { ScenarioControls, useScenarioReset } from "../../../../../.storybook/scenario-controls";
import { RichMarkdownEditor, type RichMarkdownEditorHandle } from "./rich-markdown-editor";
import { editorImage, editorMarkdown } from "./rich-markdown-editor.story-fixtures";
import { clearEditorSelection, isEditorDocsEmbed, selectEditorContents } from "./rich-markdown-editor.story-helpers";

type EditorArgs = { initialMarkdown: string; disabled: boolean; imageName: string; imageUrl: string; onChange: (value: string) => void; onImageButtonClick: () => void };

/** 초기 Controls와 실제 Markdown을 안정된 React 상태로 제어하며 명시적 초기화에서만 새 편집기를 만든다. */
function EditorPlayground(args: EditorArgs) {
  const [value, setValue] = useState(args.initialMarkdown);
  const [lastControlValue, setLastControlValue] = useState(args.initialMarkdown);
  // Controls의 외부 변경만 동기화한다. 입력은 아래 local state로 즉시 제어하며 remount하지 않는다.
  if (lastControlValue !== args.initialMarkdown) { setLastControlValue(args.initialMarkdown); setValue(args.initialMarkdown); }
  const ref = useRef<RichMarkdownEditorHandle>(null);
  const { instanceKey, reset } = useScenarioReset();
  /** 실제 편집 DOM에서 전달된 Markdown을 상태와 관찰 출력에 반영한다. */
  function change(value: string) { setValue(value); args.onChange(value); }
  /** 이미지 선택 callback 이후 기존 imperative API로 로컬 이미지를 삽입한다. */
  function insertImage() { args.onImageButtonClick(); ref.current?.insertImage(args.imageName, args.imageUrl); }
  /** 기본 예시와 선택 영역을 복원한다. */
  function resetEditor() { clearEditorSelection(); setValue(args.initialMarkdown); reset(); }
  return <main className="mx-auto max-w-4xl p-4">
    <h1 className="text-xl font-bold">Markdown 편집기</h1>
    <ScenarioControls onReset={resetEditor} />
    <RichMarkdownEditor key={instanceKey} id="standalone-editor" ref={ref} value={value} disabled={args.disabled} onChange={change} onImageButtonClick={insertImage} />
    <h2 className="mt-4 font-bold">onChange Markdown</h2>
    <pre data-testid="markdown-output" className="whitespace-pre-wrap break-all">{value}</pre>
  </main>;
}

const meta = {
  title: "Features/Project/RichMarkdownEditor",
  component: EditorPlayground,
  args: { initialMarkdown: editorMarkdown, disabled: false, imageName: editorImage.name, imageUrl: editorImage.url, onChange: fn(), onImageButtonClick: fn() },
  argTypes: {
    initialMarkdown: { control: "text", description: "초기 Markdown. Controls 변경과 초기화에 적용하며 입력 중에는 아래 onChange 출력을 갱신한다." },
    disabled: { control: "boolean" },
    imageName: { control: "text" }, imageUrl: { control: "text", description: "이미지 버튼 callback이 ref.insertImage에 전달할 로컬 fixture URL" },
    onChange: { control: false }, onImageButtonClick: { control: false },
  },
  parameters: { layout: "fullscreen", docs: { story: { inline: false, height: "650px" }, description: { component: "Docs는 iframe별 초기 상태와 수동 조작을 제공하며 자동 play는 Canvas와 Vitest에서 실행한다. 실제 contenteditable·Selection·document.execCommand를 사용한다. Playground는 자동 조작하지 않는다. 링크만 window.prompt를 사용하며 이미지는 callback→ref.insertImage 경로다. 이미지 업로드/외부 서버 성공을 뜻하지 않는다. disabled는 사용자 입력과 toolbar를 막고 업로드 완료용 ref API는 그대로 유지한다." } } },
  /** 선택·콜백 기록을 스토리마다 정리한다. */
  beforeEach() { clearEditorSelection(); return clearEditorSelection; },
} satisfies Meta<EditorArgs>;
export default meta;
type Story = StoryObj<EditorArgs>;

export const Playground: Story = {};
export const Empty: Story = { args: { initialMarkdown: "" } };
export const Disabled: Story = {
  args: { disabled: true },
  /** disabled 편집기와 모든 toolbar가 사용자 입력을 막는지 확인한다. */
  async play({ canvasElement, args }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
    await expect(editor).toHaveAttribute("contenteditable", "false");
    await expect(editor).toHaveAttribute("aria-disabled", "true");
    for (const name of ["제목 삽입", "굵게", "기울임", "목록 삽입", "링크 삽입", "이미지 삽입"]) await expect(canvas.getByRole("button", { name })).toBeDisabled();
    await expect(args.onImageButtonClick).not.toHaveBeenCalled();
  },
};
export const TypingAndReset: Story = {
  args: { initialMarkdown: "" },
  /** 연속 입력·focus·controlled 출력과 명시적 초기화를 확인한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
    await userEvent.click(editor);
    await userEvent.type(editor, "실제 입력");
    await expect(editor).toHaveFocus();
    await expect(canvas.getByTestId("markdown-output")).toHaveTextContent("실제 입력");
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    await expect(canvas.getByTestId("markdown-output")).toBeEmptyDOMElement();
  },
};
/** 선택한 문자열에 실제 브라우저 서식을 적용하고 DOM과 Markdown을 함께 검사한다. */
function formattingStory(button: string, selector: string, expected: string): Story {
  return { args: { initialMarkdown: "서식" }, async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
    selectEditorContents(editor);
    await userEvent.click(canvas.getByRole("button", { name: button }));
    await expect(editor.querySelector(selector)).toHaveTextContent("서식");
    await expect(canvas.getByTestId("markdown-output")).toHaveTextContent(expected);
  } };
}
export const Heading = formattingStory("제목 삽입", "h2", "## 서식");
export const Bold = formattingStory("굵게", "b,strong", "**서식**");
export const Italic = formattingStory("기울임", "i,em", "_서식_");
export const UnorderedList = formattingStory("목록 삽입", "ul li", "- 서식");
export const LinkPrompt: Story = {
  args: { initialMarkdown: "링크" },
  /** execCommand를 그대로 실행하고 URL prompt의 응답과 취소만 로컬에서 제어한다. */
  async play({ canvasElement }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "프로젝트 본문" });
    const prompt = spyOn(window, "prompt").mockReturnValue("/projects");
    try {
      selectEditorContents(editor);
      await userEvent.click(canvas.getByRole("button", { name: "링크 삽입" }));
      await expect(prompt).toHaveBeenCalledWith("연결할 URL을 입력하세요.");
      await expect(editor.querySelector("a")).toHaveAttribute("href", "/projects");
      await expect(canvas.getByTestId("markdown-output")).toHaveTextContent("[링크](/projects)");
      prompt.mockReturnValue(null);
      selectEditorContents(editor);
      await userEvent.click(canvas.getByRole("button", { name: "링크 삽입" }));
      await expect(canvas.getByTestId("markdown-output")).toHaveTextContent("[링크](/projects)");
    } finally { prompt.mockRestore(); clearEditorSelection(); }
  },
};
export const ImageCallback: Story = {
  args: { initialMarkdown: "" },
  /** 이미지 버튼 callback과 ref 삽입이 실제 img와 Markdown을 만드는지 확인한다. */
  async play({ canvasElement, args }) { if (isEditorDocsEmbed(canvasElement)) return;
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("textbox", { name: "프로젝트 본문" }));
    await userEvent.click(canvas.getByRole("button", { name: "이미지 삽입" }));
    await expect(args.onImageButtonClick).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith(`![${editorImage.name}](${editorImage.url})`);
    await expect(canvas.getByRole("img", { name: editorImage.name })).toHaveAttribute("src", editorImage.url);
    await expect(canvas.getByTestId("markdown-output")).toHaveTextContent(`![${editorImage.name}](${editorImage.url})`);
  },
};

