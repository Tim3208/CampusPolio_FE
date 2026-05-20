import { apiRequest } from "@/shared/api"
import { authApiPaths } from "@/shared/config"

import type { User } from "@/entities/user"

/**
 * Google ID 토큰으로 로그인하고 현재 사용자 정보를 가져온다.
 * @param idToken Google Identity Services에서 받은 ID 토큰
 */
export async function loginWithGoogle(idToken: string) {
  const response = await apiRequest<User>(authApiPaths.login, {
    method: "POST",
    body: { idToken },
  })

  if (!response.data) {
    throw new Error("로그인 응답에 사용자 정보가 포함되지 않았습니다.")
  }

  return response.data
}
