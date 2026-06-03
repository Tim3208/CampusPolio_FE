import { apiRequest } from "@/shared/api"
import { authApiPaths } from "@/shared/config"

import { mapUserApiResponse, type UserApiResponse } from "@/entities/user"

/**
 * Google ID token으로 로그인 요청을 보내고 사용자 정보를 반환한다.
 * @param idToken Google Identity Services에서 받은 ID token
 * @returns 로그인 응답에 포함된 사용자 정보
 */
export async function loginWithGoogle(idToken: string) {
  const response = await apiRequest<UserApiResponse>(authApiPaths.login, {
    method: "POST",
    body: { idToken },
  })

  if (!response.data) {
    throw new Error("로그인 응답에 사용자 정보가 포함되지 않았습니다.")
  }

  return mapUserApiResponse(response.data)
}
