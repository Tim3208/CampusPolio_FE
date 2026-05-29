import { buildApiUrl } from "@/shared/config"

import { resolveMockApiResponse } from "./mock-auth"
import { ApiError, type ApiResponse } from "./types"

export type ApiRequestInit = Omit<RequestInit, "body"> & {
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
 * 값이 일반 객체 형태인지 확인한다.
 * @param value 검사할 값
 * @returns 일반 객체 여부
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

/**
 * JSON payload가 기존 API wrapper 형식인지 확인한다.
 * @param payload API JSON payload
 * @returns success 필드를 가진 API wrapper 여부
 */
function hasApiSuccessField<TData>(
  payload: unknown
): payload is ApiResponse<TData> {
  return isRecord(payload) && typeof payload.success === "boolean"
}

/**
 * success 필드가 없는 raw JSON 응답을 공통 API 응답 형태로 정규화한다.
 * @param payload fetch에서 파싱한 JSON payload
 * @returns 공통 API 응답 형식
 */
function normalizeApiResponse<TData>(
  payload: unknown
): ApiResponse<TData> | undefined {
  if (payload === undefined) {
    return undefined
  }

  if (hasApiSuccessField<TData>(payload)) {
    return payload
  }

  const message =
    isRecord(payload) && typeof payload.message === "string"
      ? payload.message
      : undefined

  return {
    success: true,
    data: payload as TData,
    message,
  }
}

/**
 * fetch 응답에서 JSON payload를 읽는다.
 * @param response fetch 응답 객체
 * @returns JSON 응답이면 파싱된 payload, 아니면 undefined
 */
async function readJsonPayload(response: Response) {
  const contentType = response.headers.get("content-type")

  if (!contentType?.includes("application/json")) {
    return undefined
  }

  return (await response.json()) as unknown
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
  const mockResponse = resolveMockApiResponse<TData>(
    path,
    init.method,
    init.body
  )

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
  const apiResponse = normalizeApiResponse<TData>(await readJsonPayload(response))

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
