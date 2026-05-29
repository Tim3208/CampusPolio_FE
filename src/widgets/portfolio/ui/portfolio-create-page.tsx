import { headers } from "next/headers"

import { getMyProjects, type MyProjectsPage } from "@/entities/project"
import { PortfolioBuilder } from "@/features/portfolio/portfolio-builder"

type PortfolioCreateState = {
  errorMessage?: string
  projectsPage: MyProjectsPage | null
}

/**
 * 포트폴리오 제작에 필요한 내 프로젝트 목록을 서버에서 조회한다.
 * @returns 프로젝트 페이지 또는 오류 메시지
 */
async function getPortfolioCreateState(): Promise<PortfolioCreateState> {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  try {
    const projectsPage = await getMyProjects(
      {
        page: 0,
        size: 8,
        status: "ALL",
      },
      cookie
        ? {
            headers: {
              cookie,
            },
          }
        : undefined
    )

    return {
      projectsPage,
    }
  } catch (error) {
    return {
      errorMessage:
        error instanceof Error
          ? error.message
          : "프로젝트 목록을 불러오지 못했습니다.",
      projectsPage: null,
    }
  }
}

/**
 * 포트폴리오 제작 독립 화면을 렌더링한다.
 * @returns 포트폴리오 제작 페이지
 */
export async function PortfolioCreatePage() {
  const state = await getPortfolioCreateState()

  return <PortfolioBuilder {...state} />
}
