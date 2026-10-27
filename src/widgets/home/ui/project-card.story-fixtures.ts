import type { HomeProject } from "@/entities/project";

export const homeProject = {
  projectId: 9201,
  title: "캠퍼스 식물 관찰 기록",
  thumbnailUrl: "/storybook/project-fixture.svg",
  tag: "공학",
  authorName: "가상 제작팀",
  viewCount: 1234,
  likeCount: 56,
} satisfies HomeProject;

export const homeCardFixtures = {
  normal: homeProject,
  longContent: { ...homeProject, title: "서로 다른 캠퍼스의 식물을 기록하고 함께 돌보는 학생 참여형 관찰 프로젝트 ".repeat(5), authorName: "실제 인물이 아닌 아주 긴 가상 프로젝트 공동 제작팀 이름 ".repeat(5) },
  missingAuthor: { ...homeProject, authorName: "" },
  missingThumbnail: { ...homeProject, thumbnailUrl: null },
  failedThumbnail: { ...homeProject, thumbnailUrl: "/storybook/missing-home-thumbnail.svg" },
  largeCounts: { ...homeProject, viewCount: 9876543210, likeCount: 1234567890 },
} satisfies Record<string, HomeProject>;
