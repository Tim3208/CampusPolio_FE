"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  FolderOpen,
  ImageOff,
  RotateCw,
  SearchX,
  Upload,
  WifiOff,
} from "lucide-react";
import type { HomeData, HomeProject } from "@/entities/project";
import { getProjectsHref } from "@/features/project/project-search-filter";
import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { FeaturedProjectSlider } from "./featured-project-slider";
import { ProjectCard } from "./project-card";

/** 홈 응답의 카테고리 프로젝트를 프로젝트 ID 기준으로 중복 제거한다. */
function getUniqueCategoryProjects(data?: HomeData) {
  const projects = new Map<number, HomeProject>();
  data?.categories.forEach((category) =>
    category.projects.forEach((project) =>
      projects.set(project.projectId, project),
    ),
  );
  return [...projects.values()];
}

/** 기존 홈 조회 데이터를 인기 스크롤 트랙과 분야별 그리드로 조합한다. */
export function HomePage({
  data,
  errorMessage,
}: {
  data?: HomeData;
  errorMessage?: string;
}) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const allProjects = useMemo(() => getUniqueCategoryProjects(data), [data]);
  const category = data?.categories.find(
    (item) => item.tag === selectedCategory,
  );
  const selectedTag = category?.tag ?? null;
  const projects = selectedTag ? category!.projects : allProjects;
  return (
    <main className="min-h-screen bg-[#F5F8FB] text-gray-01">
      <div className="mx-auto max-w-[1440px] px-4 pt-7 md:px-8 md:pt-10 lg:px-10 lg:pt-12 xl:px-12 xl:pt-14">
        {errorMessage ? (
          <HomeNotice
            title="프로젝트를 불러오지 못했어요"
            message="네트워크 상태를 확인하고 다시 시도해 주세요."
            error
          >
            <Button
              size="xl"
              className="bg-main-10 text-white hover:bg-main-11 md:h-10"
              onClick={() => router.refresh()}
            >
              <RotateCw
                className="size-[18px]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              다시 시도
            </Button>
          </HomeNotice>
        ) : (
          <>
            <FeaturedProjectSlider projects={data?.popularProjects ?? []} />
            {!data?.popularProjects.length && (
              <div className="mt-4">
                <HomeNotice
                  title="아직 소개할 프로젝트가 없어요"
                  message="첫 프로젝트를 등록하면 이곳에 소개돼요."
                >
                  <Button
                    asChild
                    size="xl"
                    className="bg-main-10 text-white hover:bg-main-11 md:h-10"
                  >
                    <Link href={appRoutes.projectCreate}>
                      <Upload
                        className="size-[18px]"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      작품 등록하기
                    </Link>
                  </Button>
                </HomeNotice>
              </div>
            )}
            <section className="mt-11 flex flex-col gap-4 md:mt-14 md:gap-6 xl:mt-[72px]">
              <h2 className="text-[22px] font-extrabold tracking-tight text-main-00 md:text-[28px]">
                분야별 프로젝트
              </h2>
              <div
                className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0"
                aria-label="프로젝트 분야"
              >
                {[
                  null,
                  ...new Set(data?.categories.map((item) => item.tag) ?? []),
                ].map((tag) => (
                  <button
                    key={tag ?? "all"}
                    type="button"
                    aria-pressed={selectedTag === tag}
                    onClick={() => setSelectedCategory(tag)}
                    className={
                      "h-9 shrink-0 rounded-full border px-3.5 text-[13.5px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10 " +
                      (selectedTag === tag
                        ? "border-main-10 bg-main-10 text-white"
                        : "border-[#CBD6E2] bg-[#FDFEFF] text-gray-03 hover:border-main-20")
                    }
                  >
                    {tag ?? "전체"}
                  </button>
                ))}
              </div>
              {projects.length ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard key={project.projectId} project={project} />
                  ))}
                </div>
              ) : (
                <HomeNotice
                  title={
                    selectedTag
                      ? selectedTag + " 프로젝트가 아직 없어요"
                      : "아직 소개할 프로젝트가 없어요"
                  }
                  message="다른 분야를 고르거나 전체 목록을 확인해 보세요."
                >
                  <Button
                    size="xl"
                    variant="outline"
                    className="border-[#CBD6E2] bg-[#FDFEFF] text-gray-03 md:h-10"
                    onClick={() => setSelectedCategory(null)}
                  >
                    전체 분야 보기
                  </Button>
                </HomeNotice>
              )}
              <div className="flex justify-center">
                <Button
                  asChild
                  size="xl"
                  variant="outline"
                  className="w-full border-[#CBD6E2] bg-[#FDFEFF] text-gray-03 md:h-10 md:w-auto"
                >
                  <Link
                    href={getProjectsHref({
                      tags: selectedTag ? [selectedTag] : [],
                    })}
                  >
                    {selectedTag
                      ? selectedTag + " 프로젝트 더 보기"
                      : "전체 프로젝트 보기"}
                    <ArrowRight
                      className="size-[18px]"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </div>
            </section>
          </>
        )}
        <section className="mt-11 grid overflow-hidden rounded-[14px] bg-main-00 text-white md:mt-14 md:grid-cols-[1.15fr_.85fr] xl:mt-[72px]">
          <div className="order-2 flex flex-col justify-center gap-4 px-5 py-6 md:order-1 md:gap-6 md:p-8 xl:p-12">
            <h2 className="text-[22px] leading-[1.3] font-extrabold tracking-tight break-keep md:text-[30px]">
              새 프로젝트를 공유해보세요
            </h2>
            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
              <Button
                asChild
                size="xl"
                className="w-full bg-[#FDFEFF] text-main-00 hover:bg-main-22 focus-visible:ring-main-20 md:w-auto"
              >
                <Link href={appRoutes.projectCreate}>
                  <Upload
                    className="size-[18px]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  작품 등록하기
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="w-full border-white bg-transparent text-white hover:bg-white/10 hover:text-white focus-visible:ring-main-20 md:w-auto"
              >
                <Link href={appRoutes.mypageProjects}>내 프로젝트 보기</Link>
              </Button>
            </div>
          </div>
          <div className="order-1 aspect-video bg-main-12 md:order-2 md:aspect-auto md:min-h-[280px]">
            {photoFailed ? (
              <div className="flex h-full items-center justify-center gap-2 text-main-22">
                <ImageOff
                  className="size-[26px]"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span>이미지를 불러오지 못했어요</span>
              </div>
            ) : (
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="https://picsum.photos/seed/campuspolio-studio-desk/720/405"
                />
                {/* 승인된 외부 임시 사진을 picture 안에서 직접 표시하고 실패를 처리한다. */}
                <img
                  src="https://picsum.photos/seed/campuspolio-studio-desk/900/560"
                  alt=""
                  onError={() => setPhotoFailed(true)}
                  className="h-full w-full object-cover"
                />
              </picture>
            )}
          </div>
        </section>
      </div>
      <HomeFooter />
    </main>
  );
}

