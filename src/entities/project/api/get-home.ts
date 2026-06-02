import { apiRequest, type ApiRequestInit } from "@/shared/api"

import type { HomeData } from "../model/types"

/**
 * 메인 페이지에 표시할 인기 프로젝트와 카테고리별 프로젝트를 조회한다.
 * @param init 서버 컴포넌트에서 cache, headers 옵션을 전달하기 위한 fetch 설정
 * @returns 메인 페이지 프로젝트 데이터
 */
export async function getHome(
  init: Pick<ApiRequestInit, "cache" | "headers"> = {}
) {
  const response = await apiRequest<HomeData>("/api/home", {
    ...init,
    cache: "no-store",
    method: "GET",
  })

  if (!response.data) {
    throw new Error("메인 페이지 응답이 비어 있습니다.")
  }

  return response.data
}
