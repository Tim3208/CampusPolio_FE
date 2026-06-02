import { headers } from "next/headers"

import { getMyProjects, type MyProject } from "@/entities/project"
import { MypageProjectsPage } from "@/widgets/mypage"

type ProjectsPageState = {
  projects: MyProject[]
  errorMessage?: string
}

/**
 * 마이페이지 프로젝트 모음에 필요한 초기 데이터를 서버에서 조회한다.
 * @returns 프로젝트 목록 또는 오류 메시지
 */
async function getProjectsPageState(): Promise<ProjectsPageState> {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  if (!cookie) {
    return {
      errorMessage: "로그인이 필요합니다.",
      projects: [],
    }
  }

  try {
    const projectsPage = await getMyProjects(
      {
        page: 0,
        status: "ALL",
      },
      {
        headers: {
          cookie,
        },
      }
    )

    return {
      projects: projectsPage.content,
    }
  } catch (error) {
    return {
      errorMessage:
        error instanceof Error
          ? error.message
          : "프로젝트 목록을 불러오지 못했습니다.",
      projects: [],
    }
  }
}

/**
 * 내 프로젝트 모음 탭 라우트를 렌더링한다.
 * @returns 프로젝트 모음 화면
 */
export default async function Page() {
  const projectsPageState = await getProjectsPageState()

  return <MypageProjectsPage {...projectsPageState} />
}
