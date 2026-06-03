import { authApiPaths, mockConfig, type AuthMockState } from "@/shared/config"

import type { ApiResponse } from "./types"

type MockUser = {
  id: number
  email: string
  universityVerified: boolean
}

type MockProject = {
  projectId: number
  title: string
  description: string
  content: string
  thumbnailUrl: string | null
  tags: string[]
  isPublic: boolean
  createdAt: string
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

type MockHomeProject = {
  projectId: number
  title: string
  thumbnailUrl: string | null
  tag: string
  authorName: string
  likeCount: number
  viewCount: number
}

type MockHomeCategory = {
  tag: string
  projects: MockHomeProject[]
}

type MockHomeData = {
  popularProjects: MockHomeProject[]
  categories: MockHomeCategory[]
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
    role: "OWNER" | "MEMBER"
  }>
  viewCount: number
  likeCount: number
  isLiked: boolean
}

type MockProjectDetail = MockProjectSearchItem & {
  content: string
  files: Array<{
    fileId: number
    originalName: string
    fileUrl: string
  }>
  createdAt: string
}

type MockProjectReview = {
  totalScore: number
  summary: string
  categories: Array<{
    category: string
    score: number
    comment: string
  }>
  criticalIssues: Array<{
    title: string
    description: string
    solution: string
  }>
  warnings: Array<{
    title: string
    description: string
    solution: string
  }>
  strengths: Array<{
    title: string
    description: string
  }>
  interviewQuestions: string[]
  refactoringSuggestions: Array<{
    title: string
    description: string
    exampleCode: string
  }>
}

