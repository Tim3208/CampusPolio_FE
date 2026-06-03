import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { getPortfolioBySlug, type PortfolioDetail } from "@/entities/portfolio"
import { ApiError } from "@/shared/api"
import { PortfolioDetailPage } from "@/widgets/portfolio"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export const dynamic = "force-dynamic"

/**
 * slug 기반 포트폴리오 상세 데이터를 조회하고 상세 화면을 렌더링한다.
 * @param props 라우트 params
 * @returns 포트폴리오 상세 페이지 UI
 */
export default async function Page({ params }: PageProps) {
  const { slug } = await params
  let portfolio: PortfolioDetail | undefined
  let errorMessage: string | undefined

  if (!slug.trim()) {
    notFound()
  }

  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  try {
    portfolio = await getPortfolioBySlug(
      slug,
      cookie
        ? {
            headers: {
              cookie,
            },
          }
        : {}
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }

    errorMessage =
      error instanceof Error
        ? error.message
        : "포트폴리오 상세 정보를 불러오지 못했습니다."
  }

  return <PortfolioDetailPage errorMessage={errorMessage} portfolio={portfolio} />
}
