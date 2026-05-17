export const appRoutes = {
  home: "/",
  login: "/login",
  verifyEmail: "/verify-email",
} as const

export const queryParams = {
  next: "next",
} as const

/**
 * 로그인 이후 이동할 next 경로가 앱 내부 경로인지 검증한다.
 * @param value URL query에서 받은 next 값
 * @param fallback next 값이 없거나 안전하지 않을 때 사용할 경로
 * @returns 앱 내부 경로 또는 fallback 경로
 */
export function getSafeNextPath(
  value: string | null | undefined,
  fallback = appRoutes.home
) {
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
