import { buildApiUrl } from "@/shared/config"

import { ApiError, type ApiResponse } from "./types"

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null
}

function isJsonBody(body: ApiRequestInit["body"]): body is Record<string, unknown> {
  return !!body && typeof body === "object" && !(body instanceof FormData)
}

async function readJsonResponse<TData>(response: Response) {
  const contentType = response.headers.get("content-type")

  if (!contentType?.includes("application/json")) {
    return undefined as ApiResponse<TData> | undefined
  }

  return (await response.json()) as ApiResponse<TData>
}

export async function apiRequest<TData>(
  path: `/${string}`,
  init: ApiRequestInit = {}
) {
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