type MockProjectSearchPage = {
  content: MockProjectSearchItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

type MockProfile = {
  profileId: number
  userId: number
  name: string
  nickname: string
  bio: string
  major: string
  grade: number | null
  profileImage: string
}

type MockPortfolio = {
  portfolioId: number
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  isPublic: boolean
  projectIds: number[]
  createdAt: string
  updatedAt: string
}

type MockPortfoliosPage = {
  content: Array<{
    portfolioId: number
    title: string
    slug: string
    description: string
    thumbnailUrl: string | null
    isPublic: boolean
    projectCount: number
    createdAt: string
    updatedAt: string
  }>
  page: number
  size: number
  totalElements: number
  totalPages: number
}

const mockUsers: Record<AuthMockState, MockUser> = {
  unverified: {
    id: 1,
    email: "user@syu.ac.kr",
    universityVerified: false,
  },
  verified: {
    id: 1,
    email: "user@syu.ac.kr",
    universityVerified: true,
  },
  "invalid-domain": {
    id: 1,
    email: "user@gmail.com",
    universityVerified: false,
  },
}

let mockProfile: MockProfile | null = {
  profileId: 1,
  userId: 1,
  name: "홍길동",
  nickname: "길동이",
  bio: "캠퍼스폴리오에서 학술 프로젝트를 정리하고 있습니다.",
  major: "컴퓨터공학과",
  grade: 4,
  profileImage: "",
}

const mockProjects: MockProject[] = [
  {
    projectId: 1,
    title: "미래 지능형 건축",
    description:
      "탄소 배출을 줄이는 모듈러 건축 시스템을 제안하는 학술 프로젝트입니다.",
    content:
      "# 미래 지능형 건축\n\n탄소 배출을 줄이는 모듈러 건축 시스템을 제안합니다.\n\n- 친환경 소재\n- 공기 단축\n- 재사용 가능한 구조",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
    tags: ["AI", "ARCH"],
    isPublic: true,
    createdAt: "2026-05-20T09:00:00+09:00",
    updatedAt: "2026-05-29T10:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 2,
    title: "언어 모델 최적화",
    description: "소형 언어 모델의 추론 비용을 줄이는 실험 기록입니다.",
    content:
      "# 언어 모델 최적화\n\n소형 언어 모델의 추론 비용을 줄이는 실험을 정리합니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    tags: ["NLP", "ML"],
    isPublic: false,
    createdAt: "2026-05-18T11:00:00+09:00",
    updatedAt: "2026-05-28T09:30:00+09:00",
    status: "DRAFT",
  },
  {
    projectId: 3,
    title: "바이오 데이터 가공",
    description: "바이오 실험 데이터를 시각화 가능한 형태로 정제합니다.",
    content:
      "# 바이오 데이터 가공\n\n바이오 실험 데이터를 시각화 가능한 형태로 정제합니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1200&auto=format&fit=crop",
    tags: ["BIO", "DATA"],
    isPublic: true,
    createdAt: "2026-05-15T14:30:00+09:00",
    updatedAt: "2026-05-26T12:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 4,
    title: "스마트 시티 설계",
    description: "도시 인프라 데이터를 활용한 스마트 시티 설계안입니다.",
    content:
      "# 스마트 시티 설계\n\n도시 인프라 데이터를 활용한 스마트 시티 설계안입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1200&auto=format&fit=crop",
    tags: ["URBAN", "IOT"],
    isPublic: true,
    createdAt: "2026-05-12T10:10:00+09:00",
    updatedAt: "2026-05-22T15:20:00+09:00",
    status: "PUBLISHED",
  },
]

const mockPortfolios: MockPortfolio[] = [
  {
    portfolioId: 1,
    title: "AI 프로젝트 모음",
    slug: "ai-projects",
    description: "AI와 데이터 기반 실험을 정리한 학술 포트폴리오입니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    isPublic: true,
    projectIds: [2, 4],
    createdAt: "2026-05-21T09:00:00+09:00",
    updatedAt: "2026-05-30T10:00:00+09:00",
  },
  {
    portfolioId: 2,
    title: "캠퍼스 디자인 아카이브",
    slug: "campus-design-archive",
    description: "공간, 브랜드, 사용자 경험을 다룬 프로젝트를 모았습니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200&auto=format&fit=crop",
    isPublic: false,
    projectIds: [1, 3],
    createdAt: "2026-05-24T09:00:00+09:00",
    updatedAt: "2026-05-28T15:30:00+09:00",
  },
]

const mockSearchOnlyProjects: MockProject[] = [
  {
    projectId: 5,
    title: "보이지 않는 것들의 기록",
    description: "사라진 학술 의례에 대한 역사적 문서화.",
    content:
      "# 보이지 않는 것들의 기록\n\n흩어진 문서와 구술 자료를 수집해 사라진 의례를 복원합니다.",
    thumbnailUrl: null,
    tags: ["인문학", "PDF", "아카이브 자료"],
    isPublic: true,
    createdAt: "2026-05-11T13:00:00+09:00",
    updatedAt: "2026-05-21T10:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 6,
    title: "도시 열섬을 줄이는 모듈형 파빌리온",
    description: "도시 미기후 데이터를 활용한 저에너지 공공 구조물 제안.",
    content:
      "# 모듈형 파빌리온\n\n도시 열섬 완화를 위한 재료와 배치 전략을 실험합니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1200&auto=format&fit=crop",
    tags: ["건축학", "환경", "공학"],
    isPublic: true,
    createdAt: "2026-05-09T15:20:00+09:00",
    updatedAt: "2026-05-19T09:10:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 7,
    title: "작은 예배당의 빛 연구",
    description: "예배 공간의 시간대별 자연광 변화를 기록한 공간 연구.",
    content:
      "# 작은 예배당의 빛 연구\n\n빛과 동선, 침묵의 관계를 공간적으로 분석합니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?q=80&w=1200&auto=format&fit=crop",
    tags: ["신학", "건축학", "공간"],
    isPublic: true,
    createdAt: "2026-05-07T08:40:00+09:00",
    updatedAt: "2026-05-18T14:00:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 8,
    title: "캠퍼스 길찾기 로봇 인터페이스",
    description: "저시력 학생을 위한 음성 기반 캠퍼스 안내 인터페이스.",
    content:
      "# 캠퍼스 길찾기 로봇 인터페이스\n\n센서 데이터와 음성 UX를 결합한 안내 흐름을 설계합니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop",
    tags: ["공학", "UX/UI", "접근성"],
    isPublic: true,
    createdAt: "2026-05-05T16:10:00+09:00",
    updatedAt: "2026-05-17T11:45:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 9,
    title: "문학 지도: 장소와 문장의 연결",
    description: "소설 속 장소를 캠퍼스 지도 위에 재배치하는 디지털 인문학 실험.",
    content:
      "# 문학 지도\n\n텍스트 속 장소와 실제 공간의 감각을 연결합니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop",
    tags: ["인문학", "디지털 아카이브", "지도"],
    isPublic: true,
    createdAt: "2026-05-03T12:30:00+09:00",
    updatedAt: "2026-05-16T17:30:00+09:00",
    status: "PUBLISHED",
  },
  {
    projectId: 10,
    title: "네오 서울 타이포그래피의 진화",
    description: "미래형 인터페이스에서의 한글 서체에 관한 타이포그래피 연구.",
    content:
      "# 네오 서울 타이포그래피\n\n도시 인터페이스와 한글 서체의 관계를 실험합니다.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1200&auto=format&fit=crop",
    tags: ["시각 디자인", "타이포그래피", "디자인"],
    isPublic: true,
    createdAt: "2026-05-01T09:00:00+09:00",
    updatedAt: "2026-05-15T12:00:00+09:00",
    status: "PUBLISHED",
  },
]

let mockNextProjectId = 11
let mockNextPortfolioId = 3
let mockEmailVerified = false

const mockProjectAuthors = ["김민지", "박정우", "이다솜", "최하린"] as const

/**
 * 현재 mock 인증 상태에 맞는 사용자 fixture를 반환한다.
 * @returns mock 인증 상태에 대응하는 사용자 정보
 */
function getMockUser() {
  if (mockConfig.authState === "unverified" && mockEmailVerified) {
    return {
      ...mockUsers.unverified,
      universityVerified: true,
    }
  }

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
 * mock 포트폴리오 목록을 page, size, isPublic query 기준으로 잘라 반환한다.
 * @param url 포트폴리오 목록 요청 URL
 * @returns mock 포트폴리오 목록 페이지
 */
function getMockPortfoliosPage(url: URL): MockPortfoliosPage {
  const page = getNonNegativeQueryNumber(url.searchParams.get("page"), 0)
  const size = getNonNegativeQueryNumber(url.searchParams.get("size"), 8)
  const isPublic = url.searchParams.get("isPublic")
  const filteredPortfolios =
    isPublic === null
      ? mockPortfolios
      : mockPortfolios.filter(
          (portfolio) => portfolio.isPublic === (isPublic === "true")
        )
  const startIndex = page * size
  const content = filteredPortfolios
    .slice(startIndex, startIndex + size)
    .map((portfolio) => ({
      createdAt: portfolio.createdAt,
      description: portfolio.description,
      isPublic: portfolio.isPublic,
      portfolioId: portfolio.portfolioId,
      projectCount: portfolio.projectIds.length,
      slug: portfolio.slug,
      thumbnailUrl: portfolio.thumbnailUrl,
      title: portfolio.title,
      updatedAt: portfolio.updatedAt,
    }))

  return {
    content,
    page,
    size,
    totalElements: filteredPortfolios.length,
    totalPages: size === 0 ? 0 : Math.ceil(filteredPortfolios.length / size),
  }
}

/**
 * slug와 일치하는 mock 포트폴리오를 찾는다.
 * @param slug 조회할 포트폴리오 slug
 * @returns mock 포트폴리오 또는 undefined
 */
function findMockPortfolioBySlug(slug: string) {
  return mockPortfolios.find((portfolio) => portfolio.slug === slug)
}

/**
 * ID와 일치하는 mock 포트폴리오를 찾는다.
 * @param portfolioId 조회할 포트폴리오 ID
 * @returns mock 포트폴리오 또는 undefined
 */
function findMockPortfolioById(portfolioId: number) {
  return mockPortfolios.find(
    (portfolio) => portfolio.portfolioId === portfolioId
  )
}

/**
 * 제목을 mock 포트폴리오 slug 기본값으로 변환한다.
 * @param title 포트폴리오 제목
 * @returns URL에 사용할 slug
 */
function createMockPortfolioSlugBase(title: string) {
  const normalizedSlug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return normalizedSlug || "portfolio"
}

/**
 * 기존 mock 포트폴리오와 중복되지 않는 slug를 만든다.
 * @param title 포트폴리오 제목
 * @returns 고유 slug
 */
function createUniqueMockPortfolioSlug(title: string) {
  const baseSlug = createMockPortfolioSlugBase(title)
  let slug = baseSlug
  let suffix = 1

  while (findMockPortfolioBySlug(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

/**
 * API 경로에서 포트폴리오 ID를 추출한다.
 * @param url mock URL 객체
 * @returns 포트폴리오 ID. 없으면 undefined
 */
function getPortfolioIdFromUrl(url: URL) {
  const match = url.pathname.match(/^\/api\/portfolios\/(\d+)(?:\/|$)/)

  if (!match) {
    return undefined
  }

  return Number(match[1])
}

/**
 * mock 포트폴리오 상세 응답을 만든다.
 * @param portfolio 상세로 변환할 mock 포트폴리오
 * @returns 포트폴리오 상세 응답
 */
function getMockPortfolioDetail(portfolio: MockPortfolio) {
  return {
    description: portfolio.description,
    isPublic: portfolio.isPublic,
    portfolioId: portfolio.portfolioId,
    projects: portfolio.projectIds
      .map((projectId, index) => {
        const project = findMockProject(projectId)

        if (!project) {
          return undefined
        }

        return {
          description: project.description,
          displayOrder: index,
          projectId: project.projectId,
          thumbnailUrl: project.thumbnailUrl,
          title: project.title,
        }
      })
      .filter((project) => !!project),
    slug: portfolio.slug,
    thumbnailUrl: portfolio.thumbnailUrl,
    title: portfolio.title,
  }
}

/**
 * mock 포트폴리오 생성 요청을 처리한다.
 * @param body 생성 요청 body
 * @returns 생성 결과 응답
 */
function createMockPortfolio(body: unknown) {
  const payload = isRecord(body) ? body : {}
  const title = typeof payload.title === "string" ? payload.title.trim() : ""

  if (!getMockUser().universityVerified) {
    return {
      success: false,
      message: "대학 인증이 필요합니다.",
    }
  }

  if (!title) {
    return {
      success: false,
      message: "포트폴리오 제목을 입력해주세요.",
    }
  }

  if (title.length > 100) {
    return {
      success: false,
      message: "포트폴리오 제목은 100자 이하로 입력해주세요.",
    }
  }

  const now = getMockNow()
  const portfolio: MockPortfolio = {
    createdAt: now,
    description: "",
    isPublic: false,
    portfolioId: mockNextPortfolioId,
    projectIds: [],
    slug: createUniqueMockPortfolioSlug(title),
    thumbnailUrl: null,
    title,
    updatedAt: now,
  }

  mockNextPortfolioId += 1
  mockPortfolios.unshift(portfolio)

  return {
    success: true,
    data: {
      portfolioId: portfolio.portfolioId,
      slug: portfolio.slug,
    },
  }
}

/**
 * mock 포트폴리오 기본 정보 수정 요청을 처리한다.
 * @param portfolio 수정할 mock 포트폴리오
 * @param body 수정 요청 body
 * @returns 수정 결과 응답
 */
function updateMockPortfolio(portfolio: MockPortfolio, body: unknown) {
  const payload = isRecord(body) ? body : {}
  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : portfolio.title
  const description =
    typeof payload.description === "string"
      ? payload.description.trim()
      : portfolio.description
  const thumbnailUrl =
    typeof payload.thumbnailUrl === "string" || payload.thumbnailUrl === null
      ? payload.thumbnailUrl
      : portfolio.thumbnailUrl

  if (title.length > 100) {
    return {
      success: false,
      message: "포트폴리오 제목은 100자 이하로 입력해주세요.",
    }
  }

  if (description.length > 500) {
    return {
      success: false,
      message: "포트폴리오 설명은 500자 이하로 입력해주세요.",
    }
  }

  portfolio.title = title
  portfolio.description = description
  portfolio.thumbnailUrl = thumbnailUrl
  portfolio.updatedAt = getMockNow()

  return {
    success: true,
    data: {
      message: "포트폴리오 수정 완료",
      portfolioId: portfolio.portfolioId,
      updatedAt: portfolio.updatedAt,
    },
  }
}

/**
 * mock 포트폴리오 프로젝트 연결 요청을 처리한다.
 * @param portfolio 수정할 mock 포트폴리오
 * @param body 프로젝트 추가/제거 요청 body
 * @returns 프로젝트 연결 수정 결과
 */
function updateMockPortfolioProjects(portfolio: MockPortfolio, body: unknown) {
  const payload = isRecord(body) ? body : {}
  const add = Array.isArray(payload.add)
    ? payload.add.filter(
        (projectId): projectId is number =>
          Number.isSafeInteger(projectId) && projectId > 0
      )
    : []
  const remove = Array.isArray(payload.remove)
    ? payload.remove.filter(
        (projectId): projectId is number =>
          Number.isSafeInteger(projectId) && projectId > 0
      )
    : []
  const missingProjectId = add.find((projectId) => !findMockProject(projectId))

  if (missingProjectId) {
    return {
      success: false,
      message: "존재하지 않는 프로젝트가 포함되어 있습니다.",
    }
  }

  const nextProjectIds = portfolio.projectIds.filter(
    (projectId) => !remove.includes(projectId)
  )

  add.forEach((projectId) => {
    if (!nextProjectIds.includes(projectId)) {
      nextProjectIds.push(projectId)
    }
  })

  if (nextProjectIds.length > 50) {
    return {
      success: false,
      message: "포트폴리오에는 최대 50개 프로젝트만 추가할 수 있습니다.",
    }
  }

  portfolio.projectIds = nextProjectIds
  portfolio.updatedAt = getMockNow()

  return {
    success: true,
    data: {
      message: "포트폴리오 프로젝트 수정 완료",
    },
  }
}

/**
 * mock 포트폴리오 프로젝트 순서 변경 요청을 처리한다.
 * @param portfolio 수정할 mock 포트폴리오
 * @param body 순서 변경 요청 body
 * @returns 순서 변경 결과
 */
function updateMockPortfolioOrder(portfolio: MockPortfolio, body: unknown) {
  const payload = isRecord(body) ? body : {}
  const projectOrder = Array.isArray(payload.projectOrder)
    ? payload.projectOrder.filter(
        (projectId): projectId is number =>
          Number.isSafeInteger(projectId) && projectId > 0
      )
    : []
  const currentIds = [...portfolio.projectIds].sort((a, b) => a - b)
  const requestedIds = [...projectOrder].sort((a, b) => a - b)
  const hasSameIds =
    currentIds.length === requestedIds.length &&
    currentIds.every((projectId, index) => projectId === requestedIds[index])

  if (!hasSameIds) {
    return {
      success: false,
      message: "현재 포트폴리오 프로젝트와 동일한 ID 순서를 전달해주세요.",
    }
  }

  portfolio.projectIds = projectOrder
  portfolio.updatedAt = getMockNow()

  return {
    success: true,
    data: {
      message: "프로젝트 순서 변경 완료",
    },
  }
}

/**
 * mock 포트폴리오 공개 상태 변경 요청을 처리한다.
 * @param portfolio 수정할 mock 포트폴리오
 * @param body 공개 상태 요청 body
 * @returns 공개 상태 변경 결과
 */
function updateMockPortfolioVisibility(portfolio: MockPortfolio, body: unknown) {
  const payload = isRecord(body) ? body : {}
  const isPublic =
    typeof payload.isPublic === "boolean" ? payload.isPublic : portfolio.isPublic

  if (isPublic) {
    const hasPublishedProject = portfolio.projectIds.some((projectId) => {
      const project = findMockProject(projectId)

      return project?.status === "PUBLISHED" && project.isPublic
    })

    if (!hasPublishedProject) {
      return {
        success: false,
        message: "공개 포트폴리오는 공개 프로젝트를 1개 이상 포함해야 합니다.",
      }
    }
  }

  portfolio.isPublic = isPublic
  portfolio.updatedAt = getMockNow()

  return {
    success: true,
    data: {
      isPublic: portfolio.isPublic,
      message: "포트폴리오 공개 상태 변경 완료",
      portfolioId: portfolio.portfolioId,
    },
  }
}

/**
 * mock 검색과 상세 조회에서 사용할 공개 프로젝트 카탈로그를 반환한다.
 * @returns 기존 mock 프로젝트와 검색 전용 프로젝트 목록
 */
function getMockProjectCatalog() {
  return [...mockProjects, ...mockSearchOnlyProjects]
}

/**
 * mock 프로젝트를 검색 API 응답 항목으로 변환한다.
 * @param project 검색 결과로 노출할 mock 프로젝트
 * @returns 검색 API 응답 항목
 */
function toMockProjectSearchItem(project: MockProject): MockProjectSearchItem {
  return {
    projectId: project.projectId,
    title: project.title,
    description: project.description,
    thumbnailUrl: project.thumbnailUrl,
    tags: project.tags,
    users: [
      {
        userId: project.projectId,
        name: mockProjectAuthors[
          (project.projectId - 1) % mockProjectAuthors.length
        ],
        role: "OWNER",
      },
    ],
    viewCount: 300 + project.projectId * 211,
    likeCount: 60 + project.projectId * 37,
    isLiked: project.projectId % 2 === 0,
  }
}

/**
 * mock 프로젝트를 상세 조회 API 응답 형태로 변환한다.
 * @param project 상세 조회로 반환할 mock 프로젝트
 * @returns 프로젝트 상세 API mock 응답
 */
function toMockProjectDetail(project: MockProject): MockProjectDetail {
  const ownerName =
    mockProjectAuthors[(project.projectId - 1) % mockProjectAuthors.length]

  return {
    ...toMockProjectSearchItem(project),
    content: project.content,
    users: [
      {
        userId: project.projectId,
        name: ownerName,
        role: "OWNER",
      },
      {
        userId: project.projectId + 100,
        name: "박지훈",
        role: "MEMBER",
      },
      {
        userId: project.projectId + 200,
        name: "이은서",
        role: "MEMBER",
      },
    ],
    files:
      project.projectId === 1
        ? [
            {
              fileId: 1,
              originalName: "프로젝트 발표 PDF",
              fileUrl: "#",
            },
            {
              fileId: 2,
              originalName: "GitHub Repository",
              fileUrl: "#",
            },
          ]
        : [],
    createdAt: project.createdAt,
  }
}

/**
 * mock 프로젝트에 대한 AI 코드 리뷰 응답을 생성한다.
 * @param project 리뷰 결과를 생성할 mock 프로젝트
 * @returns AI 코드 리뷰 mock 응답
 */
function createMockProjectReview(project: MockProject): MockProjectReview {
  const hasContent = project.content.trim().length > 0
  const tagSummary =
    project.tags.length > 0 ? project.tags.join(", ") : "분류 태그 없음"

  return {
    totalScore: project.status === "PUBLISHED" ? 88 : 74,
    summary: `${project.title}는 ${tagSummary} 맥락이 분명한 프로젝트입니다. 설명과 산출물 연결은 좋지만, 코드 구조와 예외 처리 의도를 더 명확히 남기면 리뷰 완성도가 높아집니다.`,
    categories: [
      {
        category: "구조",
        score: hasContent ? 86 : 70,
        comment: "기능 단위 설명은 분리되어 있으나 핵심 흐름을 더 짧게 요약하면 좋습니다.",
      },
      {
        category: "안정성",
        score: 82,
        comment: "주요 오류 상황을 사용자 메시지와 재시도 흐름으로 보완할 여지가 있습니다.",
      },
      {
        category: "협업성",
        score: 90,
        comment: "역할과 산출물이 잘 드러나 팀 프로젝트 맥락을 파악하기 쉽습니다.",
      },
    ],
    criticalIssues: [
      {
        title: "핵심 실패 경로 문서화 부족",
        description:
          "프로젝트 설명에서 API 실패, 빈 데이터, 권한 오류 같은 주요 실패 시나리오가 충분히 드러나지 않습니다.",
        solution:
          "README 또는 본문에 실패 상태별 대응 방식과 검증 결과를 짧게 추가하세요.",
      },
    ],
    warnings: [
      {
        title: "리팩토링 근거 보강 필요",
        description:
          "기능 구현 결과는 확인되지만 왜 현재 구조를 선택했는지 판단 근거가 부족합니다.",
        solution:
          "컴포넌트 분리 기준, API 경계, 상태 관리 범위를 한 단락으로 정리하세요.",
      },
      {
        title: "테스트 관점 확장 필요",
        description:
          "성공 흐름 외에 인증 실패, 네트워크 실패, 빈 응답 테스트 관점이 더 필요합니다.",
        solution:
          "실패 응답과 edge case를 검증한 체크리스트를 프로젝트 본문에 추가하세요.",
      },
    ],
    strengths: [
      {
        title: "문제 정의가 명확함",
        description:
          "사용자 문제와 해결 방향이 제목, 설명, 태그를 통해 빠르게 파악됩니다.",
      },
      {
        title: "산출물 연결성",
        description:
          "첨부 파일과 프로젝트 소개가 함께 제공되어 구현 맥락을 추적하기 쉽습니다.",
      },
    ],
    interviewQuestions: [
      "가장 복잡했던 상태 전이는 무엇이고, 어떻게 단순화했나요?",
      "현재 구조에서 API 응답 형식이 바뀐다면 어떤 계층을 먼저 수정하나요?",
      "사용자에게 노출되는 오류 메시지는 어떤 기준으로 분류했나요?",
    ],
    refactoringSuggestions: [
      {
        title: "API 경계 정규화 함수 분리",
        description:
          "서버 응답을 화면 모델로 바꾸는 코드가 커지면 entity 계층에 정규화 함수를 두는 편이 유지보수에 유리합니다.",
        exampleCode:
          "function normalizeProject(response) {\n  return {\n    ...response,\n    tags: Array.isArray(response.tags) ? response.tags : [],\n  }\n}",
      },
    ],
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
  const filteredProjects = getMockProjectCatalog()
    .filter((project) => project.status === "PUBLISHED" && project.isPublic)
    .filter((project) => {
      if (!keyword) {
        return true
      }

      const searchableText = [
        project.title,
        project.description,
        project.content,
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
 * mock 프로젝트를 메인 페이지 API 프로젝트 항목으로 변환한다.
 * @param project 메인 페이지에 노출할 mock 프로젝트
 * @returns 홈 API 응답의 프로젝트 항목
 */
function toMockHomeProject(project: MockProject): MockHomeProject {
  const primaryTag = project.tags[0] ?? "Project"

  return {
    projectId: project.projectId,
    title: project.title,
    thumbnailUrl: project.thumbnailUrl,
    tag: primaryTag,
    authorName:
      mockProjectAuthors[(project.projectId - 1) % mockProjectAuthors.length],
    likeCount: 60 + project.projectId * 37,
    viewCount: 300 + project.projectId * 211,
  }
}

/**
 * mock 프로젝트 fixture로 메인 페이지 API 응답을 구성한다.
 * @returns 인기 프로젝트와 카테고리별 프로젝트 mock 데이터
 */
function getMockHomeData(): MockHomeData {
  const publishedProjects = getMockProjectCatalog().filter(
    (project) => project.status === "PUBLISHED"
  )
  const homeProjects = publishedProjects.map(toMockHomeProject)
  const categoryMap = new Map<string, MockHomeProject[]>()

  homeProjects.forEach((project) => {
    const projects = categoryMap.get(project.tag) ?? []

    categoryMap.set(project.tag, [...projects, project])
  })

  return {
    popularProjects: homeProjects.slice(0, 6),
    categories: Array.from(categoryMap, ([tag, projects]) => ({
      tag,
      projects,
    })),
  }
}

/**
 * mock 응답에서 사용할 현재 시각 문자열을 만든다.
 * @returns ISO 형식 현재 시각
 */
function getMockNow() {
  return new Date().toISOString()
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
 * 이메일이 mock 인증에서 허용하는 대학 이메일인지 확인한다.
 * @param email 검사할 이메일
 * @returns .ac.kr 이메일 여부
 */
function isMockAcademicEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.ac\.kr$/i.test(email.trim())
}

/**
 * mock 이메일 인증 payload에서 이메일을 추출한다.
 * @param body API 요청 body
 * @returns 요청 이메일
 */
function getMockEmailFromBody(body: unknown) {
  const payload = isRecord(body) ? body : {}

  return typeof payload.email === "string" ? payload.email.trim() : ""
}

/**
 * mock 이메일 인증 요청의 공통 검증을 수행한다.
 * @param body API 요청 body
 * @returns 실패 응답. 검증에 성공하면 undefined
 */
function getMockEmailValidationError(body: unknown) {
  const email = getMockEmailFromBody(body)

  if (!email || !isMockAcademicEmail(email)) {
    return {
      success: false,
      message: ".ac.kr로 끝나는 학교 이메일을 입력해주세요.",
    }
  }

  if (getMockUser().universityVerified) {
    return {
      success: false,
      message: "이미 학교 이메일 인증이 완료되었습니다.",
    }
  }

  return undefined
}

/**
 * API 경로에서 프로젝트 ID를 추출한다.
 * @param url mock URL 객체
 * @returns 프로젝트 ID. 없으면 undefined
 */
function getProjectIdFromUrl(url: URL) {
  const match = url.pathname.match(/^\/api\/projects\/(\d+)(?:\/|$)/)

  if (!match) {
    return undefined
  }

  return Number(match[1])
}

/**
 * mock 프로젝트 ID로 프로젝트를 찾는다.
 * @param projectId 찾을 프로젝트 ID
 * @returns mock 프로젝트. 없으면 undefined
 */
function findMockProject(projectId: number) {
  return getMockProjectCatalog().find((project) => project.projectId === projectId)
}

/**
 * mock 프로젝트 임시 초안을 생성한다.
 * @returns 생성된 mock 프로젝트 초안
 */
function createMockProjectDraft(body: unknown) {
  const payload = isRecord(body) ? body : {}
  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : "새 프로젝트"
  const description =
    typeof payload.description === "string" ? payload.description : ""
  const now = getMockNow()
  const project: MockProject = {
    projectId: mockNextProjectId,
    title,
    description,
    content: "",
    thumbnailUrl: null,
    tags: [],
    isPublic: false,
    createdAt: now,
    updatedAt: now,
    status: "DRAFT",
  }

  mockNextProjectId += 1
  mockProjects.unshift(project)

  return {
    projectId: project.projectId,
  }
}

/**
 * mock 프로젝트 상세 수정 payload를 반영한다.
 * @param project 수정할 mock 프로젝트
 * @param body API 요청 body
 * @returns 수정 결과 응답
 */
function updateMockProject(project: MockProject, body: unknown) {
  const payload = isRecord(body) ? body : {}
  const title = typeof payload.title === "string" ? payload.title : project.title
  const description =
    typeof payload.description === "string"
      ? payload.description
      : project.description
  const content =
    typeof payload.content === "string" ? payload.content : project.content
  const thumbnailUrl =
    typeof payload.thumbnail === "string" || payload.thumbnail === null
      ? payload.thumbnail
      : project.thumbnailUrl
  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((tag): tag is string => typeof tag === "string")
    : project.tags

  project.title = title
  project.description = description
  project.content = content
  project.thumbnailUrl = thumbnailUrl
  project.tags = tags
  project.updatedAt = getMockNow()

  return {
    projectId: project.projectId,
  }
}

/**
 * mock 프로젝트 공개 등록 payload를 반영한다.
 * @param project 등록할 mock 프로젝트
 * @param body API 요청 body
 * @returns 등록 결과 응답
 */
function publishMockProject(project: MockProject, body: unknown) {
  const payload = isRecord(body) ? body : {}
  const title = typeof payload.title === "string" ? payload.title : project.title
  const description =
    typeof payload.description === "string"
      ? payload.description
      : project.description
  const content =
    typeof payload.content === "string" ? payload.content : project.content
  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((tag): tag is string => typeof tag === "string")
    : project.tags

  project.title = title
  project.description = description
  project.content = content
  project.tags = tags
  project.status = "PUBLISHED"
  project.isPublic = true
  project.updatedAt = getMockNow()
}

/**
 * mock 파일 업로드 응답을 만든다.
 * @param projectId 파일을 연결할 프로젝트 ID
 * @param body API 요청 body
 * @returns mock 파일 ID와 파일 URL
 */
function createMockFileUpload(projectId: number, body: unknown) {
  const formFile =
    typeof FormData !== "undefined" && body instanceof FormData
      ? body.get("file")
      : undefined
  const fileName =
    typeof File !== "undefined" && formFile instanceof File && formFile.name
      ? formFile.name
      : "upload.bin"
  const encodedName = encodeURIComponent(fileName)

  return {
    fileId: Date.now(),
    fileUrl: `https://campus-polio.local/mock/projects/${projectId}/${encodedName}`,
  }
}

/**
 * mock 프로필 생성 요청을 처리하고 저장된 프로필을 갱신한다.
 * @param body 프로필 생성 요청 body
 * @returns 생성 결과
 */
function createMockProfile(body: unknown) {
  const payload = isRecord(body) ? body : {}
  const nickname =
    typeof payload.nickname === "string" ? payload.nickname.trim() : ""
  const bio = typeof payload.bio === "string" ? payload.bio.trim() : ""

  if (!nickname) {
    return {
      success: false,
      message: "닉네임을 입력해주세요.",
    }
  }

  mockProfile = {
    bio,
    grade: null,
    major: "",
    name: "",
    nickname,
    profileId: 1,
    profileImage: "",
    userId: 1,
  }

  return {
    success: true,
    data: {
      message: "프로필 생성 완료",
      profileId: mockProfile.profileId,
    },
  }
}

/**
 * mock 프로필 수정 요청을 처리하고 저장된 프로필을 갱신한다.
 * @param body 프로필 수정 요청 body
 * @returns 수정 결과
 */
function updateMockProfile(body: unknown) {
  const payload = isRecord(body) ? body : {}
  const currentProfile =
    mockProfile ??
    ({
      bio: "",
      grade: null,
      major: "",
      name: "",
      nickname: "길동이",
      profileId: 1,
      profileImage: "",
      userId: 1,
    } satisfies MockProfile)

  mockProfile = {
    ...currentProfile,
    bio: typeof payload.bio === "string" ? payload.bio : currentProfile.bio,
    grade:
      typeof payload.grade === "number" || payload.grade === null
        ? payload.grade
        : currentProfile.grade,
    major:
      typeof payload.major === "string" ? payload.major : currentProfile.major,
    name: typeof payload.name === "string" ? payload.name : currentProfile.name,
    nickname:
      typeof payload.nickname === "string"
        ? payload.nickname
        : currentProfile.nickname,
    profileImage:
      typeof payload.profileImage === "string"
        ? payload.profileImage
        : currentProfile.profileImage,
  }

  return {
    success: true,
    data: {
      message: "프로필 수정 완료",
      updatedAt: new Date().toISOString(),
      userId: mockProfile.userId,
    },
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
  method = "GET",
  body?: unknown
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

  if (
    url.pathname === authApiPaths.sendEmailCode &&
    normalizedMethod === "POST"
  ) {
    const validationError = getMockEmailValidationError(body)

    if (validationError) {
      return validationError as ApiResponse<TData>
    }

    return {
      success: true,
      data: {
        message: "인증번호가 발송되었습니다. mock 인증번호는 123456입니다.",
      } as TData,
    }
  }

  if (
    url.pathname === authApiPaths.resendEmailCode &&
    normalizedMethod === "POST"
  ) {
    const validationError = getMockEmailValidationError(body)

    if (validationError) {
      return validationError as ApiResponse<TData>
    }

    return {
      success: true,
      data: {
        message: "인증번호를 다시 발송했습니다. mock 인증번호는 123456입니다.",
      } as TData,
    }
  }

  if (
    url.pathname === authApiPaths.verifyEmailCode &&
    normalizedMethod === "POST"
  ) {
    const validationError = getMockEmailValidationError(body)
    const payload = isRecord(body) ? body : {}
    const code = typeof payload.code === "string" ? payload.code : ""

    if (validationError) {
      return validationError as ApiResponse<TData>
    }

    if (code !== "123456") {
      return {
        success: false,
        message: "인증번호가 일치하지 않습니다.",
      } as ApiResponse<TData>
    }

    mockEmailVerified = true

    return {
      success: true,
      data: {
        message: "학교 이메일 인증이 완료되었습니다.",
      } as TData,
    }
  }

  if (url.pathname === "/api/home" && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockHomeData() as TData,
    }
  }

  if (url.pathname === "/api/users/me/projects" && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockProjectsPage(url) as TData,
    }
  }

  if (
    url.pathname === "/api/users/me/portfolios" &&
    normalizedMethod === "GET"
  ) {
    return {
      success: true,
      data: getMockPortfoliosPage(url) as TData,
    }
  }

  if (url.pathname === "/api/profile" && normalizedMethod === "GET") {
    if (!mockProfile) {
      return {
        success: false,
        message: "프로필이 없습니다.",
      } as ApiResponse<TData>
    }

    return {
      success: true,
      data: mockProfile as TData,
    }
  }

  if (url.pathname === "/api/profile" && normalizedMethod === "POST") {
    return createMockProfile(body) as ApiResponse<TData>
  }

  if (url.pathname === "/api/profile" && normalizedMethod === "PATCH") {
    return updateMockProfile(body) as ApiResponse<TData>
  }

  if (url.pathname === "/api/projects" && normalizedMethod === "GET") {
    return {
      success: true,
      data: getMockProjectSearchPage(url) as TData,
    }
  }

  if (url.pathname === "/api/projects" && normalizedMethod === "POST") {
    return {
      success: true,
      data: createMockProjectDraft(body) as TData,
    }
  }

  if (url.pathname === "/api/portfolios" && normalizedMethod === "POST") {
    return createMockPortfolio(body) as ApiResponse<TData>
  }

  const portfolioId = getPortfolioIdFromUrl(url)
  const portfolio = portfolioId ? findMockPortfolioById(portfolioId) : undefined

  if (!portfolioId && /^\/api\/portfolios\/\d+(?:\/|$)/.test(url.pathname)) {
    return {
      success: false,
      message: "포트폴리오 ID가 올바르지 않습니다.",
    } as ApiResponse<TData>
  }

  if (
    portfolioId &&
    !portfolio &&
    /^\/api\/portfolios\/\d+(?:\/|$)/.test(url.pathname)
  ) {
    return {
      success: false,
      message: "포트폴리오가 없습니다.",
    } as ApiResponse<TData>
  }

  if (
    portfolio &&
    url.pathname === `/api/portfolios/${portfolioId}` &&
    normalizedMethod === "PATCH"
  ) {
    return updateMockPortfolio(portfolio, body) as ApiResponse<TData>
  }

  if (
    portfolio &&
    url.pathname === `/api/portfolios/${portfolioId}/projects` &&
    normalizedMethod === "PATCH"
  ) {
    return updateMockPortfolioProjects(portfolio, body) as ApiResponse<TData>
  }

  if (
    portfolio &&
    url.pathname === `/api/portfolios/${portfolioId}/order` &&
    normalizedMethod === "PATCH"
  ) {
    return updateMockPortfolioOrder(portfolio, body) as ApiResponse<TData>
  }

  if (
    portfolio &&
    url.pathname === `/api/portfolios/${portfolioId}/visibility` &&
    normalizedMethod === "PATCH"
  ) {
    return updateMockPortfolioVisibility(portfolio, body) as ApiResponse<TData>
  }

  const portfolioSlugMatch = /^\/api\/portfolios\/([^/]+)$/.exec(url.pathname)
  const portfolioSlug = portfolioSlugMatch
    ? decodeURIComponent(portfolioSlugMatch[1])
    : undefined

  if (portfolioSlug && normalizedMethod === "GET") {
    const portfolio = findMockPortfolioBySlug(portfolioSlug)

    if (!portfolio) {
      return {
        success: false,
        message: "포트폴리오가 없습니다.",
      } as ApiResponse<TData>
    }

    return {
      success: true,
      data: getMockPortfolioDetail(portfolio) as TData,
    }
  }

  const projectId = getProjectIdFromUrl(url)
  const project = projectId ? findMockProject(projectId) : undefined

  if (project && url.pathname === `/api/projects/${projectId}`) {
    if (normalizedMethod === "GET") {
      return {
        success: true,
        data: toMockProjectDetail(project) as TData,
      }
    }

    if (normalizedMethod === "PATCH") {
      return {
        success: true,
        data: updateMockProject(project, body) as TData,
      }
    }
  }

  if (
    project &&
    url.pathname === `/api/projects/${projectId}/review` &&
    normalizedMethod === "POST"
  ) {
    return {
      success: true,
      data: createMockProjectReview(project) as TData,
    }
  }

  if (
    project &&
    url.pathname === `/api/projects/${projectId}/files` &&
    normalizedMethod === "POST"
  ) {
    return {
      success: true,
      data: createMockFileUpload(project.projectId, body) as TData,
    }
  }

  if (
    project &&
    url.pathname === `/api/projects/${projectId}/publish` &&
    normalizedMethod === "POST"
  ) {
    publishMockProject(project, body)

    return {
      success: true,
    }
  }

  return undefined
}
