import { apiRequest, ApiError, type ApiRequestInit } from "@/shared/api"

import type {
  MyPortfolio,
  MyPortfolioApiItem,
  MyPortfoliosApiPage,
  MyPortfoliosPage,
  MyPortfoliosQuery,
  PortfolioDetail,
  PortfolioDetailApiResponse,
  PortfolioDetailProject,
  PortfolioDetailProjectApiItem,
} from "../model/types"

const myPortfoliosPath = "/api/users/me/portfolios"

type MyPortfoliosResponse = MyPortfoliosApiPage | MyPortfolioApiItem[]

/**
 * 내 포트폴리오 목록 API 항목을 카드 UI에서 사용하는 형태로 정규화한다.
 * @param portfolio API에서 받은 포트폴리오 항목
 * @returns 설명과 썸네일 기본값이 보정된 포트폴리오 항목
 */
function normalizeMyPortfolio(portfolio: MyPortfolioApiItem): MyPortfolio {
  return {
    createdAt: portfolio.createdAt,
    description: portfolio.description ?? "",
    isPublic: portfolio.isPublic,
    portfolioId: portfolio.portfolioId,
    projectCount: portfolio.projectCount,
    slug: portfolio.slug,
    thumbnailUrl: portfolio.thumbnailUrl ?? null,
    title: portfolio.title,
    updatedAt: portfolio.updatedAt,
  }
}

/**
 * 배열 목록 응답을 페이지 UI에서 사용하는 페이지 객체로 변환한다.
 * @param portfolios API에서 받은 포트폴리오 배열
 * @param page 현재 페이지
 * @param size 페이지 크기
 * @returns 목록 페이지 객체
 */
function createPortfoliosPage(
  portfolios: MyPortfolioApiItem[],
  page: number,
  size: number
): MyPortfoliosPage {
  return {
    content: portfolios.map(normalizeMyPortfolio),
    page,
    size,
    totalElements: portfolios.length,
    totalPages: portfolios.length === 0 ? 0 : 1,
  }
}

/**
 * 포트폴리오 상세 프로젝트 항목을 표시용 모델로 정규화한다.
 * @param project API에서 받은 포트폴리오 상세 프로젝트 항목
 * @returns 상세 화면 프로젝트 항목
 */
function normalizePortfolioDetailProject(
  project: PortfolioDetailProjectApiItem
): PortfolioDetailProject {
  return {
    description: project.description ?? "",
    displayOrder: project.displayOrder,
    projectId: project.projectId,
    thumbnailUrl: project.thumbnailUrl ?? null,
    title: project.title,
  }
}

/**
 * 포트폴리오 상세 API 응답을 상세 화면 모델로 정규화한다.
 * @param portfolio API에서 받은 포트폴리오 상세 응답
 * @returns 포트폴리오 상세 모델
 */
function normalizePortfolioDetail(
  portfolio: PortfolioDetailApiResponse
): PortfolioDetail {
  return {
    description: portfolio.description ?? "",
    isPublic: portfolio.isPublic,
    portfolioId: portfolio.portfolioId,
    projects: (portfolio.projects ?? [])
      .map(normalizePortfolioDetailProject)
      .sort((a, b) => a.displayOrder - b.displayOrder),
    slug: portfolio.slug,
    thumbnailUrl: portfolio.thumbnailUrl ?? null,
    title: portfolio.title,
  }
}

/**
 * 현재 로그인한 사용자의 포트폴리오 목록을 조회한다.
 * @param query 페이지와 공개 상태 필터
 * @param init 서버 컴포넌트에서 쿠키나 cache 옵션을 전달하기 위한 fetch 설정
 * @returns 내 포트폴리오 목록 페이지
 */
export async function getMyPortfolios(
  query: MyPortfoliosQuery = {},
  init: Pick<ApiRequestInit, "cache" | "headers"> = {}
) {
  const { page = 0, size = 8 } = query
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  if (typeof query.isPublic === "boolean") {
    params.set("isPublic", String(query.isPublic))
  }

  const response = await apiRequest<MyPortfoliosResponse>(
    `${myPortfoliosPath}?${params.toString()}` as `/${string}`,
    {
      ...init,
      cache: "no-store",
      method: "GET",
    }
  )

  if (!response.data) {
    throw new Error("포트폴리오 목록 응답이 비어 있습니다.")
  }

  if (Array.isArray(response.data)) {
    return createPortfoliosPage(response.data, page, size)
  }

  if (!Array.isArray(response.data.content)) {
    throw new Error("포트폴리오 목록 응답 형식이 올바르지 않습니다.")
  }

  return {
    ...response.data,
    content: response.data.content.map(normalizeMyPortfolio),
  }
}

/**
 * slug로 포트폴리오 상세 정보를 조회한다.
 * @param slug 조회할 포트폴리오 slug
 * @param init 서버 컴포넌트에서 쿠키나 cache 옵션을 전달하기 위한 fetch 설정
 * @returns 포트폴리오 상세 정보
 */
export async function getPortfolioBySlug(
  slug: string,
  init: Pick<ApiRequestInit, "cache" | "headers"> = {}
) {
  const response = await apiRequest<PortfolioDetailApiResponse>(
    `/api/portfolios/${encodeURIComponent(slug)}` as `/${string}`,
    {
      ...init,
      cache: "no-store",
      method: "GET",
    }
  )

  if (response.success === false) {
    throw new ApiError(
      response.message ?? "포트폴리오 상세 정보를 불러오지 못했습니다.",
      404,
      response
    )
  }

  if (!response.data) {
    throw new Error("포트폴리오 상세 응답이 비어 있습니다.")
  }

  return normalizePortfolioDetail(response.data)
}
