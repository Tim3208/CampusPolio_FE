"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
} from "lucide-react";

import type { HomeData, HomeProject } from "@/entities/project";
import { appRoutes, getProjectDetailPath } from "@/shared/config";

type HomePageProps = {
  data?: HomeData;
  errorMessage?: string;
};

const allCategoryLabel = "전체";

/**
 * 조회수를 사용자가 읽기 쉬운 짧은 숫자 표기로 변환한다.
 * @param count API에서 받은 조회수
 * @returns 카드에 표시할 조회수 문자열
 */
function formatCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  }

  return String(count);
}

/**
 * 홈 API의 카테고리별 프로젝트를 중복 없는 프로젝트 목록으로 평탄화한다.
 * @param data 메인 페이지 API 응답
 * @returns projectId 기준으로 중복이 제거된 프로젝트 목록
 */
function getUniqueCategoryProjects(data?: HomeData) {
  const projects =
    data?.categories.flatMap((category) => category.projects) ?? [];
  const projectMap = new Map<number, HomeProject>();

  projects.forEach((project) => {
    projectMap.set(project.projectId, project);
  });

  return Array.from(projectMap.values());
}

export function HomePage({ data, errorMessage }: HomePageProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(allCategoryLabel);
  const categoryLabels = useMemo(
    () => [
      allCategoryLabel,
      ...(data?.categories.map((category) => category.tag) ?? []),
    ],
    [data?.categories],
  );
  const categoryProjects = useMemo(
    () => getUniqueCategoryProjects(data),
    [data],
  );
  const filteredFeaturedProjects =
    selectedCategory === allCategoryLabel
      ? (data?.popularProjects ?? [])
      : (data?.categories.find((category) => category.tag === selectedCategory)
          ?.projects ?? []);
  const projects =
    categoryProjects.length > 0
      ? categoryProjects
      : (data?.popularProjects ?? []);
  const maxSlideIndex = Math.max(filteredFeaturedProjects.length - 3, 0);
  const totalProjectCount = projects.length;

  const handlePrev = () => {
    setSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setSlideIndex((prev) => Math.min(prev + 1, maxSlideIndex));
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSlideIndex(0);
  };

  return (
    <main className="min-h-screen bg-[#F5F8FB]">
      <section className="mx-auto w-full max-w-7xl px-6 py-10">
        <section className="mb-20">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">주요 전시</h2>
              <p className="mt-2 text-sm text-slate-500">
                실시간으로 주목받는 학생들의 프로젝트를 둘러보세요.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={appRoutes.projects}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#005E9C]"
              >
                전체 컬렉션 보기
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>

              <button
                type="button"
                onClick={handlePrev}
                disabled={slideIndex === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
                aria-label="이전 프로젝트 보기"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={slideIndex === maxSlideIndex}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
                aria-label="다음 프로젝트 보기"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categoryLabels.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "bg-[#005E9C] text-white"
                    : "bg-white text-slate-500 hover:bg-slate-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {errorMessage ? (
            <HomeNotice
              message={errorMessage}
              title="프로젝트를 불러오지 못했습니다"
            />
          ) : filteredFeaturedProjects.length > 0 ? (
            <div className="overflow-hidden">
              <div
                className="flex gap-4 transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(calc(-${slideIndex} * (33.333% + 1rem)))`,
                }}
              >
                {filteredFeaturedProjects.map((project) => (
                  <FeaturedCard key={project.projectId} project={project} />
                ))}
              </div>
            </div>
          ) : (
            <HomeNotice message="해당 카테고리의 프로젝트가 없습니다." />
          )}
        </section>

        <section className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-950">프로젝트 모음</h2>

            <p className="mt-2 max-w-xl text-sm text-slate-500">
              여러 학생들의 프로젝트 작품을 볼 수 있는 공간입니다. 관심 있는
              주제를 선택해 더 자세한 기록을 확인해보세요.
            </p>
          </div>

          {errorMessage ? (
            <HomeNotice
              message={errorMessage}
              title="프로젝트 목록을 불러오지 못했습니다"
            />
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.projectId} project={project} />
              ))}
            </div>
          ) : (
            <HomeNotice message="아직 공개된 프로젝트가 없습니다." />
          )}
        </section>

        <section className="overflow-hidden rounded-lg bg-[#006DAA] px-10 py-10 text-white shadow-sm">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-xs font-semibold text-blue-100">
                프로젝트 아카이브
              </p>

              <h2 className="text-3xl font-bold">새 프로젝트를 공유해보세요</h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-50">
                수업, 연구, 창작 과정에서 만든 결과물을 캠퍼스폴리오에 남기고
                다른 학생들과 연결해보세요.
              </p>

              <div className="mt-7 flex gap-3">
                <Link
                  href={appRoutes.projectCreate}
                  className="rounded-md bg-white px-5 py-2 text-xs font-semibold text-[#006DAA]"
                >
                  작품 등록하기
                </Link>

                <Link
                  href={appRoutes.mypageProjects}
                  className="rounded-md bg-white/15 px-5 py-2 text-xs font-semibold text-white"
                >
                  내 프로젝트 보기
                </Link>
              </div>
            </div>

            <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white/10">
              <div className="absolute h-32 w-32 rounded-full bg-white/10" />

              <div className="z-10 text-center">
                <p className="text-3xl font-bold">
                  {data?.popularProjects.length ?? 0}
                </p>
                <p className="text-xs text-blue-100">POPULAR</p>

                <div className="my-4 h-px bg-white/30" />

                <p className="text-3xl font-bold">{totalProjectCount}</p>
                <p className="text-xs text-blue-100">TOTAL</p>
              </div>
            </div>
          </div>
        </section>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026. CampusPolio. All rights reserved.</p>

          <div className="flex gap-6">
            <span>이용약관</span>
            <span>개인정보 처리방침</span>
            <span>문의하기</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

