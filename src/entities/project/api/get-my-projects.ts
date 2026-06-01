import { apiRequest, type ApiRequestInit } from "@/shared/api"

import type { MyProjectsPage, MyProjectsQuery } from "../model/types"

const myProjectsPath = "/api/users/me/projects"

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
  const response = await apiRequest<MyProjectsPage>(
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

  if (!Array.isArray(response.data.content)) {
    throw new Error("프로젝트 목록 응답 형식이 올바르지 않습니다.")
  }

  return response.data
}
