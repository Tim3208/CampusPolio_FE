import type { ProjectSearchQuery } from "@/entities/project";
import { appRoutes } from "@/shared/config";

export type ProjectCollectionViewMode = "grid" | "list";
export const projectFilterTags = [
  "시각 디자인",
  "건축학",
  "신학",
  "공학",
  "인문학",
  "졸업작품",
  "논문",
  "디자인",
  "역사",
] as const;

/** 검색 조건을 기본값 생략과 반복 태그 규칙에 맞는 화면 URL로 변환한다. */
export function getProjectsHref(
  query: ProjectSearchQuery,
  viewMode: ProjectCollectionViewMode = "grid",
) {
  const params = new URLSearchParams();
  if (query.keyword?.trim()) params.set("keyword", query.keyword.trim());
  query.tags
    ?.map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => params.append("tags", tag));
  if (query.page && query.page > 0) params.set("page", String(query.page));
  if (query.filterType && query.filterType !== "LATEST")
    params.set("filterType", query.filterType);
  if (viewMode === "list") params.set("view", viewMode);
  const search = params.toString();
  return search ? appRoutes.projects + "?" + search : appRoutes.projects;
}

/** 적용 또는 편집 중인 목록에서 선택 태그를 추가하거나 제거한다. */
export function toggleTag(tags: string[] = [], tag: string) {
  return tags.includes(tag)
    ? tags.filter((current) => current !== tag)
    : [...tags, tag];
}
