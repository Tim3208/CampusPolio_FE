import { apiRequest } from "@/shared/api"

import type { ProjectFileUpload } from "../model/types"

/**
 * 프로젝트 본문 또는 첨부 파일을 업로드한다.
 * @param projectId 파일을 연결할 프로젝트 ID
 * @param file 업로드할 파일
 * @returns 업로드된 파일 ID와 공개 파일 URL
 */
export async function requestProjectFileUpload(
  projectId: number,
  file: File
) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await apiRequest<ProjectFileUpload>(
    `/api/projects/${projectId}/files` as `/${string}`,
    {
      body: formData,
      method: "POST",
    }
  )

  if (!response.data) {
    throw new Error("파일 업로드 URL 응답이 비어 있습니다.")
  }

  return response.data
}
