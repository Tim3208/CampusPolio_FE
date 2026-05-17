export const appRoutes = {
  home: "/",
  login: "/login",
  verifyEmail: "/verify-email",
} as const

export const queryParams = {
  next: "next",
} as const

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
