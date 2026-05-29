"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react"
import { Globe2, Lock, MoreVertical, Plus } from "lucide-react"

import { getMyProjects, type MyProject } from "@/entities/project"
import { appRoutes, getProjectDetailPath } from "@/shared/config"
import { cn } from "@/shared/lib/utils"

type ProjectsLoadState = {
  status: "loading" | "success" | "error"
  projects: MyProject[]
  errorMessage?: string
}

type ProjectCardProps = {
  project: MyProject
  onOpen: (projectId: number) => void
}

/**
 * 프로젝트 공개 상태를 사용자 표시용 문구로 변환한다.
 * @param status 프로젝트 상태 값
 * @returns 공개 여부 문구
 */
function getVisibilityLabel(status: MyProject["status"]) {
  return status === "PUBLISHED" ? "공개" : "비공개"
}

/**
 * 업데이트 시각을 마이페이지 카드에 표시할 상대 시간 문구로 변환한다.
 * @param updatedAt API에서 받은 업데이트 시각
 * @returns 업데이트 시간 표시 문구
 */
function formatUpdatedAt(updatedAt: string) {
  const updatedDate = new Date(updatedAt)

  if (Number.isNaN(updatedDate.getTime())) {
    return "업데이트: 날짜 없음"
  }

  const now = new Date()
  const diffMs = now.getTime() - updatedDate.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))

  if (diffMinutes < 60) {
    return `업데이트: ${Math.max(1, diffMinutes)}분 전`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `업데이트: ${diffHours}시간 전`
  }

  const diffDays = Math.floor(diffHours / 24)

  if (diffDays === 1) {
    return "업데이트: 어제"
  }

  if (diffDays < 7) {
    return `업데이트: ${diffDays}일 전`
  }

  if (diffDays < 14) {
    return "업데이트: 일주일 전"
  }

  return `업데이트: ${updatedDate.toLocaleDateString("ko-KR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`
}

/**
 * 프로젝트 생성 화면으로 이동하는 카드 UI를 렌더링한다.
 * @returns 프로젝트 생성 링크 카드
 */
