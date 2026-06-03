export type MyProjectStatus = "PUBLISHED" | "DRAFT" | (string & {})

export type MyProject = {
  projectId: number
  title: string
  description?: string
  thumbnailUrl: string | null
  tags: string[]
  updatedAt: string
  status: MyProjectStatus
  role?: "OWNER" | "MEMBER" | string
}

export type MyProjectsPage = {
  content: MyProject[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type MyProjectsStatusFilter = "ALL" | MyProjectStatus

export type MyProjectsQuery = {
  page?: number
  size?: number
  status?: MyProjectsStatusFilter
}

export type MyProjectApiItem = {
  projectId: number
  title: string
  description?: string
  thumbnail?: string | null
  thumbnailUrl?: string | null
  tags?: string[]
  updatedAt: string
  status: MyProjectStatus
  role?: "OWNER" | "MEMBER" | string
}

export type ProjectDetailUser = {
  userId: number
  name: string
  role: "OWNER" | "MEMBER"
}

export type ProjectDetailFile = {
  fileId: number
  originalName: string
  fileUrl: string
}

export type ProjectDetail = {
  projectId: number
  title: string
  description: string
  content: string
  thumbnailUrl: string | null
  tags: string[]
  users: ProjectDetailUser[]
  files: ProjectDetailFile[]
  viewCount: number
  likeCount: number
  isLiked: boolean
  createdAt: string
}

export type ProjectDraft = {
  projectId: number
}

export type ProjectCreatePayload = {
  title: string
  description?: string
}

export type ProjectUpdatePayload = {
  title?: string
  description?: string
  content?: string
  thumbnail?: string
  tags?: string[]
}

export type ProjectUpdateResult = {
  projectId: number
}

export type ProjectFileUploadPayload = {
  fileName: string
  fileType: string
}

export type ProjectFileUpload = {
  uploadUrl: string
  fileUrl: string
}

export type ProjectPublishPayload = {
  title: string
  description?: string
  content: string
  tags: string[]
}

export type ProjectPublishResult = void

export type ReviewCategory = {
  category: string
  score: number
  comment: string
}

export type ReviewIssue = {
  title: string
  description: string
  solution: string
}

export type ReviewStrength = {
  title: string
  description: string
}

export type RefactoringSuggestion = {
  title: string
  description: string
  exampleCode: string
}

export type ProjectReview = {
  totalScore: number
  summary: string
  categories: ReviewCategory[]
  criticalIssues: ReviewIssue[]
  warnings: ReviewIssue[]
  strengths: ReviewStrength[]
  interviewQuestions: string[]
  refactoringSuggestions: RefactoringSuggestion[]
}

export type HomeProject = {
  projectId: number
  title: string
  thumbnailUrl: string | null
  tag: string
  authorName: string
  likeCount: number
  viewCount: number
}

export type HomeCategory = {
  tag: string
  projects: HomeProject[]
}

export type HomeData = {
  popularProjects: HomeProject[]
  categories: HomeCategory[]
}

export type ProjectSearchFilterType = "LATEST" | "VIEW_COUNT"

export type ProjectSearchUser = {
  userId: number
  name: string
  role: "OWNER" | "MEMBER"
}

export type ProjectSearchItem = {
  projectId: number
  title: string
  description: string
  thumbnailUrl: string | null
  tags: string[]
  users: ProjectSearchUser[]
  viewCount: number
  likeCount: number
  isLiked: boolean
}

export type ProjectSearchPage = {
  content: ProjectSearchItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ProjectSearchQuery = {
  keyword?: string
  tags?: string[]
  page?: number
  size?: number
  filterType?: ProjectSearchFilterType
}

export type ProjectSearchApiItem = {
  projectId: number
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  tags?: string[]
  users?: ProjectSearchUser[]
  viewCount?: number
  likeCount?: number
  isLiked?: boolean
}

export type ProjectSearchApiPage = {
  content?: ProjectSearchApiItem[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
}
