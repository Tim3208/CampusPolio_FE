"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HomeProject } from "@/entities/project";
import { getProjectDetailPath } from "@/shared/config";
import { HomeThumbnail } from "./project-card";

/** 인기 프로젝트 전체를 하나의 링크로 만들고 자세히 보기를 항상 표시한다. */
export function FeaturedProjectCard({ project }: { project: HomeProject }) {
  return (
    <Link
      href={getProjectDetailPath(project.projectId)}
      className="relative block aspect-[5/6] w-[290px] shrink-0 snap-start overflow-hidden rounded-[14px] bg-main-00 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10 md:aspect-[4/3] md:w-[400px] lg:w-[480px]"
      data-featured-card
    >
      <HomeThumbnail
        url={project.thumbnailUrl}
        dark
        className="absolute inset-0 h-full"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_29_53/.94)_0%,rgb(0_29_53/.62)_38%,rgb(0_29_53/0)_72%)]" />
      <div className="absolute right-4 bottom-4 left-4 flex flex-col gap-1.5 md:right-6 md:bottom-[22px] md:left-6 md:gap-2">
        <span className="text-[12.5px] font-bold text-main-21">
          {project.tag}
        </span>
        <h3 className="line-clamp-2 text-lg leading-[1.35] font-extrabold break-keep md:text-[22px]">
          {project.title}
        </h3>
        <div className="flex items-center justify-between gap-2.5 pt-1.5 text-[13px]">
          <span className="truncate text-white/85">
            {project.authorName?.trim() || "작성자 정보 없음"}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 font-bold">
            자세히 보기
            <ArrowUpRight
              className="size-4"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
