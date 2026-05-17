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

function getMockUser() {
  return mockUsers[mockConfig.authState]
}

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
