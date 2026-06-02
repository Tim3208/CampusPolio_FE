import { apiRequest, type ApiRequestInit } from "@/shared/api"

import type {
  MyProject,
  MyProjectApiItem,
  MyProjectsPage,
  MyProjectsQuery,
} from "../model/types"

const myProjectsPath = "/api/users/me/projects"

type MyProjectsResponse = MyProjectsPage | MyProjectApiItem[]

/**
 * 내 프로젝트 목록 API 항목을 카드 UI에서 사용하는 형태로 정규화한다.
 * @param project API에서 받은 프로젝트 항목
 * @returns thumbnailUrl과 tags 기본값이 보정된 프로젝트 항목
 */
function normalizeMyProject(project: MyProjectApiItem): MyProject {
  return {
    projectId: project.projectId,
    role: project.role,
    status: project.status,
    tags: Array.isArray(project.tags) ? project.tags : [],
    thumbnailUrl: project.thumbnailUrl ?? project.thumbnail ?? null,
    title: project.title,
    updatedAt: project.updatedAt,
  }
}

/**
 * 배열 목록 응답을 페이지 UI에서 사용하는 페이지 객체로 변환한다.
 * @param projects API에서 받은 프로젝트 배열
 * @param page 현재 페이지
 * @param size 페이지 크기
 * @returns 목록 페이지 객체
 */
function createProjectsPage(
  projects: MyProjectApiItem[],
  page: number,
  size: number
): MyProjectsPage {
  return {
    content: projects.map(normalizeMyProject),
    page,
    size,
    totalElements: projects.length,
    totalPages: projects.length === 0 ? 0 : 1,
  }
}

/**
 * 현재 로그인한 사용자의 프로젝트 목록을 조회한다.
 * @param query 페이지와 공개 상태 필터
 * @param init 서버 컴포넌트에서 쿠키나 cache 옵션을 전달하기 위한 fetch 설정
 * @returns 내 프로젝트 목록 페이지
 */
export async function getMyProjects(
  query: MyProjectsQuery = {},
  init: Pick<ApiRequestInit, "cache" | "headers"> = {}
) {
  const { page = 0, size = 9, status = "ALL" } = query
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    status,
  })
  const response = await apiRequest<MyProjectsResponse>(
    `${myProjectsPath}?${params.toString()}` as `/${string}`,
    {
      ...init,
      cache: "no-store",
      method: "GET",
    }
  )

  if (!response.data) {
    throw new Error("프로젝트 목록 응답이 비어 있습니다.")
  }

  if (Array.isArray(response.data)) {
    return createProjectsPage(response.data, page, size)
  }

  if (!Array.isArray(response.data.content)) {
    throw new Error("프로젝트 목록 응답 형식이 올바르지 않습니다.")
  }

  return {
    ...response.data,
    content: response.data.content.map(normalizeMyProject),
  }
}
