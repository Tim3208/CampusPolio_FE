const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export const publicEnv = {
  apiBaseUrl: stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? ""),
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
} as const

export function buildApiUrl(path: `/${string}`) {
  if (!publicEnv.apiBaseUrl) {
    return path
  }

  return `${publicEnv.apiBaseUrl}${path}`
}
