import { apiRequest } from "@/shared/api"

import type { ProjectCreatePayload, ProjectDraft } from "../model/types"

const projectsPath = "/api/projects"

/**
 * 새 프로젝트 작성에 사용할 임시 프로젝트를 생성한다.
 * @param payload Draft 생성에 필요한 제목과 설명
 * @returns 생성된 임시 프로젝트 ID
 */
export async function createProjectDraft(payload: ProjectCreatePayload) {
  const response = await apiRequest<ProjectDraft>(projectsPath, {
    body: payload,
    method: "POST",
  })

  if (!response.data) {
    throw new Error("프로젝트 임시 생성 응답이 비어 있습니다.")
  }

  return response.data
}
