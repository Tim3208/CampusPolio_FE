"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type FormEvent, type ReactNode, useMemo, useState } from "react"
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
  Mail,
  Palette,
  Search,
  Settings,
  Share2,
  Upload,
  UsersRound,
} from "lucide-react"

import type {
  ProjectSearchFilterType,
  ProjectSearchItem,
  ProjectSearchPage,
  ProjectSearchQuery,
} from "@/entities/project"
import { appRoutes, getProjectDetailPath } from "@/shared/config"
import { cn } from "@/shared/lib/utils"

type ProjectCollectionPageProps = {
  errorMessage?: string
  projectsPage: ProjectSearchPage
  query: ProjectSearchQuery
}

type ViewMode = "grid" | "list"

const featuredTags = [
  { icon: Palette, label: "시각 디자인" },
  { icon: Building2, label: "건축학" },
  { icon: BookOpen, label: "신학" },
  { icon: UsersRound, label: "공학" },
  { icon: ImageIcon, label: "인문학" },
] as const

const quickTags = ["졸업작품", "논문", "디자인", "역사"] as const

/**
 * 프로젝트 검색 URL을 생성한다.
 * @param query 검색 조건
 * @returns 프로젝트 모음 페이지 경로
 */
function getProjectsHref(query: ProjectSearchQuery) {
  const params = new URLSearchParams()

  if (query.keyword?.trim()) {
    params.set("keyword", query.keyword.trim())
  }

  query.tags
    ?.map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => params.append("tags", tag))

  if (query.page && query.page > 0) {
    params.set("page", String(query.page))
  }

  if (query.filterType && query.filterType !== "LATEST") {
    params.set("filterType", query.filterType)
  }

  const queryString = params.toString()

  return queryString ? `${appRoutes.projects}?${queryString}` : appRoutes.projects
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
    : [...tags, tag]
}

/**
 * 페이지네이션에서 표시할 페이지 번호 목록을 만든다.
 * @param currentPage 현재 0 기반 페이지
 * @param totalPages 전체 페이지 수
 * @returns 0 기반 페이지 번호와 생략 기호 목록
 */
function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, page) => page)
  }

  const pages = new Set([0, totalPages - 1, currentPage])

  if (currentPage > 0) {
    pages.add(currentPage - 1)
  }

  if (currentPage < totalPages - 1) {
    pages.add(currentPage + 1)
  }

  const sortedPages = Array.from(pages).sort((first, second) => first - second)
  const items: Array<number | "ellipsis"> = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]

    if (index > 0 && page - previousPage > 1) {
      items.push("ellipsis")
    }

    items.push(page)
  })

  return items
}

/**
 * 프로젝트 조회수와 좋아요 수를 짧은 숫자 표기로 변환한다.
 * @param count 표시할 숫자
 * @returns 축약된 숫자 문자열
 */
function formatCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
  }

  return String(count)
}

/**
 * 프로젝트 대표 작성자 이름을 반환한다.
 * @param project 검색 결과 프로젝트
 * @returns 작성자 이름 또는 기본 문구
 */
function getProjectAuthorName(project: ProjectSearchItem) {
  return project.users[0]?.name ?? "작성자 정보 없음"
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
}: ProjectCollectionPageProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [keyword, setKeyword] = useState(query.keyword ?? "")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedTerms, setSelectedTerms] = useState<string[]>(["1"])
  const currentTags = query.tags ?? []
  const currentPage = projectsPage.page
  const pageItems = useMemo(
    () => getPaginationItems(currentPage, projectsPage.totalPages),
    [currentPage, projectsPage.totalPages]
  )

  /**
   * 검색어를 URL query에 반영한다.
   * @param event 검색 폼 제출 이벤트
   */
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    router.push(
      getProjectsHref({
        ...query,
        keyword,
        page: 0,
      })
    )
  }

  /**
   * 학기 선택 상태만 토글한다.
   * @param term 토글할 학기 값
   */
  function handleTermToggle(term: string) {
    setSelectedTerms((currentTerms) =>
      currentTerms.includes(term)
        ? currentTerms.filter((currentTerm) => currentTerm !== term)
        : [...currentTerms, term]
    )
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
        />

        <section className="min-w-0 flex-1 pb-28">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold leading-tight text-[#171f24]">
                프로젝트 모음
              </h1>
              <p className="mt-4 text-base font-medium text-slate-600">
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
                    getProjectsHref({
                      ...query,
                      filterType: event.target
                        .value as ProjectSearchFilterType,
                      page: 0,
                    })
                  )
                }
                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 shadow-sm outline-none"
                aria-label="정렬 방식"
              >
                <option value="LATEST">최신순</option>
                <option value="VIEW_COUNT">조회순</option>
              </select>

              <div className="inline-flex h-11 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 text-sm font-bold text-slate-500",
                    viewMode === "grid" && "bg-white text-main-10 shadow-sm"
                  )}
                >
                  <Grid2X2 className="size-4" aria-hidden="true" />
                  그리드 뷰
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 text-sm font-bold text-slate-500",
                    viewMode === "list" && "bg-white text-main-10 shadow-sm"
                  )}
                >
                  <List className="size-4" aria-hidden="true" />
                  리스트 뷰
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12">
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
          />
        </section>
      </div>

      <ProjectCollectionFooter />
    </main>
  )
}

