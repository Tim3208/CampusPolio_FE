import { fireEvent } from "storybook/test";

/** 실제 부모 Docs iframe에서만 자동 play를 멈춰 다른 사례의 키보드 focus를 빼앗지 않는다. */
export function isEditorDocsEmbed(canvasElement: HTMLElement) {
  const view = canvasElement.ownerDocument.defaultView;
  if (!view || view.parent === view) return false;
  try { return new URL(view.parent.location.href).searchParams.get("viewMode") === "docs"; }
  catch { return false; }
}

/** 실제 Chromium Selection으로 편집기 전체 텍스트를 선택하고 제품의 선택 저장 이벤트를 실행한다. */
export function selectEditorContents(editor: HTMLElement) {
  editor.focus();
  const range = editor.ownerDocument.createRange();
  range.selectNodeContents(editor);
  const selection = editor.ownerDocument.defaultView?.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
  fireEvent.mouseUp(editor);
}

/** 스토리 종료 후 선택 영역을 비워 다음 편집기에 이전 Range를 전달하지 않는다. */
export function clearEditorSelection() {
  window.getSelection()?.removeAllRanges();
}

