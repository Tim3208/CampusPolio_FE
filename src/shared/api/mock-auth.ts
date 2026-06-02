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

let mockNextProjectId = 5
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
      isVerified: true,
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
  const publishedProjects = mockProjects.filter(
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

  if (getMockUser().isVerified) {
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
  return mockProjects.find((project) => project.projectId === projectId)
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
 * mock 파일 업로드 URL 응답을 만든다.
 * @param projectId 파일을 연결할 프로젝트 ID
 * @param body API 요청 body
 * @returns mock 업로드 URL과 파일 URL
 */
function createMockFileUpload(projectId: number, body: unknown) {
  const payload = isRecord(body) ? body : {}
  const fileName =
    typeof payload.fileName === "string" ? payload.fileName : "upload.bin"
  const encodedName = encodeURIComponent(fileName)

  return {
    uploadUrl: `mock://projects/${projectId}/files/${encodedName}`,
    fileUrl: `https://campus-polio.local/mock/projects/${projectId}/${encodedName}`,
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

  if (url.pathname === "/api/projects" && normalizedMethod === "POST") {
    return {
      success: true,
      data: createMockProjectDraft(body) as TData,
    }
  }

  const projectId = getProjectIdFromUrl(url)
  const project = projectId ? findMockProject(projectId) : undefined

  if (project && url.pathname === `/api/projects/${projectId}`) {
    if (normalizedMethod === "GET") {
      return {
        success: true,
        data: project as TData,
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
