"use client";
import Link from "next/link";
import type { ProjectSearchItem } from "@/entities/project";
import { getProjectDetailPath } from "@/shared/config";
import { ProjectMeta, ProjectTags, ProjectThumbnail } from "./project-card";

/** 제목 두 줄과 카드 높이를 채우는 112px 썸네일을 가진 리스트 항목을 표시한다. */
export function ProjectListItem({ project }: { project: ProjectSearchItem }) {
  return (
    <Link
      href={getProjectDetailPath(project.projectId)}
      data-project-list-item
      className="flex min-h-[112px] overflow-hidden rounded-[14px] border border-[#E3E9F0] bg-[#FDFEFF] shadow-sm hover:border-main-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10"
    >
      <ProjectThumbnail url={project.thumbnailUrl} list />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3.5 py-3">
        <span className="text-[12.5px] font-bold text-main-10">
          {project.tags[0]}
        </span>
        <h2 className="line-clamp-2 text-[15px] leading-[1.45] font-bold break-keep text-main-00">
          {project.title}
        </h2>
        <ProjectTags tags={project.tags} />
        <div className="mt-auto">
          <ProjectMeta project={project} />
        </div>
      </div>
    </Link>
  );
}
