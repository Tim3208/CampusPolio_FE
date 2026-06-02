import { notFound } from "next/navigation"

import { getProject, type ProjectDetail } from "@/entities/project"
import { ApiError } from "@/shared/api"
import { ProjectDetailPage } from "@/widgets/project"

type PageProps = {
  params: Promise<{
    projectId: string
  }>
}

export const dynamic = "force-dynamic"

/**
 * 프로젝트 상세 데이터를 조회하고 상세 화면을 렌더링한다.
 * @param props 라우트 params
 * @returns 프로젝트 상세 페이지 UI
 */
export default async function Page({ params }: PageProps) {
  const { projectId } = await params
  const parsedProjectId = Number(projectId)
  let project: ProjectDetail | undefined
  let errorMessage: string | undefined

  if (!Number.isSafeInteger(parsedProjectId) || parsedProjectId <= 0) {
    notFound()
  }

  try {
    project = await getProject(parsedProjectId)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }

    errorMessage =
      error instanceof Error
        ? error.message
        : "프로젝트 상세 정보를 불러오지 못했습니다."
  }

  return <ProjectDetailPage errorMessage={errorMessage} project={project} />
}
