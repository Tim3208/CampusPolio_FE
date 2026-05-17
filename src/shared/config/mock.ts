const authMockStates = ["unverified", "verified", "invalid-domain"] as const

export type AuthMockState = (typeof authMockStates)[number]

/**
 * 환경변수로 받은 mock 인증 상태를 허용된 상태 값으로 정규화한다.
 * @param value `NEXT_PUBLIC_MOCK_AUTH_STATE` 환경변수 값
 * @returns 유효한 mock 인증 상태. 잘못된 값이면 `unverified`
 */
function getAuthMockState(value: string | undefined): AuthMockState {
  if (authMockStates.some((state) => state === value)) {
    return value as AuthMockState
  }

  return "unverified"
}

export const mockConfig = {
  useMockApi: process.env.NEXT_PUBLIC_USE_MOCK_API === "true",
  authState: getAuthMockState(process.env.NEXT_PUBLIC_MOCK_AUTH_STATE),
} as const