/** 홈의 빈 데이터와 오류 상태에서 이유와 실제 행동 버튼을 함께 표시한다. */
function HomeNotice({
  title,
  message,
  children,
  error = false,
}: {
  title: string;
  message: string;
  children: React.ReactNode;
  error?: boolean;
}) {
  const Icon = error ? WifiOff : title.includes("소개") ? FolderOpen : SearchX;
  return (
    <div
      role={error ? "alert" : undefined}
      className={
        "flex flex-col items-center gap-2.5 rounded-[14px] border border-[#CBD6E2] bg-[#FDFEFF] px-6 py-10 text-center " +
        (error ? "border-solid" : "border-dashed")
      }
    >
      <span className="mb-1 grid size-[52px] place-items-center rounded-[14px] bg-main-22 text-main-10">
        <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="text-[17px] font-bold text-main-00">{title}</h3>
      <p className="mb-2 max-w-[32ch] text-sm leading-relaxed text-gray-05">
        {message}
      </p>
      {children}
    </div>
  );
}

/** 목적 페이지가 없는 기존 푸터 항목을 비인터랙티브 텍스트로 유지한다. */
function HomeFooter() {
  return (
    <footer className="mt-10 border-t border-[#E3E9F0] bg-[#FDFEFF] md:mt-[72px]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-[22px] text-[13px] text-gray-05 md:flex-row md:justify-between md:px-8 md:py-7 xl:px-12">
        <p>Copyright 2026. CampusPolio. All rights reserved.</p>
        <div className="flex flex-wrap gap-3.5 md:gap-5">
          <span>이용약관</span>
          <span>개인정보 처리방침</span>
          <span>문의하기</span>
        </div>
      </div>
    </footer>
  );
}
