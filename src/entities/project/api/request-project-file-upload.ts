import { apiRequest } from "@/shared/api"

import type {
  ProjectFileUpload,
  ProjectFileUploadPayload,
} from "../model/types"

/**
 * 프로젝트 본문 또는 첨부 파일 업로드용 presigned URL을 요청한다.
 * @param projectId 파일을 연결할 프로젝트 ID
 * @param payload 업로드할 파일 이름과 MIME 타입
 * @returns 업로드 URL과 공개 파일 URL
 */
export async function requestProjectFileUpload(
  projectId: number,
  payload: ProjectFileUploadPayload
) {
  const response = await apiRequest<ProjectFileUpload>(
    `/api/projects/${projectId}/files` as `/${string}`,
    {
      body: payload,
      method: "POST",
    }
  )

  if (!response.data) {
    throw new Error("파일 업로드 URL 응답이 비어 있습니다.")
  }

  return response.data
}
