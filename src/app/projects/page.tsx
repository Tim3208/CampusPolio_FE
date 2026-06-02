import {
  searchProjects,
  type ProjectSearchFilterType,
  type ProjectSearchPage,
  type ProjectSearchQuery,
} from "@/entities/project"
import { ProjectCollectionPage } from "@/widgets/project-collection"

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const projectPageSize = 6

export const dynamic = "force-dynamic"

/**
 * URL query에서 첫 번째 문자열 값을 꺼낸다.
 * @param value searchParams 값
 * @returns 첫 번째 문자열 값
 */
function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

/**
 * URL query에서 문자열 배열 값을 꺼낸다.
 * @param value searchParams 값
 * @returns 문자열 배열 값
 */
function getArrayParam(value: string | string[] | undefined) {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

/**
 * URL query의 페이지 값을 0 이상의 정수로 변환한다.
 * @param value page query 값
 * @returns API 요청에 사용할 0 기반 페이지
 */
function getPageParam(value: string | string[] | undefined) {
  const parsedPage = Number(getFirstParam(value))

  if (!Number.isFinite(parsedPage) || parsedPage < 0) {
    return 0
  }

  return Math.floor(parsedPage)
}

/**
 * URL query의 정렬 값을 프로젝트 검색 API 값으로 보정한다.
 * @param value filterType query 값
 * @returns 프로젝트 검색 정렬 값
 */
function getFilterTypeParam(
  value: string | string[] | undefined
): ProjectSearchFilterType {
  const filterType = getFirstParam(value)

  return filterType === "VIEW_COUNT" ? "VIEW_COUNT" : "LATEST"
}

/**
 * 프로젝트 모음 페이지 URL query를 검색 API query로 변환한다.
 * @param params URL searchParams
 * @returns 프로젝트 검색 조건
 */
function getProjectSearchQuery(
  params: Record<string, string | string[] | undefined>
): ProjectSearchQuery {
  const keyword = getFirstParam(params.keyword)?.trim()
  const tags = getArrayParam(params.tags)
    .map((tag) => tag.trim())
    .filter(Boolean)

  return {
    filterType: getFilterTypeParam(params.filterType),
    keyword,
    page: getPageParam(params.page),
    size: projectPageSize,
    tags,
  }
}

/**
 * 빈 프로젝트 검색 페이지를 만든다.
 * @param query 현재 검색 조건
 * @returns 빈 검색 결과 페이지
 */
function createEmptyProjectsPage(query: ProjectSearchQuery): ProjectSearchPage {
  return {
    content: [],
    page: query.page ?? 0,
    size: query.size ?? projectPageSize,
    totalElements: 0,
    totalPages: 0,
  }
}

/**
 * 전체 프로젝트 모음 페이지를 렌더링한다.
 * @param props Next.js 라우트 props
 * @returns 프로젝트 모음 페이지 UI
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const query = getProjectSearchQuery(params)
  let projectsPage: ProjectSearchPage = createEmptyProjectsPage(query)
  let errorMessage: string | undefined

  try {
    projectsPage = await searchProjects(query, { cache: "no-store" })
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "프로젝트 목록을 불러오지 못했습니다."
  }

  return (
    <ProjectCollectionPage
      errorMessage={errorMessage}
      projectsPage={projectsPage}
      query={query}
    />
  )
}