function ProjectCreateCard() {
  return (
    <Link
      href={appRoutes.projectCreate}
      className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white/40 px-6 text-center transition-colors hover:border-main-02 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-02"
    >
      <span className="mb-5 inline-flex size-14 items-center justify-center rounded-xl bg-slate-200 text-main-02">
        <Plus className="size-6" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold text-[#171f24]">프로젝트 생성</span>
      <span className="mt-3 max-w-40 text-sm leading-6 text-slate-600">
        새로운 학술 아카이브 프로젝트를 시작하세요
      </span>
    </Link>
  )
}

/**
 * 프로젝트 카드 클릭 가능 영역을 렌더링한다.
 * @param project 표시할 프로젝트
 * @param onOpen 프로젝트 상세 이동 핸들러
 * @returns 프로젝트 카드 UI
 */
function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const visibilityLabel = getVisibilityLabel(project.status)

  /**
   * 현재 프로젝트 상세 페이지로 이동한다.
   */
  function handleOpen() {
    onOpen(project.projectId)
  }

  /**
   * 키보드 조작으로 프로젝트 상세 페이지 이동을 실행한다.
   * @param event 카드 키보드 이벤트
   */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    handleOpen()
  }

  /**
   * 설정 아이콘 클릭 시 카드 상세 이동을 막는다.
   * @param event 설정 버튼 클릭 이벤트
   */
  function handleSettingsClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
  }

  /**
   * 설정 버튼에 포커스된 상태에서 카드 키보드 이동이 실행되지 않게 한다.
   * @param event 설정 버튼 키보드 이벤트
   */
  function handleSettingsKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    event.stopPropagation()
  }

  return (
    <article
      aria-label={`${project.title} 상세 보기`}
      className="group flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-02"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <div className="relative h-44 overflow-hidden bg-slate-200">
        {project.thumbnailUrl ? (
          <div
            aria-hidden="true"
            className="size-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-medium text-slate-500">
            썸네일 없음
          </div>
        )}

        <span
          className={cn(
            "absolute left-4 top-4 inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-xs font-semibold shadow-sm",
            project.status === "PUBLISHED"
              ? "bg-white text-main-02"
              : "bg-slate-950 text-white"
          )}
        >
          {project.status === "PUBLISHED" ? (
            <Globe2 className="size-3.5" aria-hidden="true" />
          ) : (
            <Lock className="size-3.5" aria-hidden="true" />
          )}
          {visibilityLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 py-6">
        <h2 className="line-clamp-2 min-h-14 text-xl font-extrabold leading-7 text-[#171f24]">
          {project.title}
        </h2>

        <div className="mt-4 flex min-h-7 flex-wrap gap-2">
          {project.tags.length > 0 ? (
            project.tags.map((tag) => (
              <span
                key={`${project.projectId}-${tag}`}
                className="inline-flex h-6 items-center rounded bg-main-22 px-2.5 text-xs font-bold text-main-02"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="inline-flex h-6 items-center rounded bg-slate-100 px-2.5 text-xs font-medium text-slate-500">
              태그 없음
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
          <span className="text-sm text-slate-600">
            {formatUpdatedAt(project.updatedAt)}
          </span>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-02"
            onClick={handleSettingsClick}
            onKeyDown={handleSettingsKeyDown}
            aria-label={`${project.title} 설정`}
          >
            <MoreVertical className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

/**
 * 프로젝트 목록 로딩 중 표시할 카드 skeleton을 렌더링한다.
 * @returns 프로젝트 카드 skeleton 목록
 */
function ProjectCardSkeletons() {
  return Array.from({ length: 4 }).map((_, index) => (
    <div
      key={index}
      className="min-h-[360px] overflow-hidden rounded-lg bg-white shadow-sm"
      aria-hidden="true"
    >
      <div className="h-44 animate-pulse bg-slate-200" />
      <div className="space-y-4 px-6 py-6">
        <div className="h-6 w-4/5 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-6 w-12 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-16 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  ))
}

/**
 * 프로젝트 목록이 비어 있을 때의 안내 영역을 렌더링한다.
 * @returns 빈 프로젝트 목록 상태 UI
 */
function EmptyProjectsState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center">
      <div>
        <p className="text-lg font-bold text-[#171f24]">아직 프로젝트가 없습니다</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          프로젝트 생성 카드에서 첫 프로젝트를 시작할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

/**
 * 프로젝트 목록 조회 실패 상태를 렌더링한다.
 * @param message 실패 원인 메시지
 * @returns 프로젝트 목록 오류 상태 UI
 */
function ErrorProjectsState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-red-100 bg-white px-6 text-center">
      <div>
        <p className="text-lg font-bold text-red-600">
          프로젝트 목록을 불러오지 못했습니다
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </div>
  )
}

/**
 * 마이페이지 프로젝트 모음 본문을 렌더링한다.
 * @returns 프로젝트 생성 카드와 내 프로젝트 카드 목록
 */
export function MypageProjectsPage() {
  const router = useRouter()
  const [state, setState] = useState<ProjectsLoadState>({
    projects: [],
    status: "loading",
  })

  useEffect(() => {
    let ignore = false

    /**
     * 내 프로젝트 목록 첫 페이지를 불러와 화면 상태를 갱신한다.
     */
    async function loadProjects() {
      setState((current) => ({
        ...current,
        errorMessage: undefined,
        status: "loading",
      }))

      try {
        const projectsPage = await getMyProjects({
          page: 0,
          size: 9,
          status: "ALL",
        })

        if (ignore) {
          return
        }

        setState({
          projects: projectsPage.content,
          status: "success",
        })
      } catch (error) {
        if (ignore) {
          return
        }

        setState({
          errorMessage:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
          projects: [],
          status: "error",
        })
      }
    }

    loadProjects()

    return () => {
      ignore = true
    }
  }, [])

  /**
   * 선택한 프로젝트 상세 화면으로 이동한다.
   * @param projectId 이동할 프로젝트 ID
   */
  function handleProjectOpen(projectId: number) {
    router.push(getProjectDetailPath(projectId))
  }

  return (
    <section className="flex flex-col gap-8 px-8 py-10">
      <h1 className="text-[32px] font-extrabold leading-tight text-[#171f24]">
        프로젝트 모음
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ProjectCreateCard />

        {state.status === "loading" && <ProjectCardSkeletons />}

        {state.status === "error" && (
          <ErrorProjectsState
            message={state.errorMessage ?? "잠시 후 다시 시도해주세요."}
          />
        )}

        {state.status === "success" &&
          (state.projects.length > 0 ? (
            state.projects.map((project) => (
              <ProjectCard
                key={project.projectId}
                project={project}
                onOpen={handleProjectOpen}
              />
            ))
          ) : (
            <EmptyProjectsState />
          ))}
      </div>
    </section>
  )
}
