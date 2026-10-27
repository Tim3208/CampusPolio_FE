import type { ProjectDetail } from "@/entities/project";
import type { UserApiResponse } from "@/entities/user";

export const editorProjectId = 4808;
export const editorProject = {
  projectId: editorProjectId, title: "캠퍼스 기록", description: "프로젝트 설명", content: "기존 프로젝트 본문",
  thumbnailUrl: null, tags: ["AI"], users: [{ userId: 808, name: "예시 학생", role: "OWNER" }],
  files: [], viewCount: 12, likeCount: 3, isLiked: false, createdAt: "2026-10-26T09:00:00+09:00",
} satisfies ProjectDetail;
export const editorUser = { id: 808, email: "storybook@example.ac.kr", universityVerified: true } satisfies UserApiResponse;
export const editorScenarios = ["success", "load-pending", "load-error", "save-pending", "upload-pending", "unauthorized", "unverified", "forbidden", "save-error", "upload-error", "retry"] as const;
export type EditorScenario = (typeof editorScenarios)[number];
export const maxEditorFileBytes = 50 * 1024 * 1024;

export const editorPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAGAAAABACAIAAABqVuVZAAAAhUlEQVR4nO3QQQ2AMBRAsSlBC44naA4QQRDB4b9Dkyrouu6dcp43ZY2PCBIkSFDI+IggQYIEhQgSJEiQIEGCBAmKGB8RJEiQoBBBggQJEiRIkCBBEeMjggQJEhQiSJAgQYIECRIkKGJ8RJAgQYJCBAkSJEiQIEGCBEWMjwgSJEhQiCBB/3wdlsKkdo+V5QAAAABJRU5ErkJggg==";
export const editorPngUrl = `data:image/png;base64,${editorPngBase64}`;

/** 실제 디코딩 가능한 96×64 PNG 바이트로 원래 파일 선택 UI의 입력을 만든다. */
export function createEditorPngFile(name = "본문.png") {
  return new File([Uint8Array.from(atob(editorPngBase64), (character) => character.charCodeAt(0))], name, { type: "image/png" });
}

// 실제 error 검사 stories-error-01/02의 기존 제품 대비 위반. 전역 rule/error 설정은 유지한다.
// loading/error 화면은 해당 요소가 없어 예외에 넣지 않는다. 이미지 한계 두 상태의 동일 요소도 포함한다.
export const editorA11yLimitations: Record<string, string> = {
  "features-project-projecteditorform--playground": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--edit-loaded": "업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--publish": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--draft": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--private-save": "업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--edit-save": "업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--validation": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--tags-boundary": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--saving": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--unauthorized": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--unverified": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--forbidden-edit": "업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--save-error": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--retry": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--files-allowed": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--file-size-boundary": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--unsupported-files": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--inline-image-known-limitation": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--upload-pending-known-limitation": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--upload-error": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
  "features-project-projecteditorform--reset": "업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 < 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분.",
};

