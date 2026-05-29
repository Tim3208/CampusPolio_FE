import { authApiPaths, mockConfig, type AuthMockState } from "@/shared/config"

import type { ApiResponse } from "./types"

type MockUser = {
  id: number
  email: string
  isDomainValid: boolean
  isVerified: boolean
}

type MockProject = {
  projectId: number
  title: string
  thumbnailUrl: string | null
  tags: string[]
  updatedAt: string
  status: "PUBLISHED" | "DRAFT"
}

type MockProjectsPage = {
  content: MockProject[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

const mockUsers: Record<AuthMockState, MockUser> = {
  unverified: {
    id: 1,
    email: "user@syu.ac.kr",
    isDomainValid: true,
    isVerified: false,
  },
  verified: {
    id: 1,
    email: "user@syu.ac.kr",
    isDomainValid: true,
    isVerified: true,
  },
  "invalid-domain": {
    id: 1,
    email: "user@gmail.com",
    isDomainValid: false,
    isVerified: false,
  },
}

const mockProjects: MockProject[] = [
  {
    projectId: 1,
    title: "미래 지능형 건축",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
    tags: ["AI", "ARCH"],
    updatedAt: "2026-05-29T10:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 2,
    title: "언어 모델 최적화",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    tags: ["NLP", "ML"],
    updatedAt: "2026-05-28T09:30:00+09:00",
    status: "DRAFT",
  },
  {
    projectId: 3,
    title: "바이오 데이터 가공",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1200&auto=format&fit=crop",
    tags: ["BIO", "DATA"],
    updatedAt: "2026-05-26T12:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 4,
    title: "스마트 시티 설계",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
    tags: ["URBAN", "IOT"],
    updatedAt: "2026-05-22T15:20:00+09:00",
    status: "PUBLISHED",
  },
]

/**
 * 현재 mock 인증 상태에 맞는 사용자 fixture를 반환한다.
 * @returns mock 인증 상태에 대응하는 사용자 정보
 */
function getMockUser() {
  return mockUsers[mockConfig.authState]
}

/**
 * API path와 query를 mock 처리용 URL 객체로 변환한다.
 * @param path 요청 API path
 * @returns query를 포함한 mock URL 객체
 */
function createMockUrl(path: `/${string}`) {
  return new URL(path, "https://campus-polio.local")
}

/**
 * 숫자 query 값을 안전하게 파싱한다.
 * @param value query string 값
 * @param fallback 파싱 실패 시 사용할 값
 * @returns 0 이상 숫자 query 값
 */
function getNonNegativeQueryNumber(value: string | null, fallback: number) {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback
  }

  return Math.floor(parsed)
}

/**
 * mock 프로젝트 목록을 page, size, status query 기준으로 잘라 반환한다.
 * @param url 프로젝트 목록 요청 URL
 * @returns mock 프로젝트 목록 페이지
 */
function getMockProjectsPage(url: URL): MockProjectsPage {
  const page = getNonNegativeQueryNumber(url.searchParams.get("page"), 0)
  const size = getNonNegativeQueryNumber(url.searchParams.get("size"), 9)
  const status = url.searchParams.get("status") ?? "ALL"
  const filteredProjects =
    status === "ALL"
      ? mockProjects
      : mockProjects.filter((project) => project.status === status)
  const startIndex = page * size
  const content = filteredProjects.slice(startIndex, startIndex + size)

  return {
    content,
    page,
    size,
    totalElements: filteredProjects.length,
    totalPages: size === 0 ? 0 : Math.ceil(filteredProjects.length / size),
  }
}

/**
 * mock mode에서 지원하는 API 응답을 네트워크 요청 없이 반환한다.
 * @param path 요청 API path
 * @param method 요청 HTTP method
 * @returns 처리 가능한 mock API 응답. mock 대상이 아니면 undefined
 */
export function resolveMockApiResponse<TData>(
  path: `/${string}`,
  method = "GET"
): ApiResponse<TData> | undefined {
  if (!mockConfig.useMockApi) {
    return undefined
  }

  const normalizedMethod = method.toUpperCase()
  const url = createMockUrl(path)

  if (url.pathname === authApiPaths.login && normalizedMethod === "POST") {
    return {
      success: true,
      data: getMockUser() as TData,
    }
  }

  if (url.pathname === authApiPaths.me && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockUser() as TData,
    }
  }

  if (url.pathname === authApiPaths.logout && normalizedMethod === "POST") {
    return {
      success: true,
      message: "로그아웃 완료",
    }
  }

  if (url.pathname === "/api/users/me/projects" && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockProjectsPage(url) as TData,
    }
  }

  return undefined
}
