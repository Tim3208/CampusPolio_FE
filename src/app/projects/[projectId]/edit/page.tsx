import { notFound } from "next/navigation"

import { ProjectEditorPage } from "@/widgets/project"

type PageProps = {
  params: Promise<{
    projectId: string
  }>
}

/**
 * 기존 프로젝트 수정 페이지를 렌더링한다.
 * @param props 라우트 params
 * @returns 프로젝트 수정 페이지
 */
export default async function Page({ params }: PageProps) {
  const { projectId } = await params
  const parsedProjectId = Number(projectId)

  if (!Number.isSafeInteger(parsedProjectId) || parsedProjectId <= 0) {
    notFound()
  }

  return <ProjectEditorPage mode="edit" projectId={parsedProjectId} />
}
