import { apiRequest } from "@/shared/api"

import type {
  ProjectUpdatePayload,
  ProjectUpdateResult,
} from "../model/types"

/**
 * 프로젝트 상세 내용을 저장하거나 수정한다.
 * @param projectId 저장할 프로젝트 ID
 * @param payload 제목, 본문, 썸네일, 태그 등 수정 내용
 * @returns 저장 처리 결과
 */
export async function updateProject(
  projectId: number,
  payload: ProjectUpdatePayload
) {
  const response = await apiRequest<ProjectUpdateResult>(
    `/api/projects/${projectId}` as `/${string}`,
    {
      body: payload,
      method: "PATCH",
    }
  )

  if (!response.data) {
    throw new Error("프로젝트 저장 응답이 비어 있습니다.")
  }

  return response.data
}
