"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Grid2X2,
  Heart,
  ImageIcon,
  List,
  Palette,
  Search,
  Settings,
  Upload,
  UsersRound,
} from "lucide-react";

import type {
  ProjectSearchFilterType,
  ProjectSearchItem,
  ProjectSearchPage,
  ProjectSearchQuery,
} from "@/entities/project";
import { appRoutes, getProjectDetailPath } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

type ProjectCollectionPageProps = {
  errorMessage?: string;
  projectsPage: ProjectSearchPage;
  query: ProjectSearchQuery;
  viewMode: ViewMode;
};

type ViewMode = "grid" | "list";

const featuredTags = [
  { icon: Palette, label: "시각 디자인" },
  { icon: Building2, label: "건축학" },
  { icon: BookOpen, label: "신학" },
  { icon: UsersRound, label: "공학" },
  { icon: ImageIcon, label: "인문학" },
] as const;

const quickTags = ["졸업작품", "논문", "디자인", "역사"] as const;

/**
 * 프로젝트 검색 URL을 생성한다.
 * @param query 검색 조건
 * @returns 프로젝트 모음 페이지 경로
 */
function getProjectsHref(
  query: ProjectSearchQuery,
  viewMode: ViewMode = "grid",
) {
  const params = new URLSearchParams();

  if (query.keyword?.trim()) {
    params.set("keyword", query.keyword.trim());
  }

  query.tags
    ?.map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => params.append("tags", tag));

  if (query.page && query.page > 0) {
    params.set("page", String(query.page));
  }

  if (query.filterType && query.filterType !== "LATEST") {
    params.set("filterType", query.filterType);
  }

  if (viewMode === "list") {
    params.set("view", viewMode);
  }

  const queryString = params.toString();

  return queryString
    ? `${appRoutes.projects}?${queryString}`
    : appRoutes.projects;
}

/**
 * 선택한 태그를 현재 검색 조건에 추가하거나 제거한다.
 * @param tags 현재 선택된 태그 목록
 * @param tag 토글할 태그
 * @returns 토글된 태그 목록
 */
function toggleTag(tags: string[] = [], tag: string) {
  return tags.includes(tag)
    ? tags.filter((currentTag) => currentTag !== tag)
    : [...tags, tag];
}

/**
 * 페이지네이션에서 표시할 페이지 번호 목록을 만든다.
 * @param currentPage 현재 0 기반 페이지
 * @param totalPages 전체 페이지 수
 * @returns 0 기반 페이지 번호와 생략 기호 목록
 */
function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, page) => page);
  }

  const pages = new Set([0, totalPages - 1, currentPage]);

  if (currentPage > 0) {
    pages.add(currentPage - 1);
  }

  if (currentPage < totalPages - 1) {
    pages.add(currentPage + 1);
  }

  const sortedPages = Array.from(pages).sort((first, second) => first - second);
  const items: Array<number | "ellipsis"> = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (index > 0 && page - previousPage > 1) {
      items.push("ellipsis");
    }

    items.push(page);
  });

  return items;
}

/**
 * 프로젝트 조회수와 좋아요 수를 짧은 숫자 표기로 변환한다.
 * @param count 표시할 숫자
 * @returns 축약된 숫자 문자열
 */
function formatCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
  }

  return String(count);
}

/**
 * 프로젝트 대표 작성자 이름을 반환한다.
 * @param project 검색 결과 프로젝트
 * @returns 작성자 이름 또는 기본 문구
 */
function getProjectAuthorName(project: ProjectSearchItem) {
  return project.users[0]?.name ?? "작성자 정보 없음";
}

/**
 * 전체 프로젝트 모음 페이지를 렌더링한다.
 * @param props 검색 결과와 검색 조건
 * @returns 프로젝트 모음 화면 UI
 */