type HomeNoticeProps = {
  title?: string;
  message: string;
};

function HomeNotice({ message, title }: HomeNoticeProps) {
  return (
    <div className="rounded-md bg-white p-10 text-center">
      {title ? (
        <p className="mb-2 text-base font-bold text-slate-900">{title}</p>
      ) : null}
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function FeaturedCard({ project }: { project: HomeProject }) {
  return (
    <article className="group relative min-w-[85%] overflow-hidden rounded-lg bg-slate-900 shadow-sm md:min-w-[calc((100%-2rem)/3)]">
      {project.thumbnailUrl ? (
        <div
          className="h-72 bg-cover bg-center transition duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
        />
      ) : (
        <div className="flex h-72 items-center justify-center bg-slate-200 text-sm font-medium text-slate-500">
          썸네일 없음
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <span className="w-fit rounded bg-[#005E9C] px-2 py-1 text-[10px] font-bold">
          {project.tag}
        </span>

        <h3 className="mt-3 text-xl font-bold">{project.title}</h3>

        <p className="mt-1 text-xs text-white/70">by {project.authorName}</p>

        <ProjectStats project={project} variant="featured" />

        <div className="mt-5 translate-y-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={getProjectDetailPath(project.projectId)}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900"
          >
            자세히 보기
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: HomeProject }) {
  return (
    <article className="group overflow-hidden rounded-md bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative overflow-hidden">
        {project.thumbnailUrl ? (
          <div
            className="h-48 bg-cover bg-center transition duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-slate-200 text-sm font-medium text-slate-500">
            썸네일 없음
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/35" />

        <Link
          href={getProjectDetailPath(project.projectId)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 opacity-0 transition group-hover:opacity-100"
        >
          자세히 보기
        </Link>
      </div>

      <div className="p-5">
        <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#005E9C]">
          {project.tag}
        </span>

        <h3 className="mt-4 text-lg font-bold text-slate-950">
          {project.title}
        </h3>

        <p className="mt-1 text-xs text-slate-400">by {project.authorName}</p>

        <ProjectStats project={project} />
      </div>
    </article>
  );
}

function ProjectStats({
  project,
  variant = "default",
}: {
  project: HomeProject;
  variant?: "default" | "featured";
}) {
  const className =
    variant === "featured"
      ? "mt-4 flex items-center gap-4 text-xs text-white/80"
      : "mt-4 flex items-center gap-4 text-xs text-slate-500";

  return (
    <div className={className}>
      <span className="inline-flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" aria-hidden="true" />
        {formatCount(project.likeCount)}
      </span>

      <span className="inline-flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        {formatCount(project.viewCount)}
      </span>
    </div>
  );
}
