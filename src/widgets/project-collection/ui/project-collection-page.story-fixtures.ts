import type { ProjectSearchPage, ProjectSearchQuery } from "@/entities/project";
import { searchProject } from "./project-card.story-fixtures";

// 날짜 필드가 없는 검색 도메인이다. 외부 API 대신 고정된 가상 검색 결과만 전달한다.
export const collectionProjects = Array.from(
  { length: 9 },
  /** 가상 결과마다 상세 경로와 제목을 구분한다. */
  (_, index) => ({
    ...searchProject,
    projectId: 9401 + index,
    title: `캠퍼스 탐색 프로젝트 ${index + 1}`,
  }),
);

export const firstGridPage = {
  content: collectionProjects.slice(0, 6),
  page: 0,
  size: 6,
  totalElements: 30,
  totalPages: 5,
} satisfies ProjectSearchPage;

export const firstListPage = {
  content: collectionProjects,
  page: 0,
  size: 9,
  totalElements: 45,
  totalPages: 5,
} satisfies ProjectSearchPage;

export const emptyPage = {
  content: [],
  page: 0,
  size: 9,
  totalElements: 0,
  totalPages: 0,
} satisfies ProjectSearchPage;

export const filteredQuery = {
  keyword: "story book",
  tags: ["공학", "시각 디자인"],
  page: 2,
  size: 9,
  filterType: "VIEW_COUNT",
} satisfies ProjectSearchQuery;

export const filteredPage = {
  ...firstListPage,
  page: 2,
} satisfies ProjectSearchPage;

// 제품 URL 생성 함수를 기대값으로 재호출하지 않는 고정 wire 기대값이다.
export const collectionHrefs = {
  filtered: "/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&filterType=VIEW_COUNT&view=list",
  next: "/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&page=3&filterType=VIEW_COUNT&view=list",
  previous: "/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&page=1&filterType=VIEW_COUNT&view=list",
  grid: "/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&filterType=VIEW_COUNT",
  keywordRemoved: "/projects?tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&filterType=VIEW_COUNT&view=list",
  engineeringRemoved: "/projects?keyword=story+book&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&filterType=VIEW_COUNT&view=list",
  latest: "/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&view=list",
  architectureAdded: "/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&tags=%EA%B1%B4%EC%B6%95%ED%95%99&filterType=VIEW_COUNT&view=list",
  tagsCleared: "/projects?keyword=story+book&filterType=VIEW_COUNT&view=list",
} as const;