export function ProjectCollectionPage({
  errorMessage,
  projectsPage,
  query,
  viewMode,
}: ProjectCollectionPageProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(query.keyword ?? "");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedTerms, setSelectedTerms] = useState<string[]>(["1"]);
  const currentTags = query.tags ?? [];
  const currentPage = projectsPage.page;
  const pageItems = useMemo(
    () => getPaginationItems(currentPage, projectsPage.totalPages),
    [currentPage, projectsPage.totalPages],
  );

  /**
   * 검색어를 URL query에 반영한다.
   * @param event 검색 폼 제출 이벤트
   */
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    router.push(
      getProjectsHref(
        {
          ...query,
          keyword,
          page: 0,
        },
        viewMode,
      ),
    );
  }

  /**
   * 학기 선택 상태만 토글한다.
   * @param term 토글할 학기 값
   */
  function handleTermToggle(term: string) {
    setSelectedTerms((currentTerms) =>
      currentTerms.includes(term)
        ? currentTerms.filter((currentTerm) => currentTerm !== term)
        : [...currentTerms, term],
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8fb]">
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-6 py-10">
        <ProjectCollectionSidebar
          currentTags={currentTags}
          selectedTerms={selectedTerms}
          selectedYear={selectedYear}
          onTermToggle={handleTermToggle}
          onYearChange={setSelectedYear}
          query={query}
          viewMode={viewMode}
        />

        <section className="min-w-0 flex-1 pb-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight text-[#171f24]">
                프로젝트 모음
              </h1>
              <p className="mt-3 text-sm font-medium text-slate-600">
                내 프로젝트 모음 아니고 모든 프로젝트 모아져 있는 페이지입니다
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <form
                onSubmit={handleSearch}
                className="flex h-11 w-full min-w-0 items-center gap-2 rounded-full bg-white px-4 shadow-sm ring-1 ring-slate-200 sm:w-72"
              >
                <Search className="size-4 text-slate-400" aria-hidden="true" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="아카이브 검색..."
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </form>

              <select
                value={query.filterType ?? "LATEST"}
                onChange={(event) =>
                  router.push(
                    getProjectsHref(
                      {
                        ...query,
                        filterType: event.target
                          .value as ProjectSearchFilterType,
                        page: 0,
                      },
                      viewMode,
                    ),
                  )
                }
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 shadow-sm outline-none"
                aria-label="정렬 방식"
              >
                <option value="LATEST">최신순</option>
                <option value="VIEW_COUNT">조회순</option>
              </select>

              <div className="inline-flex h-11 rounded-lg bg-slate-100 p-1">
                <Link
                  href={getProjectsHref({ ...query, page: 0 }, "grid")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 text-sm font-bold text-slate-500",
                    viewMode === "grid" && "bg-white text-main-10 shadow-sm",
                  )}
                >
                  <Grid2X2 className="size-4" aria-hidden="true" />
                  그리드 뷰
                </Link>
                <Link
                  href={getProjectsHref({ ...query, page: 0 }, "list")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 text-sm font-bold text-slate-500",
                    viewMode === "list" && "bg-white text-main-10 shadow-sm",
                  )}
                >
                  <List className="size-4" aria-hidden="true" />
                  리스트 뷰
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {errorMessage ? (
              <ProjectCollectionNotice
                message={errorMessage}
                title="프로젝트를 불러오지 못했습니다"
              />
            ) : projectsPage.content.length > 0 ? (
              viewMode === "grid" ? (
                <ProjectGrid projects={projectsPage.content} />
              ) : (
                <ProjectList projects={projectsPage.content} />
              )
            ) : (
              <ProjectCollectionNotice
                message="조건에 맞는 프로젝트가 없습니다."
                title="검색 결과 없음"
              />
            )}
          </div>

          <ProjectCollectionPagination
            page={currentPage}
            pageItems={pageItems}
            projectsPage={projectsPage}
            query={query}
            viewMode={viewMode}
          />
        </section>
      </div>
    </main>
  );
}

