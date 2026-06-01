"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  Bold,
  Heading2,
  ImagePlus,
  Italic,
  LinkIcon,
  List,
} from "lucide-react";

type RichMarkdownEditorProps = {
  id?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onImageButtonClick: () => void;
};

export type RichMarkdownEditorHandle = {
  insertImage: (fileName: string, fileUrl: string) => void;
};

/**
 * HTML에 삽입할 문자열을 안전하게 이스케이프한다.
 * @param value 이스케이프할 원본 문자열
 * @returns HTML 이스케이프된 문자열
 */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Markdown 인라인 문법을 contenteditable용 HTML로 변환한다.
 * @param markdown Markdown 인라인 문자열
 * @returns 렌더링 가능한 HTML 문자열
 */
function renderInlineMarkdown(markdown: string) {
  return escapeHtml(markdown)
    .replace(
      /!\[([^\]]*)]\(([^)]+)\)/g,
      '<img alt="$1" src="$2" class="my-3 max-h-80 max-w-full rounded border border-slate-200 object-contain" />',
    )
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

/**
 * Markdown 블록 문자열을 contenteditable용 HTML로 변환한다.
 * @param markdown Markdown 문자열
 * @returns 렌더링 가능한 HTML 문자열
 */
function markdownToHtml(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let listItems: string[] = [];

  /**
   * 누적된 목록 항목을 HTML 목록으로 비운다.
   */
  function flushList() {
    if (listItems.length === 0) {
      return;
    }

    html.push(`<ul>${listItems.join("")}</ul>`);
    listItems = [];
  }

  for (const line of lines) {
    if (line.startsWith("- ")) {
      listItems.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    flushList();

    if (line.startsWith("## ")) {
      html.push(`<h2>${renderInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (!line.trim()) {
      html.push("<p><br /></p>");
      continue;
    }

    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  flushList();

  return html.join("");
}

/**
 * Markdown 저장 전에 과도한 공백을 정리한다.
 * @param markdown 정리할 Markdown 문자열
 * @returns 저장 가능한 Markdown 문자열
 */
function normalizeMarkdown(markdown: string) {
  return markdown.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * DOM 노드를 Markdown 문자열로 직렬화한다.
 * @param node 직렬화할 DOM 노드
 * @returns Markdown 문자열
 */
function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  const childMarkdown = Array.from(node.childNodes).map(nodeToMarkdown).join("");
  const tagName = node.tagName.toLowerCase();

  if (tagName === "strong" || tagName === "b") {
    return `**${childMarkdown}**`;
  }

  if (tagName === "em" || tagName === "i") {
    return `_${childMarkdown}_`;
  }

  if (tagName === "a") {
    return `[${childMarkdown}](${node.getAttribute("href") ?? ""})`;
  }

  if (tagName === "img") {
    return `![${node.getAttribute("alt") ?? ""}](${node.getAttribute("src") ?? ""})`;
  }

  if (tagName === "li") {
    return `- ${childMarkdown.trim()}`;
  }

  if (tagName === "ul") {
    return `${Array.from(node.children).map(nodeToMarkdown).join("\n")}\n\n`;
  }

  if (tagName === "h2") {
    return `## ${childMarkdown.trim()}\n\n`;
  }

  if (tagName === "div" || tagName === "p") {
    return `${childMarkdown.trim()}\n\n`;
  }

  return childMarkdown;
}

/**
 * contenteditable HTML을 Markdown 문자열로 변환한다.
 * @param element 편집기 루트 요소
 * @returns Markdown 문자열
 */
function editorToMarkdown(element: HTMLElement) {
  return normalizeMarkdown(
    Array.from(element.childNodes).map(nodeToMarkdown).join(""),
  );
}

/**
 * 브라우저 selection을 지정한 range로 복원한다.
 * @param range 복원할 range
 */
function restoreSelection(range: Range | null) {
  if (!range) {
    return;
  }

  const selection = window.getSelection();

  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * 워드 문서처럼 보이는 간단한 Markdown 편집기를 렌더링한다.
 * @param props Markdown 값과 변경 핸들러
 * @returns contenteditable 기반 Markdown 편집기
 */
export const RichMarkdownEditor = forwardRef<
  RichMarkdownEditorHandle,
  RichMarkdownEditorProps
>(function RichMarkdownEditor(
  { disabled = false, id, onChange, onImageButtonClick, value },
  ref,
) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastSelectionRef = useRef<Range | null>(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor || document.activeElement === editor) {
      return;
    }

    if (editorToMarkdown(editor) !== normalizeMarkdown(value)) {
      editor.innerHTML = markdownToHtml(value);
    }
  }, [value]);

  /**
   * 현재 편집기 selection을 저장한다.
   */
  function saveSelection() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      lastSelectionRef.current = range.cloneRange();
    }
  }

  /**
   * 편집기 DOM을 Markdown 상태로 반영한다.
   */
  function commitEditorChange() {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    saveSelection();
    onChange(editorToMarkdown(editor));
  }

  /**
   * contenteditable 명령을 실행하고 Markdown 상태를 갱신한다.
   * @param command document.execCommand 명령
   * @param value 명령에 전달할 값
   */
  function runCommand(command: string, value?: string) {
    if (disabled) {
      return;
    }

    editorRef.current?.focus();
    restoreSelection(lastSelectionRef.current);
    document.execCommand(command, false, value);
    commitEditorChange();
  }

  /**
   * 현재 선택 영역을 h2 또는 일반 문단으로 전환한다.
   */
  function toggleHeading() {
    const selection = window.getSelection();
    const anchor = selection?.anchorNode;
    const element =
      anchor instanceof HTMLElement ? anchor : anchor?.parentElement ?? null;
    const heading = element?.closest("h2");

    runCommand("formatBlock", heading ? "p" : "h2");
  }

  /**
   * 링크 URL을 입력받아 선택 영역에 링크를 적용한다.
   */
  function createLink() {
    const url = window.prompt("연결할 URL을 입력하세요.");

    if (!url) {
      return;
    }

    runCommand("createLink", url);
  }

  /**
   * 이미지 선택 전 현재 커서 위치를 저장한다.
   */
  function handleImageButtonClick() {
    saveSelection();
    onImageButtonClick();
  }

  /**
   * 외부에서 업로드한 이미지 URL을 현재 커서 위치에 삽입한다.
   * @param fileName 이미지 파일 이름
   * @param fileUrl 이미지 URL
   */
  function insertImage(fileName: string, fileUrl: string) {
    editorRef.current?.focus();
    restoreSelection(lastSelectionRef.current);
    document.execCommand("insertImage", false, fileUrl);

    const images = editorRef.current?.querySelectorAll(`img[src="${fileUrl}"]`);
    const image = images?.[images.length - 1];

    image?.setAttribute("alt", fileName);
    image?.classList.add(
      "my-3",
      "max-h-80",
      "max-w-full",
      "rounded",
      "border",
      "border-slate-200",
      "object-contain",
    );
    commitEditorChange();
  }

  useImperativeHandle(ref, () => ({ insertImage }));

  return (
    <div className="mt-3">
      <div className="mb-3 flex flex-wrap items-center gap-1 rounded-md bg-slate-100 p-1">
        <button
          type="button"
          title="제목"
          onClick={toggleHeading}
          className="inline-flex size-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-main-10 disabled:opacity-40"
          disabled={disabled}
        >
          <Heading2 className="size-4" aria-hidden="true" />
          <span className="sr-only">제목 삽입</span>
        </button>
        <button
          type="button"
          title="굵게"
          onClick={() => runCommand("bold")}
          className="inline-flex size-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-main-10 disabled:opacity-40"
          disabled={disabled}
        >
          <Bold className="size-4" aria-hidden="true" />
          <span className="sr-only">굵게</span>
        </button>
        <button
          type="button"
          title="기울임"
          onClick={() => runCommand("italic")}
          className="inline-flex size-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-main-10 disabled:opacity-40"
          disabled={disabled}
        >
          <Italic className="size-4" aria-hidden="true" />
          <span className="sr-only">기울임</span>
        </button>
        <button
          type="button"
          title="목록"
          onClick={() => runCommand("insertUnorderedList")}
          className="inline-flex size-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-main-10 disabled:opacity-40"
          disabled={disabled}
        >
          <List className="size-4" aria-hidden="true" />
          <span className="sr-only">목록 삽입</span>
        </button>
        <button
          type="button"
          title="링크"
          onClick={createLink}
          className="inline-flex size-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-main-10 disabled:opacity-40"
          disabled={disabled}
        >
          <LinkIcon className="size-4" aria-hidden="true" />
          <span className="sr-only">링크 삽입</span>
        </button>
        <button
          type="button"
          title="이미지"
          onClick={handleImageButtonClick}
          className="inline-flex size-8 items-center justify-center rounded text-slate-600 hover:bg-white hover:text-main-10 disabled:opacity-40"
          disabled={disabled}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          <span className="sr-only">이미지 삽입</span>
        </button>
      </div>

      <div
        id={id}
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={commitEditorChange}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onBlur={commitEditorChange}
        className="min-h-72 w-full overflow-y-auto border border-slate-400 bg-white px-4 py-4 text-base leading-8 text-slate-950 outline-none transition empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] focus:border-main-10 focus:ring-2 focus:ring-main-20 [&_a]:font-semibold [&_a]:text-main-10 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-extrabold [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
        data-placeholder="프로젝트 소개를 작성하세요. 굵게, 제목, 목록 버튼을 사용할 수 있습니다."
      />
    </div>
  );
});
