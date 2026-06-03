import { apiRequest, type ApiRequestInit } from "@/shared/api"

import type {
  ProjectSearchApiItem,
  ProjectSearchApiPage,
  ProjectSearchItem,
  ProjectSearchPage,
  ProjectSearchQuery,
} from "../model/types"

const projectsSearchPath = "/api/projects"

/**
 * 프로젝트 검색 API 응답 항목을 화면에서 안전하게 사용할 수 있는 형태로 보정한다.
 * @param project API에서 받은 프로젝트 검색 항목
 * @returns 기본값이 채워진 프로젝트 검색 항목
 */
function normalizeProjectSearchItem(
  project: ProjectSearchApiItem
): ProjectSearchItem {
  return {
    projectId: project.projectId,
    title: project.title,
    description: project.description ?? "",
    thumbnailUrl: project.thumbnailUrl ?? null,
    tags: Array.isArray(project.tags) ? project.tags : [],
    users: Array.isArray(project.users) ? project.users : [],
    viewCount: project.viewCount ?? 0,
    likeCount: project.likeCount ?? 0,
    isLiked: project.isLiked ?? false,
  }
}

/**
 * 프로젝트 검색 조건을 API query string으로 변환한다.
 * @param query 프로젝트 검색 조건
 * @returns API 요청에 사용할 query string
 */
function createProjectSearchParams(query: ProjectSearchQuery) {
  const params = new URLSearchParams()
  const { filterType = "LATEST", keyword, page = 0, size = 9, tags = [] } = query

  if (keyword?.trim()) {
    params.set("keyword", keyword.trim())
  }

  tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => params.append("tags", tag))

  params.set("page", String(page))
  params.set("size", String(size))
  params.set("filterType", filterType)

  return params
}

/**
 * 전체 공개 프로젝트 목록을 검색한다.
 * @param query 검색어, 태그, 페이지, 정렬 조건
 * @param init 서버 컴포넌트에서 cache, headers 옵션을 전달하기 위한 fetch 설정
 * @returns 프로젝트 검색 결과 페이지
 */
export async function searchProjects(
  query: ProjectSearchQuery = {},
  init: Pick<ApiRequestInit, "cache" | "headers"> = {}
): Promise<ProjectSearchPage> {
  const { page = 0, size = 9 } = query
  const params = createProjectSearchParams(query)
  const response = await apiRequest<ProjectSearchApiPage>(
    `${projectsSearchPath}?${params.toString()}` as `/${string}`,
    {
      ...init,
      cache: "no-store",
      method: "GET",
    }
  )

  if (!response.data) {
    throw new Error("프로젝트 검색 응답이 비어 있습니다.")
  }

  const content = Array.isArray(response.data.content)
    ? response.data.content
    : []

  return {
    content: content.map(normalizeProjectSearchItem),
    page: response.data.page ?? page,
    size: response.data.size ?? size,
    totalElements: response.data.totalElements ?? content.length,
    totalPages:
      response.data.totalPages ??
      (content.length === 0 ? 0 : Math.ceil(content.length / size)),
  }
}
