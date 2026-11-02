import type { ProjectSearchItem } from "@/entities/project";
import { searchProject } from "./project-card.story-fixtures";

export const listItemFixtures = {
  normal: searchProject,
  noDescription: { ...searchProject, description: "" },
  noAuthor: { ...searchProject, users: [] },
  noTags: { ...searchProject, tags: [] },
  noImage: { ...searchProject, thumbnailUrl: null },
  failedImage: { ...searchProject, thumbnailUrl: "/storybook/dev04-missing-list-image.svg" },
  emptyOptional: { ...searchProject, description: "", users: [], tags: [], thumbnailUrl: null },
  longContent: {
    ...searchProject,
    title: "캠퍼스의 공유 자원을 함께 연결하는 학생 협업 연구와 디자인 프로젝트 ".repeat(5),
    tags: ["매우긴가상프로젝트분류이름".repeat(12), "공학", "공동 제작", "연구"],
    users: [{ userId: 94001, name: "아주 긴 가상 작성자 이름 ".repeat(8), role: "OWNER" }],
  },
} satisfies Record<string, ProjectSearchItem>;
