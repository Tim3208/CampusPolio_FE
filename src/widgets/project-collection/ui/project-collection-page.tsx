"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  List,
  RotateCw,
  Search,
  SearchX,
  Upload,
  WifiOff,
} from "lucide-react";
import type {
  ProjectSearchFilterType,
  ProjectSearchPage,
  ProjectSearchQuery,
} from "@/entities/project";
import {
  AppliedFilterChips,
  getProjectsHref,
  ProjectTagFilterList,
  ProjectTagFilterSheet,
  type ProjectCollectionViewMode,
} from "@/features/project/project-search-filter";
import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { ProjectCard } from "./project-card";
import { ProjectListItem } from "./project-list-item";

type Props = {
  errorMessage?: string;
  projectsPage: ProjectSearchPage;
  query: ProjectSearchQuery;
  viewMode: ProjectCollectionViewMode;
};

/** 탐색 화면을 조합하며 태그 조작 요소의 DOM과 포커스를 유지한다. */
export function ProjectCollectionPage(props: Props) {
  return <ProjectCollectionContent {...props} />;
}

/** 기존 조회 결과와 URL 검색·태그·정렬·보기·페이지 이동을 화면에 연결한다. */
function ProjectCollectionContent({
  errorMessage,
  projectsPage,
  query,
  viewMode,
}: Props) {
  const router = useRouter();
  const page = projectsPage.page;
  return (
    <main className="min-h-screen bg-[#F5F8FB] text-gray-01">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pt-7 md:px-8 md:pt-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-10 xl:grid-cols-[224px_minmax(0,1fr)] xl:gap-11 xl:px-12 xl:pt-11">
        <aside className="hidden flex-col gap-[22px] lg:flex">
          <div>
            <h2 className="text-[19px] font-extrabold text-main-00">
              삼육 아카이브
            </h2>
            <p className="text-[13px] text-gray-05">프로젝트 저장소</p>
          </div>
          <Button
            asChild
            size="md"
            className="w-full bg-main-10 text-white hover:bg-main-11"
          >
            <Link href={appRoutes.projectCreate}>
              <Upload
                className="size-[18px]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              프로젝트 제출
            </Link>
          </Button>
          <div>
            <div className="mb-1 flex items-center justify-between px-2.5 text-[13px] font-bold text-gray-03">
              <h3>태그</h3>
              {Boolean(query.tags?.length) && (
                <span className="rounded-full bg-main-22 px-2 py-0.5 text-xs text-main-10">
                  {query.tags?.length}개 선택
                </span>
              )}
            </div>
            <ProjectTagFilterList
              tags={query.tags ?? []}
              onChange={(tags) =>
                router.push(
                  getProjectsHref({ ...query, tags, page: 0 }, viewMode),
                )
              }
            />
          </div>
        </aside>
        <section className="flex min-w-0 flex-col gap-4 md:gap-6">
          <h1 className="text-[26px] leading-[1.25] font-extrabold tracking-tight text-main-00 md:text-4xl">
            프로젝트 모음
          </h1>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
            <ProjectSearchForm
              key={getProjectsHref(query, viewMode)}
              query={query}
              viewMode={viewMode}
            />
            <div className="flex items-center justify-between gap-2">
              <div className="lg:hidden">
                <ProjectTagFilterSheet query={query} viewMode={viewMode} />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <select
                  aria-label="정렬 방식"
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
                  className="h-11 rounded-lg border border-main-13 bg-[#FDFEFF] px-3 text-sm font-semibold text-gray-03 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10"
                >
                  <option value="LATEST">최신순</option>
                  <option value="VIEW_COUNT">조회순</option>
                </select>
                <div className="flex gap-0.5 rounded-xl bg-main-22 p-1">
                  {(["grid", "list"] as const).map((mode) => (
                    <Link
                      key={mode}
                      href={getProjectsHref({ ...query, page: 0 }, mode)}
                      aria-label={
                        mode === "grid" ? "그리드 보기" : "리스트 보기"
                      }
                      aria-current={viewMode === mode ? "true" : undefined}
                      className={
                        "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-semibold lg:px-3 " +
                        (viewMode === mode
                          ? "bg-[#FDFEFF] text-main-10 shadow-sm"
                          : "text-main-12")
                      }
                    >
                      {mode === "grid" ? (
                        <Grid2X2
                          className="size-4"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      ) : (
                        <List
                          className="size-4"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      )}
                      <span className="hidden xl:inline">
                        {mode === "grid" ? "그리드" : "리스트"}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {!errorMessage && (
            <AppliedFilterChips
              query={query}
              viewMode={viewMode}
              showReset={projectsPage.content.length > 0}
            />
          )}
          {errorMessage ? (
            <CollectionNotice
              error
              title="프로젝트 목록을 불러오지 못했어요"
              message="네트워크 상태를 확인하고 다시 시도해 주세요."
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
            </CollectionNotice>
          ) : projectsPage.content.length ? (
            <>
              {viewMode === "grid" ? (
                <div
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
                  data-search-grid
                >
                  {projectsPage.content.map((project) => (
                    <ProjectCard key={project.projectId} project={project} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {projectsPage.content.map((project) => (
                    <ProjectListItem
                      key={project.projectId}
                      project={project}
                    />
                  ))}
                </div>
              )}
              {projectsPage.totalPages > 1 && (
                <nav
                  aria-label="프로젝트 페이지"
                  className="mt-2 flex items-center justify-center gap-1.5 md:mt-6"
                >
                  <PageArrow
                    disabled={page <= 0}
                    href={getProjectsHref(
                      { ...query, page: Math.max(page - 1, 0) },
                      viewMode,
                    )}
                    label="이전 페이지"
                  >
                    <ChevronLeft
                      className="size-[18px]"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </PageArrow>
                  {getPaginationItems(page, projectsPage.totalPages).map(
                    (item, index) =>
                      item === "ellipsis" ? (
                        <span key={"gap" + index} className="px-1 text-gray-05">
                          …
                        </span>
                      ) : (
                        <Link
                          key={item}
                          href={getProjectsHref(
                            { ...query, page: item },
                            viewMode,
                          )}
                          aria-current={page === item ? "page" : undefined}
                          aria-label={String(item + 1) + "페이지"}
                          className={
                            "flex size-10 items-center justify-center rounded-lg text-sm font-semibold " +
                            (page === item
                              ? "bg-main-10 text-white"
                              : "text-gray-03 hover:bg-[#FDFEFF]")
                          }
                        >
                          {item + 1}
                        </Link>
                      ),
                  )}
                  <PageArrow
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
                    <ChevronRight
                      className="size-[18px]"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </PageArrow>
                </nav>
              )}
            </>
          ) : (
            <CollectionNotice
              title="조건에 맞는 프로젝트가 없어요"
              message="검색어를 바꾸거나 조건을 줄여 보세요."
            >
              <Button
                asChild
                size="xl"
                className="bg-main-10 text-white hover:bg-main-11 md:h-10"
              >
                <Link href={getProjectsHref({}, viewMode)}>
                  전체 조건 초기화
                </Link>
              </Button>
            </CollectionNotice>
          )}
        </section>
      </div>
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
    </main>
  );
}

/** 많은 페이지에서도 현재 번호와 시작 및 마지막 번호를 간결하게 표시한다. */
function getPaginationItems(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index);
  const numbers = [
    ...new Set(
      [0, total - 1, current - 1, current, current + 1].filter(
        (page) => page >= 0 && page < total,
      ),
    ),
  ].sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  numbers.forEach((page, index) => {
    if (index > 0 && page - numbers[index - 1] > 1) items.push("ellipsis");
    items.push(page);
  });
  return items;
}

/** 사용 가능한 페이지 방향은 링크로, 양 끝은 비활성 버튼으로 표시한다. */
function PageArrow({
  disabled,
  href,
  label,
  children,
}: {
  disabled: boolean;
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const className =
    "border-[#CBD6E2] bg-[#FDFEFF] text-gray-03 disabled:border-[#E3E9F0] disabled:bg-[#F5F8FB] disabled:text-gray-08 disabled:opacity-100 md:size-10";
  return disabled ? (
    <Button
      variant="outline"
      size="icon-xl"
      disabled
      aria-label={label}
      className={className}
    >
      {children}
    </Button>
  ) : (
    <Button asChild variant="outline" size="icon-xl" className={className}>
      <Link href={href} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}

/** 조건을 보존하는 오류 안내 또는 초기화 가능한 빈 결과 상태를 표시한다. */
function CollectionNotice({
  title,
  message,
  error = false,
  children,
}: {
  title: string;
  message: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  const Icon = error ? WifiOff : SearchX;
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
      <h2 className="text-[17px] font-bold text-main-00">{title}</h2>
      <p className="mb-2 max-w-[32ch] text-sm leading-relaxed text-gray-05">
        {message}
      </p>
      {children}
    </div>
  );
}

/** 검색어 입력만 URL 조건에 동기화하여 필터 트리거와 체크박스의 포커스를 보존한다. */
function ProjectSearchForm({
  query,
  viewMode,
}: {
  query: ProjectSearchQuery;
  viewMode: ProjectCollectionViewMode;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(query.keyword ?? "");
  /** 검색 버튼과 Enter로 검색어를 적용하고 첫 페이지로 이동한다. */
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(getProjectsHref({ ...query, keyword, page: 0 }, viewMode));
  }
  return (
    <form onSubmit={handleSearch} className="flex min-w-0 gap-2 lg:flex-1">
      <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-main-13 bg-[#FDFEFF] px-3.5 focus-within:border-main-10 focus-within:ring-2 focus-within:ring-main-22 lg:max-w-[360px]">
        <Search
          className="size-[18px] shrink-0 text-gray-05"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          aria-label="프로젝트 검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="프로젝트 검색"
          className="w-full min-w-0 bg-transparent text-[14.5px] outline-none placeholder:text-gray-05"
        />
      </label>
      <Button
        type="submit"
        size="xl"
        variant="outline"
        className="border-[#CBD6E2] bg-[#FDFEFF] px-4 text-gray-03"
      >
        검색
      </Button>
    </form>
  );
}
