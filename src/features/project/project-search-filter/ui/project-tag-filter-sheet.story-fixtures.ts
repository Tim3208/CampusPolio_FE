import type { ProjectSearchQuery } from "@/entities/project";

export const listFilterQuery = {
  keyword: "  story book  ",
  tags: ["공학"],
  page: 3,
  size: 9,
  filterType: "VIEW_COUNT",
} satisfies ProjectSearchQuery;

export const gridFilterQuery = {
  keyword: "  ",
  tags: ["건축학"],
  page: 2,
  size: 6,
  filterType: "LATEST",
} satisfies ProjectSearchQuery;

// 제품 URL 생성 함수를 재사용하지 않는 독립된 기대값이다.
export const expectedListFilterHref =
  "/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&filterType=VIEW_COUNT&view=list";
export const expectedGridFilterHref =
  "/projects?tags=%EA%B1%B4%EC%B6%95%ED%95%99&tags=%EA%B3%B5%ED%95%99";
