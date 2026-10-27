export const sheetDescription = "실제 Radix Sheet의 열기, 닫기와 포커스 이동을 확인하는 가상 안내입니다.";
export const longSheetParagraphs = Array.from({ length: 18 }, createParagraph);
/** 스크롤 확인을 위한 개인정보 없는 긴 본문을 만든다. */
function createParagraph(_: unknown, index: number) {
  return `${index + 1}. 캠퍼스 프로젝트의 관찰 기록과 협업 결과를 정리합니다. 긴 본문도 시트 내부에서 스크롤하며 마지막 내용을 확인할 수 있습니다.`;
}

