"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Eye, Heart, ImageOff } from "lucide-react";
import type { ProjectSearchItem } from "@/entities/project";
import { getProjectDetailPath } from "@/shared/config";

/** 검색 썸네일이 없거나 실패하면 동일한 배치의 대체 모양을 표시한다. */
export function ProjectThumbnail({
  url,
  list = false,
}: {
  url: string | null;
  list?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  /** 하이드레이션 전에 이미 실패한 외부 이미지도 대체 모양으로 전환한다. */
  const attachImage = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth === 0) setFailedUrl(url);
    },
    [url],
  );
  const className = list
    ? "absolute inset-0 h-full w-full object-cover"
    : "block aspect-[16/10] w-full object-cover";
  return (
    <div className={list ? "relative w-[112px] shrink-0 self-stretch" : ""}>
      {url && failedUrl !== url ? (
        // eslint-disable-next-line @next/next/no-img-element -- API의 동적 외부 URL을 원격 최적화 없이 표시하고 실패를 처리한다.
        <img
          ref={attachImage}
          src={url}
          alt=""
          onError={() => setFailedUrl(url)}
          className={className}
        />
      ) : (
        <div
          className={
            className +
            " flex flex-col items-center justify-center gap-1.5 bg-main-22 text-[13px] font-semibold text-main-12"
          }
        >
          <ImageOff
            className="size-[26px]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span>썸네일 없음</span>
        </div>
      )}
    </div>
  );
}

/** 검색 결과 작성자 및 실제 조회와 좋아요 수치를 표시한다. */
export function ProjectMeta({ project }: { project: ProjectSearchItem }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px]">
      <span className="truncate font-semibold text-gray-03">
        {project.users[0]?.name?.trim() || "작성자 정보 없음"}
      </span>
      <span className="inline-flex shrink-0 gap-3 text-gray-05">
        <span
          className="inline-flex items-center gap-1"
          aria-label={"조회 " + project.viewCount}
        >
          <Eye className="size-[15px]" strokeWidth={1.75} aria-hidden="true" />
          {project.viewCount.toLocaleString()}
        </span>
        <span
          className="inline-flex items-center gap-1"
          aria-label={"좋아요 " + project.likeCount}
        >
          <Heart
            className="size-[15px]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          {project.likeCount.toLocaleString()}
        </span>
      </span>
    </div>
  );
}

/** 한 줄에 들어가는 태그만 표시하고 넘치는 태그는 통째로 숨긴다. */
export function ProjectTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex h-[25px] flex-wrap gap-1.5 overflow-hidden">
      {tags.map((tag, index) => (
        <span
          key={tag + index}
          className="inline-flex h-[25px] max-w-full shrink-0 items-center overflow-hidden rounded-full border border-[#E3E9F0] bg-[#F5F8FB] px-2.5 text-[11.5px] whitespace-nowrap text-gray-03"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/** 검색 결과를 균일한 이미지 비율의 전체 링크 카드로 조합한다. */
export function ProjectCard({ project }: { project: ProjectSearchItem }) {
  return (
    <Link
      href={getProjectDetailPath(project.projectId)}
      data-project-card
      className="flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#E3E9F0] bg-[#FDFEFF] shadow-[0_1px_2px_rgb(0_29_53/.05),0_8px_24px_-14px_rgb(0_29_53/.22)] hover:border-main-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10"
    >
      <ProjectThumbnail url={project.thumbnailUrl} />
      <div className="flex flex-1 flex-col gap-2 px-[18px] pt-4 pb-[18px]">
        <span className="text-[12.5px] font-bold text-main-10">
          {project.tags[0]}
        </span>
        <h2 className="line-clamp-2 text-[17px] leading-[1.45] font-bold break-keep text-main-00">
          {project.title}
        </h2>
        {project.description && (
          <p className="line-clamp-2 text-[13.5px] leading-[1.6] text-gray-05">
            {project.description}
          </p>
        )}
        <ProjectTags tags={project.tags} />
        <div className="mt-auto border-t border-[#E3E9F0] pt-3">
          <ProjectMeta project={project} />
        </div>
      </div>
    </Link>
  );
}
