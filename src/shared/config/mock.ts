const authMockStates = ["unverified", "verified", "invalid-domain"] as const

export type AuthMockState = (typeof authMockStates)[number]

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
