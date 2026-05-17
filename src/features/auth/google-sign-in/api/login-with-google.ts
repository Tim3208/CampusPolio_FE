import { apiRequest } from "@/shared/api"
import { authApiPaths } from "@/shared/config"

import type { User } from "@/entities/user"

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
