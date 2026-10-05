"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomeProject } from "@/entities/project";
import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { FeaturedProjectCard } from "./featured-project-card";

/** 실제 가로 스크롤 위치와 크기에 맞춰 강조 카드의 이동 버튼 상태를 갱신한다. */
export function FeaturedProjectSlider({
  projects,
}: {
  projects: HomeProject[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ first: true, last: true });
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    /** 수동 스크롤과 반응형 크기 변경 뒤 실제 양 끝 위치를 판별한다. */
    function updateEdges() {
      if (!track) return;
      const first = track.scrollLeft <= 1;
      const last =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
      setEdges((previous) =>
        previous.first === first && previous.last === last
          ? previous
          : { first, last },
      );
    }
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
    track.addEventListener("scroll", updateEdges, { passive: true });
    updateEdges();
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateEdges);
    };
  }, [projects]);
  /** 한 카드와 실제 간격만큼 스크롤하며 감소 모션 설정을 존중한다. */
  function move(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const width =
      track.firstElementChild?.getBoundingClientRect().width ??
      track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (width + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  const controls = (
    <div className="flex items-center gap-2">
      {projects.length > 0 && (
        <>
          <Button
            size="icon-xl"
            variant="outline"
            aria-label="이전 프로젝트"
            disabled={edges.first}
            onClick={() => move(-1)}
            className="border-[#CBD6E2] bg-[#FDFEFF] text-gray-03 disabled:border-[#E3E9F0] disabled:bg-[#F5F8FB] disabled:text-gray-08 disabled:opacity-100 md:size-10"
          >
            <ChevronLeft
              className="size-[18px]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Button>
          <Button
            size="icon-xl"
            variant="outline"
            aria-label="다음 프로젝트"
            disabled={edges.last}
            onClick={() => move(1)}
            className="border-[#CBD6E2] bg-[#FDFEFF] text-gray-03 disabled:border-[#E3E9F0] disabled:bg-[#F5F8FB] disabled:text-gray-08 disabled:opacity-100 md:size-10"
          >
            <ChevronRight
              className="size-[18px]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Button>
        </>
      )}
    </div>
  );
  const allLink = (
    <Link
      href={appRoutes.projects}
      className="inline-flex items-center gap-1 text-[14px] font-bold text-main-10"
    >
      전체 프로젝트 보기
      <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
  return (
    <section className="flex flex-col gap-4 md:gap-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[22px] font-extrabold tracking-tight text-main-00 md:text-[28px]">
          주요 프로젝트
        </h2>
        <div className="hidden items-center gap-3 md:flex">
          {allLink}
          {controls}
        </div>
      </div>
      {projects.length > 0 && (
        <div
          ref={trackRef}
          data-featured-track
          className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [scroll-padding-inline:16px] md:mx-0 md:gap-6 md:px-0 md:[scroll-padding-inline:0px]"
        >
          {projects.map((project) => (
            <FeaturedProjectCard key={project.projectId} project={project} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between md:hidden">
        {controls}
        {allLink}
      </div>
    </section>
  );
}
