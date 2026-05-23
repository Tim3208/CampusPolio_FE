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
 * 공개 API base URL과 API path를 결합한다.
 * @param path `/`로 시작하는 API path
 * @returns API base URL이 있으면 절대 URL, 없으면 입력 path
 */
export function buildApiUrl(path: `/${string}`) {
  if (!publicEnv.apiBaseUrl) {
    return path
  }

  return `${publicEnv.apiBaseUrl}${path}`
}