function ProjectCollectionSidebar({
  currentTags,
  onTermToggle,
  onYearChange,
  query,
  selectedTerms,
  selectedYear,
  viewMode,
}: {
  currentTags: string[];
  onTermToggle: (term: string) => void;
  onYearChange: (year: string) => void;
  query: ProjectSearchQuery;
  selectedTerms: string[];
  selectedYear: string;
  viewMode: ViewMode;
}) {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-56 shrink-0 flex-col overflow-y-auto overscroll-contain py-3 pr-2 lg:flex">
      <div className="space-y-1">
        <p className="text-xl font-extrabold text-main-02">삼육 아카이브</p>
        <p className="text-xs font-semibold text-slate-400">프로젝트 저장소</p>
      </div>

      <Link
        href={appRoutes.projectCreate}
        className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#006DAA] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-main-10"
      >
        <Upload className="size-4" aria-hidden="true" />
        프로젝트 제출
      </Link>

      <nav className="mt-10 flex flex-col gap-2" aria-label="대표 태그">
        {featuredTags.map(({ icon: Icon, label }) => {
          const active = currentTags.includes(label);

          return (
            <Link
              key={label}
              href={getProjectsHref(
                {
                  ...query,
                  page: 0,
                  tags: toggleTag(currentTags, label),
                },
                viewMode,
              )}
              className={cn(
                "inline-flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-main-10",
                active && "bg-white text-main-10",
              )}
              aria-current={active ? "true" : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-12 space-y-6">
        <label className="block">
          <span className="text-xs font-bold text-slate-400">연도</span>
          <select
            value={selectedYear}
            onChange={(event) => onYearChange(event.target.value)}
            className="mt-3 h-10 w-full rounded-md border-0 bg-slate-200 px-3 text-sm font-bold text-slate-600 outline-none"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </label>

        <div>
          <p className="text-xs font-bold text-slate-400">학기</p>
          <div className="mt-3 flex gap-2">
            {["1", "2"].map((term) => {
              const active = selectedTerms.includes(term);

              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => onTermToggle(term)}
                  className={cn(
                    "h-8 rounded px-4 text-xs font-bold text-slate-500",
                    active ? "bg-main-22 text-main-10" : "bg-slate-200",
                  )}
                >
                  {term}학기
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400">태그</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickTags.map((tag) => {
              const active = currentTags.includes(tag);

              return (
                <Link
                  key={tag}
                  href={getProjectsHref(
                    {
                      ...query,
                      page: 0,
                      tags: toggleTag(currentTags, tag),
                    },
                    viewMode,
                  )}
                  className={cn(
                    "rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500",
                    active && "border-main-20 bg-main-22 text-main-10",
                  )}
                >
                  {tag}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm font-bold text-slate-400">
        <span className="flex items-center gap-3">
          <Settings className="size-4" aria-hidden="true" />
          설정
        </span>
        <span className="flex items-center gap-3">
          <CircleHelp className="size-4" aria-hidden="true" />
          고객지원
        </span>
      </div>
    </aside>
  );
}

function ProjectGrid({ projects }: { projects: ProjectSearchItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.projectId} project={project} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectSearchItem }) {
  return (
    <Link
      href={getProjectDetailPath(project.projectId)}
      className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <ProjectThumbnail project={project} className="h-36 sm:h-40" />
      <div className="px-4 py-4">
        <p className="truncate text-[11px] font-extrabold text-main-10">
          {project.tags[0] ?? "태그 없음"}
        </p>
        <h2 className="mt-3 line-clamp-2 min-h-12 text-lg font-extrabold leading-6 text-[#171f24]">
          {project.title}
        </h2>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs font-medium leading-5 text-slate-600">
          {project.description || "프로젝트 설명이 없습니다."}
        </p>
        <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
          {project.tags.slice(1, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs font-bold text-slate-400">
          <span className="truncate">{getProjectAuthorName(project)}</span>
          <Heart
            className={cn(
              "size-4",
              project.isLiked && "fill-current text-main-10",
            )}
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}

function ProjectList({ projects }: { projects: ProjectSearchItem[] }) {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Link
          key={project.projectId}
          href={getProjectDetailPath(project.projectId)}
          className="grid gap-4 rounded-lg bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[148px_1fr]"
        >
          <ProjectThumbnail project={project} className="h-32 md:h-full" />
          <div className="min-w-0 py-1">
            <p className="truncate text-[11px] font-extrabold text-main-10">
              {project.tags[0] ?? "태그 없음"}
            </p>
            <h2 className="mt-2 line-clamp-1 text-lg font-extrabold text-[#171f24]">
              {project.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-slate-600">
              {project.description || "프로젝트 설명이 없습니다."}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.tags.slice(1, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
              <span className="truncate">{getProjectAuthorName(project)}</span>
              <ProjectStats project={project} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProjectThumbnail({
  className,
  project,
}: {
  className: string;
  project: ProjectSearchItem;
}) {
  return project.thumbnailUrl ? (
    <div
      className={cn(
        "bg-cover bg-center transition duration-500 group-hover:scale-[1.02]",
        className,
      )}
      style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
    />
  ) : (
    <div
      className={cn(
        "flex items-center justify-center bg-main-22 text-main-20",
        className,
      )}
    >
      <BookOpen className="size-12" aria-hidden="true" />
    </div>
  );
}

function ProjectStats({ project }: { project: ProjectSearchItem }) {
  return (
    <span className="inline-flex items-center gap-3 text-xs font-bold text-slate-400">
      <span>{formatCount(project.viewCount)} views</span>
      <span>{formatCount(project.likeCount)} likes</span>
    </span>
  );
}

function ProjectCollectionNotice({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-lg bg-white px-6 text-center shadow-sm">
      <div>
        <p className="text-xl font-extrabold text-[#171f24]">{title}</p>
        <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function ProjectCollectionPagination({
  page,
  pageItems,
  projectsPage,
  query,
  viewMode,
}: {
  page: number;
  pageItems: Array<number | "ellipsis">;
  projectsPage: ProjectSearchPage;
  query: ProjectSearchQuery;
  viewMode: ViewMode;
}) {
  if (projectsPage.totalPages <= 1) {
    return (
      <p className="mt-16 text-center text-xs font-bold text-slate-400">
        {projectsPage.totalElements}개의 프로젝트 표시 중
      </p>
    );
  }

  return (
    <div className="mt-20 flex flex-col items-center gap-5">
      <div className="flex items-center gap-2">
        <PaginationButton
          disabled={page <= 0}
          href={getProjectsHref(
            { ...query, page: Math.max(page - 1, 0) },
            viewMode,
          )}
          label="이전 페이지"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </PaginationButton>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex size-10 items-center justify-center text-sm font-bold text-slate-400"
            >
              ...
            </span>
          ) : (
            <Link
              key={item}
              href={getProjectsHref({ ...query, page: item }, viewMode)}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl text-sm font-extrabold text-slate-500",
                page === item
                  ? "bg-[#006DAA] text-white shadow-lg shadow-blue-900/20"
                  : "bg-transparent hover:bg-white",
              )}
              aria-current={page === item ? "page" : undefined}
            >
              {item + 1}
            </Link>
          ),
        )}

        <PaginationButton
          disabled={page >= projectsPage.totalPages - 1}
          href={getProjectsHref(
            {
              ...query,
              page: Math.min(page + 1, projectsPage.totalPages - 1),
            },
            viewMode,
          )}
          label="다음 페이지"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </PaginationButton>
      </div>
      <p className="text-xs font-bold text-slate-400">
        {projectsPage.totalElements}개의 프로젝트 중{" "}
        {projectsPage.content.length > 0 ? page * projectsPage.size + 1 : 0}-
        {Math.min((page + 1) * projectsPage.size, projectsPage.totalElements)}개
        표시 중
      </p>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  href,
  label,
}: {
  children: ReactNode;
  disabled: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-slate-300">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm hover:text-main-10"
      aria-label={label}
    >
      {children}
    </Link>
  );
}
