import { apiRequest } from "@/shared/api"

import type { ProjectDraft } from "../model/types"

const projectsPath = "/api/projects"

/**
 * 새 프로젝트 작성에 사용할 임시 프로젝트를 생성한다.
 * @returns 생성된 임시 프로젝트 ID와 상태
 */
export async function createProjectDraft() {
  const response = await apiRequest<ProjectDraft>(projectsPath, {
    method: "POST",
  })

  if (!response.data) {
    throw new Error("프로젝트 임시 생성 응답이 비어 있습니다.")
  }

  return response.data
}
