"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { ProjectSearchQuery } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import {
  getProjectsHref,
  type ProjectCollectionViewMode,
} from "../lib/search-query";
import { ProjectTagFilterList } from "./project-tag-filter-list";

/** 적용된 태그의 복사본을 편집하고 적용 버튼에서만 URL에 반영한다. */
export function ProjectTagFilterSheet({
  query,
  viewMode,
}: {
  query: ProjectSearchQuery;
  viewMode: ProjectCollectionViewMode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const firstInputRef = useRef<HTMLInputElement>(null);
  /** 열 때 현재 조건을 복사하고 닫을 때 편집 내용을 버린다. */
  function handleOpenChange(nextOpen: boolean) {
    setDraftTags(nextOpen ? [...(query.tags ?? [])] : []);
    setOpen(nextOpen);
  }
  /** 초안을 새 검색 조건으로 적용하고 시트를 닫는다. */
  function handleApply() {
    router.push(
      getProjectsHref({ ...query, tags: draftTags, page: 0 }, viewMode),
    );
    handleOpenChange(false);
  }
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="xl"
          className="border-[#CBD6E2] bg-[#FDFEFF] px-3.5 text-gray-03 md:h-10"
        >
          <SlidersHorizontal
            className="size-[18px]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          필터
          {Boolean(query.tags?.length) && (
            <span className="rounded-full bg-main-22 px-2 py-0.5 text-xs font-bold text-main-10">
              {query.tags?.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          firstInputRef.current?.focus();
        }}
        className="top-24 max-h-none gap-0 rounded-t-[20px] p-0 [&>button]:top-6 [&>button]:right-3"
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-2.5 mb-0.5 h-1 w-10 shrink-0 rounded bg-[#CBD6E2]"
        />
        <SheetHeader className="gap-0 px-5 py-2 pr-16">
          <SheetTitle className="text-[18px]">태그 필터</SheetTitle>
          <SheetDescription className="sr-only">
            태그를 선택하고 적용하기를 누르면 검색 조건이 변경됩니다.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <ProjectTagFilterList
            tags={draftTags}
            onChange={setDraftTags}
            firstInputRef={firstInputRef}
            sheet
          />
        </div>
        <SheetFooter className="mt-0 flex-row gap-2 border-t border-[#E3E9F0] px-4 pt-3.5 pb-[18px]">
          <Button
            variant="outline"
            size="xl"
            className="border-[#CBD6E2] bg-[#FDFEFF] text-gray-03"
            onClick={() => setDraftTags([])}
          >
            선택 초기화
          </Button>
          <Button
            size="xl"
            className="flex-1 bg-main-10 text-white hover:bg-main-11"
            onClick={handleApply}
          >
            적용하기 ({draftTags.length})
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
