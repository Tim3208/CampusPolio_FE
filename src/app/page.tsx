import { getHome, type HomeData } from "@/entities/project"
import { HomePage } from "@/widgets/home"

export const dynamic = "force-dynamic"

/**
 * 메인 페이지 데이터를 서버에서 조회하고 홈 화면을 렌더링한다.
 * @returns 메인 페이지 UI
 */
export default async function Page() {
  let data: HomeData | undefined
  let errorMessage: string | undefined

  try {
    data = await getHome({ cache: "no-store" })
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "메인 페이지 데이터를 불러오지 못했습니다."
  }

  return <HomePage data={data} errorMessage={errorMessage} />
}
