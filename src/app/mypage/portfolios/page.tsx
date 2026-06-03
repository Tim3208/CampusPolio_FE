import { headers } from "next/headers"

import { getMyPortfolios, type MyPortfolio } from "@/entities/portfolio"
import { MypagePortfoliosPage } from "@/widgets/mypage"

type PortfoliosPageState = {
  errorMessage?: string
  portfolios: MyPortfolio[]
}

/**
 * 마이페이지 포트폴리오 모음에 필요한 초기 데이터를 서버에서 조회한다.
 * @returns 포트폴리오 목록 또는 오류 메시지
 */
async function getPortfoliosPageState(): Promise<PortfoliosPageState> {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  if (!cookie) {
    return {
      errorMessage: "로그인이 필요합니다.",
      portfolios: [],
    }
  }

  try {
    const portfoliosPage = await getMyPortfolios(
      {
        page: 0,
        size: 8,
      },
      {
        headers: {
          cookie,
        },
      }
    )

    return {
      portfolios: portfoliosPage.content,
    }
  } catch (error) {
    return {
      errorMessage:
        error instanceof Error
          ? error.message
          : "포트폴리오 목록을 불러오지 못했습니다.",
      portfolios: [],
    }
  }
}

/**
 * 내 포트폴리오 모음 탭 라우트를 렌더링한다.
 * @returns 포트폴리오 모음 화면
 */
export default async function Page() {
  const portfoliosPageState = await getPortfoliosPageState()

  return <MypagePortfoliosPage {...portfoliosPageState} />
}
