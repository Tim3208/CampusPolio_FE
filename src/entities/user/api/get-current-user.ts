import { apiRequest } from "@/shared/api"
import { authApiPaths } from "@/shared/config"

import type { User } from "../model/types"

/**
 * 현재 로그인한 사용자 상태를 조회한다.
 * @returns 현재 사용자 정보
 */
export async function getCurrentUser() {
  const response = await apiRequest<User>(authApiPaths.me)

  if (!response.data) {
    throw new Error("사용자 정보가 응답에 포함되지 않았습니다.")
  }

  return response.data
}
