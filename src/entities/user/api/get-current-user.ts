import { apiRequest } from "@/shared/api"
import { authApiPaths } from "@/shared/config"

import type { User } from "../model/types"

export async function getCurrentUser() {
  const response = await apiRequest<User>(authApiPaths.me)

  if (!response.data) {
    throw new Error("사용자 정보가 응답에 포함되지 않았습니다.")
  }

  return response.data
}
