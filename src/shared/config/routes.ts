export const appRoutes = {
  home: "/",
  login: "/login",
  mypage: "/mypage",
  mypageProjects: "/mypage/projects",
  mypagePortfolios: "/mypage/portfolios",
  mypageSettings: "/mypage/settings",
  mypageSupport: "/mypage/support",
  verifyEmail: "/verify-email",
  projectDetail: (projectId: number | string) => `/projects/${projectId}`,
} as const

export const queryParams = {
  next: "next",
} as const

const schoolVerificationRequiredPathPrefixes: readonly `/${string}`[] = []

/**
 * 로그인 이후 이동할 next 경로가 앱 내부 경로인지 검증한다.
 * @param value URL query에서 받은 next 값
 * @param fallback next 값이 없거나 안전하지 않을 때 사용할 경로
 * @returns 앱 내부 경로 또는 fallback 경로
 */
export function getSafeNextPath(
  value: string | null | undefined,
  fallback: string = appRoutes.home
): string {
  const candidate = value?.trim()

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback
  }

  try {
    const url = new URL(candidate, "https://campus-polio.local")

    if (url.origin !== "https://campus-polio.local") {
      return fallback
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}

/**
 * 학교 이메일 인증이 필요한 내부 경로인지 확인한다.
 * @param path 검사할 앱 내부 경로
 * @returns 학교 이메일 인증이 필요한 경로 여부
 */
export function requiresSchoolVerification(path: string) {
  const candidate = getSafeNextPath(path, "")

  if (!candidate) {
    return false
  }

  const url = new URL(candidate, "https://campus-polio.local")

  return schoolVerificationRequiredPathPrefixes.some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
  )
}
