import { apiRequest } from "@/shared/api"

import type { ProjectDetail } from "../model/types"

/**
 * 프로젝트 상세 정보를 조회한다.
 * @param projectId 조회할 프로젝트 ID
 * @returns 프로젝트 상세 정보
 */
export async function getProject(projectId: number) {
  const response = await apiRequest<ProjectDetail>(
    `/api/projects/${projectId}` as `/${string}`,
    {
      cache: "no-store",
      method: "GET",
    }
  )

  if (!response.data) {
    throw new Error("프로젝트 상세 응답이 비어 있습니다.")
  }

  return response.data
}
