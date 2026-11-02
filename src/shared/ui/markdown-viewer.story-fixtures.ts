export const basicMarkdown = [
  "# 캠퍼스 프로젝트 기록",
  "## 관찰과 협업",
  "- 식물을 관찰합니다.",
  "- 기록을 공유합니다.",
  "1. 자료 수집",
  "2. 결과 정리",
  "- [x] 고정 fixture 작성",
  "> 실제 사용자 정보가 없는 예시 문서입니다.",
].join("\n\n");

export const longMarkdown = [
  basicMarkdown,
  "## 긴 링크",
  "[https://example.invalid/" + "campus-project-record-".repeat(18) + "](https://example.invalid/project)",
  "## 넓은 표",
  "| 프로젝트 이름 | 관찰 장소 | 참여 팀 | 측정 날짜 | 자료 경로 | 진행 상태 | 다음 확인 |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  "| 길게 이어지는 프로젝트 이름 | 캠퍼스 공동 작업실과 식물 관찰 정원 | 가상의 학생 공동 제작팀 | 2026-10-23 | 자료를 정리하는 아주 긴 경로 | 관찰 기록 정리 중 | 다음 주 정기 확인 예정 |",
  "## 긴 코드",
  "~~~ts",
  'const fixedProjectDescription = "' + "campusProject_".repeat(35) + '";',
  "~~~",
].join("\n\n").replace(/\|\n\n\|/g, "|\n|");

export const normalImageMarkdown = "## 정상 로컬 이미지\n\n![가상 프로젝트 이미지](/storybook/project-fixture.svg)";
export const failedImageMarkdown = "## 실패 이미지\n\n![실패한 프로젝트 이미지](/storybook/missing-markdown-image.svg)";