function ProjectCollectionSidebar({
  currentTags,
  onTermToggle,
  onYearChange,
  query,
  selectedTerms,
  selectedYear,
}: {
  currentTags: string[]
  onTermToggle: (term: string) => void
  onYearChange: (year: string) => void
  query: ProjectSearchQuery
  selectedTerms: string[]
  selectedYear: string
}) {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-56 shrink-0 flex-col py-3 lg:flex">
      <div className="space-y-1">
        <p className="text-xl font-extrabold text-main-02">삼육 아카이브</p>
        <p className="text-xs font-semibold text-slate-400">프로젝트 저장소</p>
      </div>

      <Link
        href={appRoutes.projectCreate}
        className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#006DAA] px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-main-10"
      >
        <Upload className="size-4" aria-hidden="true" />
        프로젝트 제출
      </Link>

      <nav className="mt-10 flex flex-col gap-2" aria-label="대표 태그">
        {featuredTags.map(({ icon: Icon, label }) => {
          const active = currentTags.includes(label)

          return (
            <Link
              key={label}
              href={getProjectsHref({
                ...query,
                page: 0,
                tags: toggleTag(currentTags, label),
              })}
              className={cn(
                "inline-flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-main-10",
                active && "bg-white text-main-10"
              )}
              aria-current={active ? "true" : undefined}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </Link>
          )
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
              const active = selectedTerms.includes(term)

              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => onTermToggle(term)}
                  className={cn(
                    "h-8 rounded px-4 text-xs font-bold text-slate-500",
                    active ? "bg-main-22 text-main-10" : "bg-slate-200"
                  )}
                >
                  {term}학기
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400">태그</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickTags.map((tag) => {
              const active = currentTags.includes(tag)

              return (
                <Link
                  key={tag}
                  href={getProjectsHref({
                    ...query,
                    page: 0,
                    tags: toggleTag(currentTags, tag),
                  })}
                  className={cn(
                    "rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500",
                    active && "border-main-20 bg-main-22 text-main-10"
                  )}
                >
                  {tag}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-3 text-sm font-bold text-slate-400">
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
  )
}

function ProjectGrid({ projects }: { projects: ProjectSearchItem[] }) {
  const [firstProject, ...restProjects] = projects

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
      {firstProject ? <FeaturedProjectCard project={firstProject} /> : null}
      {restProjects.map((project) => (
        <ProjectCard key={project.projectId} project={project} />
      ))}
    </div>
  )
}

function FeaturedProjectCard({ project }: { project: ProjectSearchItem }) {
  return (
    <Link
      href={getProjectDetailPath(project.projectId)}
      className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md xl:col-span-2"
    >
      <ProjectThumbnail project={project} className="h-80" />
      <div className="px-8 py-8">
        <div className="flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="mt-6 text-3xl font-extrabold leading-tight text-[#171f24]">
          {project.title}
        </h2>
        <p className="mt-4 line-clamp-2 text-base font-medium leading-7 text-slate-600">
          {project.description || "프로젝트 설명이 없습니다."}
        </p>

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-main-22 text-xs font-extrabold text-main-10">
              {getProjectAuthorName(project).slice(0, 2)}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {getProjectAuthorName(project)}
              </p>
              <ProjectStats project={project} />
            </div>
          </div>
          <ChevronRight className="size-6 text-slate-400 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

function ProjectCard({ project }: { project: ProjectSearchItem }) {
  return (
    <Link
      href={getProjectDetailPath(project.projectId)}
      className="group overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <ProjectThumbnail project={project} className="h-44" />
      <div className="px-6 py-6">
        <p className="text-xs font-extrabold text-main-10">
          {project.tags[0] ?? "태그 없음"}
        </p>
        <h2 className="mt-4 line-clamp-2 min-h-14 text-xl font-extrabold leading-7 text-[#171f24]">
          {project.title}
        </h2>
        <p className="mt-3 line-clamp-2 min-h-12 text-sm font-medium leading-6 text-slate-600">
          {project.description || "프로젝트 설명이 없습니다."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.slice(1, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-7 flex items-center justify-between text-xs font-bold text-slate-400">
          <span>{getProjectAuthorName(project)}</span>
          <Heart
            className={cn("size-4", project.isLiked && "fill-current text-main-10")}
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  )
}

function ProjectList({ projects }: { projects: ProjectSearchItem[] }) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link
          key={project.projectId}
          href={getProjectDetailPath(project.projectId)}
          className="grid gap-5 rounded-lg bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[220px_1fr]"
        >
          <ProjectThumbnail project={project} className="h-44 md:h-full" />
          <div className="min-w-0 py-2">
            <p className="text-xs font-extrabold text-main-10">
              {project.tags[0] ?? "태그 없음"}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-[#171f24]">
              {project.title}
            </h2>
            <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
              {project.description || "프로젝트 설명이 없습니다."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
              <span>{getProjectAuthorName(project)}</span>
              <ProjectStats project={project} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ProjectThumbnail({
  className,
  project,
}: {
  className: string
  project: ProjectSearchItem
}) {
  return project.thumbnailUrl ? (
    <div
      className={cn(
        "bg-cover bg-center transition duration-500 group-hover:scale-[1.02]",
        className
      )}
      style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
    />
  ) : (
    <div
      className={cn(
        "flex items-center justify-center bg-main-22 text-main-20",
        className
      )}
    >
      <BookOpen className="size-12" aria-hidden="true" />
    </div>
  )
}

function ProjectStats({ project }: { project: ProjectSearchItem }) {
  return (
    <span className="inline-flex items-center gap-3 text-xs font-bold text-slate-400">
      <span>{formatCount(project.viewCount)} views</span>
      <span>{formatCount(project.likeCount)} likes</span>
    </span>
  )
}

function ProjectCollectionNotice({
  message,
  title,
}: {
  message: string
  title: string
}) {
  return (
    <div className="flex min-h-80 items-center justify-center rounded-lg bg-white px-6 text-center shadow-sm">
      <div>
        <p className="text-xl font-extrabold text-[#171f24]">{title}</p>
        <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>
      </div>
    </div>
  )
}

function ProjectCollectionPagination({
  page,
  pageItems,
  projectsPage,
  query,
}: {
  page: number
  pageItems: Array<number | "ellipsis">
  projectsPage: ProjectSearchPage
  query: ProjectSearchQuery
}) {
  if (projectsPage.totalPages <= 1) {
    return (
      <p className="mt-16 text-center text-xs font-bold text-slate-400">
        {projectsPage.totalElements}개의 프로젝트 표시 중
      </p>
    )
  }

  return (
    <div className="mt-20 flex flex-col items-center gap-5">
      <div className="flex items-center gap-2">
        <PaginationButton
          disabled={page <= 0}
          href={getProjectsHref({ ...query, page: Math.max(page - 1, 0) })}
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
              href={getProjectsHref({ ...query, page: item })}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl text-sm font-extrabold text-slate-500",
                page === item
                  ? "bg-[#006DAA] text-white shadow-lg shadow-blue-900/20"
                  : "bg-transparent hover:bg-white"
              )}
              aria-current={page === item ? "page" : undefined}
            >
              {item + 1}
            </Link>
          )
        )}

        <PaginationButton
          disabled={page >= projectsPage.totalPages - 1}
          href={getProjectsHref({
            ...query,
            page: Math.min(page + 1, projectsPage.totalPages - 1),
          })}
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
  )
}

function PaginationButton({
  children,
  disabled,
  href,
  label,
}: {
  children: ReactNode
  disabled: boolean
  href: string
  label: string
}) {
  if (disabled) {
    return (
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-slate-300">
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm hover:text-main-10"
      aria-label={label}
    >
      {children}
    </Link>
  )
}

function ProjectCollectionFooter() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-[#edf3f8] px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 text-xs font-bold text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>© COPYRIGHT 애써고 저쩌고.. ALL RIGHTS RESERVED.</p>
        <div className="flex flex-wrap gap-8">
          <span>대학교 홈페이지</span>
          <span>아카이브 정책</span>
          <span>큐레이터 문의</span>
          <span>디지털 아카이브</span>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500"
            aria-label="공유"
          >
            <Share2 className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500"
            aria-label="메일"
          >
            <Mail className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
