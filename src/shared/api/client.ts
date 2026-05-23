import { buildApiUrl } from "@/shared/config"

import { resolveMockApiResponse } from "./mock-auth"
import { ApiError, type ApiResponse } from "./types"

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null
}

/**
 * 요청 body가 JSON 직렬화 대상인지 확인한다.
 * @param body API 요청 body
 * @returns plain object 형태의 JSON body 여부
 */
function isJsonBody(body: ApiRequestInit["body"]): body is Record<string, unknown> {
  return !!body && typeof body === "object" && !(body instanceof FormData)
}

/**
 * fetch 응답에서 JSON API 응답을 읽는다.
 * @param response fetch 응답 객체
 * @returns JSON 응답이면 파싱된 API 응답, 아니면 undefined
 */
async function readJsonResponse<TData>(response: Response) {
  const contentType = response.headers.get("content-type")

  if (!contentType?.includes("application/json")) {
    return undefined as ApiResponse<TData> | undefined
  }

  return (await response.json()) as ApiResponse<TData>
}

/**
 * 공통 API 요청을 수행하고 mock mode, credentials, JSON 오류 처리를 적용한다.
 * @param path `/`로 시작하는 API path
 * @param init fetch 요청 옵션과 JSON body
 * @returns 파싱된 API 응답
 */
export async function apiRequest<TData>(
  path: `/${string}`,
  init: ApiRequestInit = {}
) {
  const mockResponse = resolveMockApiResponse<TData>(path, init.method)

  if (mockResponse) {
    return mockResponse
  }

  const headers = new Headers(init.headers)
  const body = isJsonBody(init.body) ? JSON.stringify(init.body) : init.body

  if (isJsonBody(init.body) && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    body,
    credentials: "include",
    headers,
  })
  const apiResponse = await readJsonResponse<TData>(response)

  if (!response.ok || apiResponse?.success === false) {
    throw new ApiError(
      apiResponse?.message ?? "요청을 처리하지 못했습니다.",
      response.status,
      apiResponse
    )
  }

  if (!apiResponse) {
    throw new ApiError("서버 응답 형식이 올바르지 않습니다.", response.status)
  }

  return apiResponse
}
