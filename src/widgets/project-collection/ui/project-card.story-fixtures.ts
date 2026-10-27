import type { ProjectSearchItem } from "@/entities/project";

export const searchProject = {
  projectId: 9301,
  title: "캠퍼스 공유 작업실",
  description: "학생들이 함께 만든 가상 작업실 프로젝트의 고정 설명입니다.",
  thumbnailUrl: "/storybook/project-fixture.svg",
  tags: ["공학", "시각 디자인"],
  users: [{ userId: 93001, name: "가상 탐색팀", role: "OWNER" }],
  viewCount: 4321,
  likeCount: 87,
  isLiked: false,
} satisfies ProjectSearchItem;

export const searchCardFixtures = {
  normal: searchProject,
  noDescription: { ...searchProject, description: "" },
  noUsers: { ...searchProject, users: [] },
  noTags: { ...searchProject, tags: [] },
  manyTags: { ...searchProject, tags: ["공학", "시각 디자인", "환경", "음악", "컴퓨터", "교육", "건축", "사진", "영상", "협업", "연구", "공동 제작"] },
  longContent: { ...searchProject, title: "캠퍼스의 공유 자원을 연결하는 참여형 작업실과 학생 협업 프로젝트 ".repeat(5), tags: ["아주긴태그이름이여러번이어지는가상프로젝트분류".repeat(8), "공학", "협업"] },
  missingThumbnail: { ...searchProject, thumbnailUrl: null },
  failedThumbnail: { ...searchProject, thumbnailUrl: "/storybook/missing-search-thumbnail.svg" },
} satisfies Record<string, ProjectSearchItem>;
