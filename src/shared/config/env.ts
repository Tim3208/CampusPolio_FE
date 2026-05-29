/**
 * 환경변수 URL 값 끝의 슬래시를 제거해 API path 결합 결과를 일정하게 만든다.
 * @param value 정리할 URL 문자열
 * @returns 끝 슬래시가 제거된 URL 문자열
 */
const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")

export const publicEnv = {
  apiBaseUrl: stripTrailingSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? ""),
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
} as const

/**
 * 실행 환경에 맞는 API 요청 URL을 만든다.
 * @param path `/`로 시작하는 API path
 * @returns 브라우저에서는 same-origin path, 서버에서는 API base URL이 반영된 URL
 */
export function buildApiUrl(path: `/${string}`) {
  if (typeof window !== "undefined") {
    return path
  }

  if (!publicEnv.apiBaseUrl) {
    return path
  }

  return `${publicEnv.apiBaseUrl}${path}`
}
