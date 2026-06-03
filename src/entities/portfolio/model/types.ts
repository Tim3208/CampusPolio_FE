export type MyPortfolio = {
  portfolioId: number
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  isPublic: boolean
  projectCount: number
  createdAt: string
  updatedAt: string
}

export type MyPortfolioApiItem = {
  portfolioId: number
  title: string
  slug: string
  description?: string | null
  thumbnailUrl?: string | null
  isPublic: boolean
  projectCount: number
  createdAt: string
  updatedAt: string
}

export type MyPortfoliosPage = {
  content: MyPortfolio[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type MyPortfoliosApiPage = {
  content: MyPortfolioApiItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type MyPortfoliosQuery = {
  isPublic?: boolean
  page?: number
  size?: number
}

export type PortfolioDetailProject = {
  projectId: number
  title: string
  description: string
  thumbnailUrl: string | null
  displayOrder: number
}

export type PortfolioDetailProjectApiItem = {
  projectId: number
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  displayOrder: number
}

export type PortfolioDetail = {
  portfolioId: number
  title: string
  slug: string
  description: string
  thumbnailUrl: string | null
  isPublic: boolean
  projects: PortfolioDetailProject[]
}

export type PortfolioDetailApiResponse = {
  portfolioId: number
  title: string
  slug: string
  description?: string | null
  thumbnailUrl?: string | null
  isPublic: boolean
  projects?: PortfolioDetailProjectApiItem[] | null
}

export type PortfolioCreatePayload = {
  title: string
}

export type PortfolioCreateResult = {
  portfolioId: number
  slug: string
}

export type PortfolioUpdatePayload = {
  description?: string | null
  thumbnailUrl?: string | null
  title?: string | null
}

export type PortfolioUpdateResult = {
  message?: string
  portfolioId: number
  updatedAt?: string
}

export type PortfolioProjectUpdatePayload = {
  add: number[]
  remove: number[]
}

export type PortfolioProjectUpdateResult = {
  message?: string
}

export type PortfolioOrderUpdatePayload = {
  projectOrder: number[]
}

export type PortfolioOrderUpdateResult = {
  message?: string
}

export type PortfolioVisibilityUpdatePayload = {
  isPublic: boolean
}

export type PortfolioVisibilityUpdateResult = {
  isPublic: boolean
  message?: string
  portfolioId: number
}
