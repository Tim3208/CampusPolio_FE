"use client";
import { useCallback, useState } from "react";
import Link from "next/link";
import { Eye, Heart, ImageOff } from "lucide-react";
import type { HomeProject } from "@/entities/project";
import { getProjectDetailPath } from "@/shared/config";

/** 동적 외부 썸네일의 누락이나 로딩 실패를 동일 크기의 대체 모양으로 표시한다. */
export function HomeThumbnail({
  url,
  className = "",
  dark = false,
}: {
  url: string | null;
  className?: string;
  dark?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  /** 하이드레이션 전에 이미 실패한 외부 이미지도 대체 모양으로 전환한다. */
  const attachImage = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth === 0) setFailedUrl(url);
    },
    [url],
  );
  return url && failedUrl !== url ? (
    // eslint-disable-next-line @next/next/no-img-element -- API의 동적 외부 URL을 원격 최적화 없이 표시하고 실패를 처리한다.
    <img
      ref={attachImage}
      src={url}
      alt=""
      onError={() => setFailedUrl(url)}
      className={"block h-full w-full object-cover " + className}
    />
  ) : (
    <div
      className={
        "flex flex-col items-center justify-center gap-1.5 text-[13px] font-semibold " +
        (dark ? "bg-main-12 text-main-22 " : "bg-main-22 text-main-12 ") +
        className
      }
    >
      <ImageOff className="size-[26px]" strokeWidth={1.75} aria-hidden="true" />
      <span>썸네일 없음</span>
    </div>
  );
}

/** 홈 API의 조회와 좋아요 수치를 접근 가능한 한국어 라벨과 함께 표시한다. */
export function HomeProjectStats({ project }: { project: HomeProject }) {
  const viewCount = project.viewCount ?? 0;
  const likeCount = project.likeCount ?? 0;

  return (
    <span className="inline-flex shrink-0 gap-3 text-[13px] text-gray-05">
      <span
        className="inline-flex items-center gap-1"
        aria-label={"조회 " + viewCount}
      >
        <Eye className="size-[15px]" strokeWidth={1.75} aria-hidden="true" />
        {viewCount.toLocaleString()}
      </span>
      <span
        className="inline-flex items-center gap-1"
        aria-label={"좋아요 " + likeCount}
      >
        <Heart className="size-[15px]" strokeWidth={1.75} aria-hidden="true" />
        {likeCount.toLocaleString()}
      </span>
    </span>
  );
}

/** 분야별 프로젝트를 실제 홈 API 필드만 사용하는 상세 링크 카드로 표시한다. */
export function ProjectCard({ project }: { project: HomeProject }) {
  return (
    <Link
      href={getProjectDetailPath(project.projectId)}
      className="flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#E3E9F0] bg-[#FDFEFF] shadow-[0_1px_2px_rgb(0_29_53/.05),0_8px_24px_-14px_rgb(0_29_53/.22)] hover:border-main-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10"
    >
      <HomeThumbnail
        url={project.thumbnailUrl}
        className="aspect-[16/10] !h-auto"
      />
      <div className="flex flex-1 flex-col gap-2 px-[18px] pt-4 pb-[18px]">
        <span className="text-[12.5px] font-bold text-main-10">
          {project.tag}
        </span>
        <h3 className="line-clamp-2 text-[17px] leading-[1.45] font-bold break-keep text-main-00">
          {project.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E3E9F0] pt-3">
          <span className="truncate text-[13px] font-semibold text-gray-03">
            {project.authorName?.trim() || "작성자 정보 없음"}
          </span>
          <HomeProjectStats project={project} />
        </div>
      </div>
    </Link>
  );
}
