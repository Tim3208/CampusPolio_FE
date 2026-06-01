import { apiRequest } from "@/shared/api"

import type {
  ProjectPublishPayload,
  ProjectPublishResult,
} from "../model/types"

/**
 * 임시 저장된 프로젝트를 공개 등록한다.
 * @param projectId 등록할 프로젝트 ID
 * @param payload 등록 시 반영할 제목, 본문, 태그
 * @returns 등록 처리 결과
 */
export async function publishProject(
  projectId: number,
  payload: ProjectPublishPayload
) {
  const response = await apiRequest<ProjectPublishResult>(
    `/api/projects/${projectId}/publish` as `/${string}`,
    {
      body: payload,
      method: "POST",
    }
  )

  return response
}
