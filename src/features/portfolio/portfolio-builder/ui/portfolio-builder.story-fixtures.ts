import type { MyProject, MyProjectsPage } from "@/entities/project";
import type {
  PortfolioCreateResult, PortfolioOrderUpdateResult, PortfolioProjectUpdateResult,
  PortfolioUpdateResult, PortfolioVisibilityUpdateResult,
} from "@/entities/portfolio";

export const fixtureDate = "2026-10-26T09:00:00+09:00";
export const fixtureImage = "/storybook/project-fixture.svg";
export const builderProjects = [
  { projectId: 9101, title: "캠퍼스 기록", description: "이미지가 없는 첫 프로젝트", thumbnailUrl: null, tags: ["기록", "React"], updatedAt: fixtureDate, status: "PUBLISHED" },
  { projectId: 9102, title: "도서관 지도", description: "도서관 공간을 탐색하는 지도", thumbnailUrl: fixtureImage, tags: ["지도", "TypeScript"], updatedAt: fixtureDate, status: "PUBLISHED" },
  { projectId: 9103, title: "연구 노트", description: "", thumbnailUrl: null, tags: [], updatedAt: fixtureDate, status: "DRAFT" },
] satisfies MyProject[];
export const projectsPage: MyProjectsPage = { content: builderProjects, page: 0, size: 8, totalElements: 3, totalPages: 1 };
export const emptyProjectsPage: MyProjectsPage = { content: [], page: 0, size: 8, totalElements: 0, totalPages: 0 };
export const longProjectsPage: MyProjectsPage = {
  ...projectsPage,
  content: [{ ...builderProjects[0], title: "긴 프로젝트 제목과 한 학기 동안 진행한 캠퍼스 연구 기록 ".repeat(4), description: "연구 과정과 결과를 설명하는 긴 문장 ".repeat(30), tags: ["긴태그이름을가진캠퍼스연구프로젝트", "React"] }, ...builderProjects.slice(1)],
};
export const createResult = { portfolioId: 9201, slug: "storybook-campus-portfolio" } satisfies PortfolioCreateResult;
export const updateResult = { portfolioId: 9201, updatedAt: fixtureDate, message: "포트폴리오 수정 완료" } satisfies PortfolioUpdateResult;
export const projectsResult = { message: "포트폴리오 프로젝트 수정 완료" } satisfies PortfolioProjectUpdateResult;
export const orderResult = { message: "프로젝트 순서 변경 완료" } satisfies PortfolioOrderUpdateResult;
export const visibilityResult = { portfolioId: 9201, isPublic: false, message: "포트폴리오 공개 상태 변경 완료" } satisfies PortfolioVisibilityUpdateResult;

export const saveSteps = ["create", "info", "projects", "order", "visibility"] as const;
export type SaveStep = (typeof saveSteps)[number];
export type SaveScenario = "success" | "pending" | "retry" | SaveStep;
export const saveScenarios: SaveScenario[] = ["success", "pending", "retry", ...saveSteps];
export type ListScenario = "normal" | "empty" | "error" | "long";

// DEV-09 stories-error-02의 실제 Chromium axe 결과. 아래 상태는 동작 통과와 별개인 a11y 미완료다.
const baseA11y = "color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 < 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖.";
const selectedA11y = `${baseA11y} 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다.`;
export const builderA11yLimitations: Record<string, string> = {
  "features-portfolio-portfoliobuilder--playground": baseA11y,
  "features-portfolio-portfoliobuilder--empty": baseA11y,
  "features-portfolio-portfoliobuilder--load-error": baseA11y,
  "features-portfolio-portfoliobuilder--long-content": baseA11y,
  "features-portfolio-portfoliobuilder--selection-and-preview": baseA11y,
  "features-portfolio-portfoliobuilder--validation-boundaries": baseA11y,
  "features-portfolio-portfoliobuilder--minimal-save": baseA11y,
  "features-portfolio-portfoliobuilder--saving": baseA11y,
  "features-portfolio-portfoliobuilder--retry-success": baseA11y,
  "features-portfolio-portfoliobuilder--file-preview-and-reset": baseA11y,
  "features-portfolio-portfoliobuilder--single-project-save": selectedA11y,
  "features-portfolio-portfoliobuilder--ordered-save": selectedA11y,
  "features-portfolio-portfoliobuilder--create-failure": selectedA11y,
  "features-portfolio-portfoliobuilder--info-failure": selectedA11y,
  "features-portfolio-portfoliobuilder--projects-failure": selectedA11y,
  "features-portfolio-portfoliobuilder--order-failure": selectedA11y,
  "features-portfolio-portfoliobuilder--visibility-failure": selectedA11y,
  "features-portfolio-portfoliobuilder--preview-open": `${selectedA11y} 미리보기 프로젝트 순번 text-slate-200 대비 위반. dialog 역할/focus trap/Escape/복귀는 제품에 없는 수동 확인 한계.`,
};
