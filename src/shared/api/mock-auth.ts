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
  description: string
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

type MockProjectSearchItem = {
  projectId: number
  title: string
  description: string
  thumbnailUrl: string | null
  tags: string[]
  users: Array<{
    userId: number
    name: string
  }>
  viewCount: number
  likeCount: number
  isLiked: boolean
}

type MockProjectSearchPage = {
  content: MockProjectSearchItem[]
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
    title: "공간의 경험을 재해석한 전시 디자인",
    description:
      "캠퍼스 전시 공간의 동선을 재구성하고 관람자 경험을 개선한 전시 디자인 프로젝트입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
    tags: ["시각 디자인", "전시", "공간디자인"],
    updatedAt: "2026-05-25T10:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 2,
    title: "지속가능한 제품을 위한 브랜드 아이덴티티",
    description:
      "재활용 소재 기반 제품군을 위한 브랜드 시스템과 패키지 디자인을 구축했습니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
    tags: ["시각 디자인", "브랜딩", "그래픽"],
    updatedAt: "2026-04-12T09:30:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 3,
    title: "사용자 경험 개선을 위한 앱 UI/UX 리디자인",
    description:
      "학내 커뮤니티 앱의 정보 구조와 주요 화면 흐름을 재설계한 UI/UX 프로젝트입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1200&auto=format&fit=crop",
    tags: ["시각 디자인", "UIUX", "모바일"],
    updatedAt: "2026-03-20T14:00:00+09:00",
    status: "DRAFT",
  },
  {
    projectId: 4,
    title: "지역 커뮤니티를 위한 공공시설 제안",
    description:
      "지역 주민의 문화 활동과 휴식을 지원하는 공공시설 콘셉트 제안입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
    tags: ["건축학", "공공디자인"],
    updatedAt: "2026-02-08T16:20:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 5,
    title: "타이포그래피를 활용한 포스터 시리즈",
    description:
      "학과 전시 홍보를 위한 타이포그래피 중심 포스터 시스템입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    tags: ["시각 디자인", "타이포그래피", "포스터"],
    updatedAt: "2026-01-22T11:45:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 6,
    title: "캠퍼스 길찾기 인터랙션 프로토타입",
    description:
      "신입생을 위한 캠퍼스 길찾기 인터랙션과 정보 표시 체계를 설계했습니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop",
    tags: ["공학", "서비스디자인", "프로토타입"],
    updatedAt: "2025-12-18T13:10:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 7,
    title: "데이터 시각화를 활용한 학습 리포트",
    description:
      "학습 데이터를 분석해 개인별 학습 패턴을 시각화하는 리포트 UI입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    tags: ["공학", "데이터", "시각화"],
    updatedAt: "2025-11-04T08:30:00+09:00",
    status: "DRAFT",
  },
  {
    projectId: 8,
    title: "로컬 브랜드를 위한 패키지 디자인",
    description:
      "지역 생산품의 정체성을 담은 패키지와 라벨 디자인 제안입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1200&auto=format&fit=crop",
    tags: ["시각 디자인", "패키지", "브랜드"],
    updatedAt: "2025-10-15T17:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 9,
    title: "작은 예배당의 빛 연구",
    description: "예배 공간의 시간대별 자연광 변화를 기록한 공간 연구입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?q=80&w=1200&auto=format&fit=crop",
    tags: ["신학", "건축학", "공간"],
    updatedAt: "2025-09-20T12:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 10,
    title: "보이지 않는 것들의 기록",
    description: "사라진 학술 의례에 대한 역사적 문서화 프로젝트입니다.",
    thumbnailUrl: null,
    tags: ["인문학", "PDF", "아카이브 자료"],
    updatedAt: "2025-08-15T15:00:00+09:00",
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
  const size = getNonNegativeQueryNumber(url.searchParams.get("size"), 8)
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
 * mock 프로젝트를 검색 API 응답 항목으로 변환한다.
 * @param project 검색 결과로 노출할 mock 프로젝트
 * @returns 검색 API 응답 항목
 */
function toMockProjectSearchItem(project: MockProject): MockProjectSearchItem {
  const authors = ["김민지", "박정우", "이다솜", "최하린"]

  return {
    projectId: project.projectId,
    title: project.title,
    description: project.description,
    thumbnailUrl: project.thumbnailUrl,
    tags: project.tags,
    users: [
      {
        userId: project.projectId,
        name: authors[(project.projectId - 1) % authors.length],
      },
    ],
    viewCount: 300 + project.projectId * 211,
    likeCount: 60 + project.projectId * 37,
    isLiked: project.projectId % 2 === 0,
  }
}

/**
 * mock 프로젝트 검색 결과를 query 조건에 맞춰 반환한다.
 * @param url 프로젝트 검색 요청 URL
 * @returns 프로젝트 검색 페이지 mock 응답
 */
function getMockProjectSearchPage(url: URL): MockProjectSearchPage {
  const keyword = url.searchParams.get("keyword")?.trim().toLowerCase() ?? ""
  const selectedTags = url.searchParams
    .getAll("tags")
    .map((tag) => tag.trim())
    .filter(Boolean)
  const page = getNonNegativeQueryNumber(url.searchParams.get("page"), 0)
  const size = getNonNegativeQueryNumber(url.searchParams.get("size"), 6)
  const filterType = url.searchParams.get("filterType") ?? "LATEST"
  const filteredProjects = mockProjects
    .filter((project) => project.status === "PUBLISHED")
    .filter((project) => {
      if (!keyword) {
        return true
      }

      const searchableText = [
        project.title,
        project.description,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(keyword)
    })
    .filter((project) => {
      if (selectedTags.length === 0) {
        return true
      }

      return selectedTags.every((tag) => project.tags.includes(tag))
    })
    .sort((firstProject, secondProject) => {
      if (filterType === "VIEW_COUNT") {
        return secondProject.projectId - firstProject.projectId
      }

      return (
        new Date(secondProject.updatedAt).getTime() -
        new Date(firstProject.updatedAt).getTime()
      )
    })
  const startIndex = page * size
  const content = filteredProjects
    .slice(startIndex, startIndex + size)
    .map(toMockProjectSearchItem)

  return {
    content,
    page,
    size,
    totalElements: filteredProjects.length,
    totalPages: size === 0 ? 0 : Math.ceil(filteredProjects.length / size),
  }
}

/**
 * mock mode에서 인증 관련 API 응답을 네트워크 요청 없이 반환한다.
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

  if (path === authApiPaths.login && normalizedMethod === "POST") {
    return {
      success: true,
      data: getMockUser() as TData,
    }
  }

  if (path === authApiPaths.me && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockUser() as TData,
    }
  }

  if (path === authApiPaths.logout && normalizedMethod === "POST") {
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

  if (url.pathname === "/api/projects" && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockProjectSearchPage(url) as TData,
    }
  }

  return undefined
}
