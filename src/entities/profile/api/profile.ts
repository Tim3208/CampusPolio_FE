import { apiRequest, ApiError, type ApiRequestInit } from "@/shared/api"

import type {
  ProfileApiResponse,
  ProfileCreatePayload,
  ProfileCreateResponse,
  ProfileUpdatePayload,
  ProfileUpdateResponse,
} from "../model/types"
import { mapProfileApiResponse } from "../model/types"

const profilePath = "/api/profile"

/**
 * 현재 로그인한 사용자의 프로필을 조회한다.
 * @param init 서버 컴포넌트에서 쿠키나 cache 옵션을 전달하기 위한 fetch 설정
 * @returns 정규화된 프로필 정보
 */
export async function getMyProfile(
  init: Pick<ApiRequestInit, "cache" | "headers"> = {}
) {
  const response = await apiRequest<ProfileApiResponse>(profilePath, {
    ...init,
    cache: "no-store",
    method: "GET",
  })

  if (response.success === false) {
    throw new ApiError(
      response.message ?? "프로필 정보를 불러오지 못했습니다.",
      404,
      response
    )
  }

  if (!response.data) {
    throw new Error("프로필 응답이 비어 있습니다.")
  }

  return mapProfileApiResponse(response.data)
}

/**
 * 현재 로그인한 사용자의 프로필을 생성한다.
 * @param payload 프로필 생성 요청 값
 * @returns 생성된 프로필 ID와 서버 메시지
 */
export async function createProfile(payload: ProfileCreatePayload) {
  const response = await apiRequest<ProfileCreateResponse>(profilePath, {
    body: payload,
    method: "POST",
  })

  if (response.success === false) {
    throw new ApiError(
      response.message ?? "프로필을 생성하지 못했습니다.",
      400,
      response
    )
  }

  if (!response.data) {
    throw new Error("프로필 생성 응답이 비어 있습니다.")
  }

  return response.data
}

/**
 * 현재 로그인한 사용자의 프로필을 수정한다.
 * @param payload 프로필 수정 요청 값
 * @returns 프로필 수정 결과
 */
export async function updateProfile(payload: ProfileUpdatePayload) {
  const response = await apiRequest<ProfileUpdateResponse>(profilePath, {
    body: payload,
    method: "PATCH",
  })

  if (response.success === false) {
    throw new ApiError(
      response.message ?? "프로필을 수정하지 못했습니다.",
      400,
      response
    )
  }

  if (!response.data) {
    throw new Error("프로필 수정 응답이 비어 있습니다.")
  }

  return response.data
}
