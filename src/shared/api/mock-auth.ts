import { authApiPaths, mockConfig, type AuthMockState } from "@/shared/config"

import type { ApiResponse } from "./types"

type MockUser = {
  id: number
  email: string
  isDomainValid: boolean
  isVerified: boolean
}

const mockUsers: Record<AuthMockState, MockUser> = {
  unverified: {
    id: 1,
    email: "user@syu.ac.kr",
    isDomainValid: true,
    isVerified: false,
  },
  verified: {
    id: 1,
    email: "user@syu.ac.kr",
    isDomainValid: true,
    isVerified: true,
  },
  "invalid-domain": {
    id: 1,
    email: "user@gmail.com",
    isDomainValid: false,
    isVerified: false,
  },
}

/**
 * 현재 mock 인증 상태에 맞는 사용자 fixture를 반환한다.
 * @returns mock 인증 상태에 대응하는 사용자 정보
 */
function getMockUser() {
  return mockUsers[mockConfig.authState]
}

/**
 * mock mode에서 인증 관련 API 응답을 네트워크 요청 없이 반환한다.
 * @param path 요청 API path
 * @param method 요청 HTTP method
 * @returns 처리 가능한 mock API 응답. mock 대상이 아니면 undefined
 */
export function resolveMockApiResponse<TData>(
  path: `/${string}`,
  method = "GET"
): ApiResponse<TData> | undefined {
  if (!mockConfig.useMockApi) {
    return undefined
  }

  const normalizedMethod = method.toUpperCase()

  if (path === authApiPaths.login && normalizedMethod === "POST") {
    return {
      success: true,
      data: getMockUser() as TData,
    }
  }

  if (path === authApiPaths.me && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockUser() as TData,
    }
  }

  if (path === authApiPaths.logout && normalizedMethod === "POST") {
    return {
      success: true,
      message: "로그아웃 완료",
    }
  }

  return undefined
}
