import { apiRequest, type ApiRequestInit } from "@/shared/api"
import { authApiPaths } from "@/shared/config"

import { mapUserApiResponse, type UserApiResponse } from "../model/types"

/**
 * 현재 로그인한 사용자 상태를 조회한다.
 * @param init 서버 컴포넌트에서 쿠키나 cache 옵션을 전달하기 위한 fetch 설정
 * @returns 현재 사용자 정보
 */
export async function getCurrentUser(init?: ApiRequestInit) {
  const response = await apiRequest<UserApiResponse>(authApiPaths.me, init)

  if (!response.data) {
    throw new Error("사용자 정보가 응답에 포함되지 않았습니다.")
  }

  return mapUserApiResponse(response.data)
}
