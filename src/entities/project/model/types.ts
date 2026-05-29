export type MyProjectStatus = "PUBLISHED" | "DRAFT" | (string & {})

export type MyProject = {
  projectId: number
  title: string
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

export type ProjectAuthor = {
  userId: number
  name: string
  profileImage?: string | null
}

export type ProjectMember = {
  userId: number
  name: string
}

export type ProjectDetail = {
  projectId: number
  title: string
  description: string
  content: string
  thumbnailUrl: string | null
  author?: ProjectAuthor
  tags: string[]
  members?: ProjectMember[]
  likes?: number
  views?: number
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export type ProjectDraft = {
  projectId: number
  status: "DRAFT" | string
  tags?: string[]
}

export type ProjectUpdatePayload = {
  title: string
  description: string
  content: string
  thumbnailUrl: string | null
  isPublic: boolean
}

export type ProjectUpdateResult = {
  projectId: number
  status: "DRAFT" | string
  updatedAt: string
  message: string
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
  tags: string[]
}

export type ProjectPublishResult = {
  message: string
  status: "PUBLISHED" | string
}
