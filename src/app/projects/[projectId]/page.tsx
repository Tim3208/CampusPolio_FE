import { getMockProjectDetail } from "@/entities/project";
import { ProjectDetailPage } from "@/widgets/project-detail";

type PageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

/**
 * 프로젝트 상세 페이지 라우트를 렌더링한다.
 * @param params URL에서 전달된 프로젝트 ID
 */
export default async function Page({ params }: PageProps) {
  const { projectId } = await params;
  const parsedProjectId = Number(projectId);
  const project = getMockProjectDetail(
    Number.isNaN(parsedProjectId) ? 1 : parsedProjectId
  );

  return <ProjectDetailPage project={project} />;
}
