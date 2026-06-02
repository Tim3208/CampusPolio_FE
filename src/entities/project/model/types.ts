export type ProjectAuthor = {
  userId: number
  name: string
  profileImage: string
}

export type ProjectMember = {
  userId: number
  name: string
}

export type ProjectSection = {
  sectionId: number
  title: string
  content: string
  imageUrl?: string
}

export type ProjectResource = {
  resourceId: number
  title: string
  href: string
}

export type RelatedProject = {
  projectId: number
  title: string
  authorName: string
  imageUrl: string
}

export type ProjectDetail = {
  projectId: number
  title: string
  description: string
  content: string
  thumbnailUrl: string
  author: ProjectAuthor
  tags: string[]
  members: ProjectMember[]
  likes: number
  views: number
  isLiked: boolean
  isPublic: boolean
  createdAt: string
  updatedAt: string
  sections: ProjectSection[]
  resources: ProjectResource[]
  relatedWorks: RelatedProject[]
}

export type MyProjectStatus = "PUBLISHED" | "DRAFT" | (string & {})

export type MyProject = {
  projectId: number
  title: string
  description?: string
  thumbnailUrl: string | null
  tags: string[]
  updatedAt: string
  status: MyProjectStatus
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

export type ProjectSearchFilterType = "LATEST" | "VIEW_COUNT"

export type ProjectSearchUser = {
  userId: number
  name: string
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
