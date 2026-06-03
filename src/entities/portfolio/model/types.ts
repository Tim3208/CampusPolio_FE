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
