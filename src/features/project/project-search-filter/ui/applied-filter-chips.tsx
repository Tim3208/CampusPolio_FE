"use client";
import Link from "next/link";
import { RotateCcw, X } from "lucide-react";
import type { ProjectSearchQuery } from "@/entities/project";
import {
  getProjectsHref,
  type ProjectCollectionViewMode,
} from "../lib/search-query";

/** 적용된 검색어와 태그를 각각 해제하고 보기 방식은 유지한 채 조건을 초기화한다. */
export function AppliedFilterChips({
  query,
  viewMode,
  showReset = true,
}: {
  query: ProjectSearchQuery;
  viewMode: ProjectCollectionViewMode;
  showReset?: boolean;
}) {
  if (!query.keyword && !query.tags?.length) return null;
  const chips = [
    ...(query.keyword
      ? [
          {
            key: "keyword",
            label: "검색어: " + query.keyword,
            href: getProjectsHref(
              { ...query, keyword: undefined, page: 0 },
              viewMode,
            ),
          },
        ]
      : []),
    ...(query.tags ?? []).map((tag) => ({
      key: "tag-" + tag,
      label: tag,
      href: getProjectsHref(
        {
          ...query,
          tags: query.tags?.filter((value) => value !== tag),
          page: 0,
        },
        viewMode,
      ),
    })),
  ];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E3E9F0] bg-[#FDFEFF] px-3.5 py-3">
      <span className="hidden text-[13px] font-bold text-gray-03 lg:inline">
        적용된 조건
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          aria-label={chip.label + " 해제"}
          className="inline-flex min-h-9 max-w-full items-center gap-1 rounded-full bg-main-22 px-3 text-[13.5px] text-main-00 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10"
        >
          <span className="min-w-0 break-all">{chip.label}</span>
          <X
            className="size-3.5 shrink-0"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </Link>
      ))}
      {showReset && (
        <Link
          href={getProjectsHref({}, viewMode)}
          className="inline-flex min-h-9 items-center gap-1 px-2 text-[13.5px] font-semibold text-gray-03 lg:ml-auto"
        >
          <RotateCcw
            className="size-[15px]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          전체 조건 초기화
        </Link>
      )}
    </div>
  );
}
