import type { ProjectDetail, ProjectReview } from "@/entities/project";

export const detailImage = "/storybook/project-fixture.svg";
export const missingDetailImage = "/storybook/dev05-missing-image.svg";
export const detailProject = {
  projectId: 4205,
  title: "캠퍼스 프로젝트 아카이브",
  description: "학생들의 프로젝트와 배움을 함께 기록하는 가상 프로젝트입니다.",
  content: "## 프로젝트 소개\n\n프로젝트의 목표와 구현 결과를 소개합니다.\n\n### 구현 내용\n\n- 프로젝트 탐색\n- 자료 공유\n\n[프로젝트 모음](/projects)",
  thumbnailUrl: detailImage,
  tags: ["웹", "디자인"],
  users: [{ userId: 51, name: "가상 작성자", role: "OWNER" }, { userId: 52, name: "가상 참여자", role: "MEMBER" }],
  files: [{ fileId: 601, originalName: "프로젝트 설명.md", fileUrl: "/storybook/project-fixture.svg" }],
  viewCount: 1234, likeCount: 28, isLiked: true,
  createdAt: "2026-10-26T09:00:00+09:00",
} satisfies ProjectDetail;

export const emptyDetailProject: ProjectDetail = {
  ...detailProject, description: "", content: "", thumbnailUrl: null, tags: [], users: [], files: [],
};
export const longDetailProject: ProjectDetail = {
  ...detailProject,
  title: "캠퍼스의 다양한 프로젝트를 연결하는 학생 협업 아카이브의 설계와 구현 ".repeat(5),
  files: [{ fileId: 602, originalName: "캠퍼스프로젝트_최종설계_상세구현_검증결과_".repeat(12) + ".md", fileUrl: "/storybook/project-fixture.svg" }],
  content: "## 긴 콘텐츠\n\n| 항목 | 세부 설명 | 결과 |\n| --- | --- | --- |\n| " + "연속된표내용".repeat(55) + " | 검증 | 완료 |\n\n\`\`\`ts\nconst result = \"" + "긴코드문자열".repeat(70) + "\";\n\`\`\`",
};
export const failedImageProject: ProjectDetail = {
  ...detailProject, thumbnailUrl: missingDetailImage,
  content: "## 본문 이미지\n\n![본문 자료](" + missingDetailImage + ")",
};
export const detailReview = {
  totalScore: 88, summary: "구조와 책임이 명확한 프로젝트입니다.",
  categories: [{ category: "구조", score: 90, comment: "도메인별 책임이 분리되어 있습니다." }],
  criticalIssues: [], warnings: [], strengths: [{ title: "명확한 구조", description: "각 기능의 역할이 분명합니다." }],
  interviewQuestions: ["책임을 나눈 이유는 무엇인가요?"],
  refactoringSuggestions: [{ title: "중복 정리", description: "공통 계산을 함수로 추출합니다.", exampleCode: "const total = sum(values);" }],
} satisfies ProjectReview;
export const emptyDetailReview: ProjectReview = {
  totalScore: 0, summary: "", categories: [], criticalIssues: [], warnings: [], strengths: [], interviewQuestions: [], refactoringSuggestions: [],
};

