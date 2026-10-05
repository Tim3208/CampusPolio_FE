"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react"
import { Globe2, ImageOff, Lock, MoreVertical, Plus } from "lucide-react"

import type { MyProject } from "@/entities/project"
import {
  appRoutes,
  getProjectDetailPath,
  getProjectEditPath,
} from "@/shared/config"
import { cn } from "@/shared/lib/utils"

type MypageProjectsPageProps = {
  projects?: MyProject[]
  errorMessage?: string
}

type ProjectCardProps = {
  project: MyProject
  onEdit: (projectId: number) => void
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
      className="flex min-w-0 items-center justify-start gap-3 rounded-[14px] border-[1.5px] border-dashed border-main-20 bg-main-22/35 px-4 py-3.5 text-[15px] font-bold text-main-10 hover:border-main-10 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-main-10 md:min-h-[320px] md:flex-col md:justify-center"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-[14px] border border-main-20 bg-[#FDFEFF] md:size-[52px]">
        <Plus className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span>프로젝트 생성</span>
    </Link>
  )
}

/** 내 프로젝트 API 이미지의 누락과 실패를 동일한 썸네일 대체 모양으로 표시한다. */
function ProjectThumbnail({ url, title }: { url: string | null; title: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  /** 하이드레이션 전에 발생한 이미지 실패도 처리한다. */
  const attachImage = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) setFailedUrl(url)
  }, [url])
  return url && failedUrl !== url ? (
    // eslint-disable-next-line @next/next/no-img-element -- API 동적 외부 이미지를 원격 최적화 없이 표시하고 로드 실패를 처리한다.
    <img ref={attachImage} src={url} alt={title + " 썸네일"} onError={() => setFailedUrl(url)} className="block aspect-[16/10] w-full bg-main-22 object-cover" />
  ) : (
    <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-1.5 bg-main-22 text-[13px] font-semibold text-main-12">
      <ImageOff className="size-[26px]" strokeWidth={1.75} aria-hidden="true" /><span>썸네일 없음</span>
    </div>
  )
}

/**
 * 프로젝트 카드 클릭 가능 영역을 렌더링한다.
 * @param project 표시할 프로젝트
 * @param onEdit 프로젝트 수정 이동 핸들러
 * @param onOpen 프로젝트 상세 이동 핸들러
 * @returns 프로젝트 카드 UI
 */
function ProjectCard({ project, onEdit, onOpen }: ProjectCardProps) {
  const visibilityLabel = getVisibilityLabel(project.status)
  const tags = Array.isArray(project.tags) ? project.tags : []

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
    onEdit(project.projectId)
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
      className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[14px] border border-[#E3E9F0] bg-[#FDFEFF] shadow-[0_1px_2px_rgb(0_29_53/.05),0_8px_24px_-14px_rgb(0_29_53/.22)] hover:border-main-20 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-main-10"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <ProjectThumbnail url={project.thumbnailUrl} title={project.title} />
      <div className="flex min-w-0 flex-1 flex-col gap-2 px-[18px] pt-4 pb-[18px]">
        <span className={cn("inline-flex h-[26px] items-center gap-[5px] self-start rounded-full px-2.5 text-xs font-bold", project.status === "PUBLISHED" ? "bg-main-22 text-main-10" : "border border-[#E3E9F0] bg-[#F5F8FB] text-gray-03")}>
          {project.status === "PUBLISHED" ? <Globe2 className="size-[13px]" strokeWidth={1.75} aria-hidden="true" /> : <Lock className="size-[13px]" strokeWidth={1.75} aria-hidden="true" />}
          {visibilityLabel}
        </span>
        <h2 className="line-clamp-2 text-[17px] font-bold leading-[1.45] tracking-[-.01em] break-keep [overflow-wrap:anywhere] text-main-00">
          {project.title}
        </h2>

        <div className="flex h-6 flex-wrap gap-1.5 overflow-hidden">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <span
                key={`${project.projectId}-${tag}`}
                className="inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-full border border-[#E3E9F0] bg-[#F5F8FB] px-[9px] text-xs text-gray-03"
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

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#E3E9F0] pt-3">
          <span className="min-w-0 text-[13px] text-gray-05">
            {formatUpdatedAt(project.updatedAt)}
          </span>
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-10"
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
 * @param projects 서버에서 조회한 내 프로젝트 목록
 * @param errorMessage 프로젝트 목록 조회 실패 메시지
 * @returns 프로젝트 생성 카드와 내 프로젝트 카드 목록
 */
export function MypageProjectsPage({
  errorMessage,
  projects = [],
}: MypageProjectsPageProps) {
  const router = useRouter()

  /**
   * 선택한 프로젝트 상세 화면으로 이동한다.
   * @param projectId 이동할 프로젝트 ID
   */
  function handleProjectOpen(projectId: number) {
    router.push(getProjectDetailPath(projectId))
  }

  /**
   * 선택한 프로젝트 수정 화면으로 이동한다.
   * @param projectId 이동할 프로젝트 ID
   */
  function handleProjectEdit(projectId: number) {
    router.push(getProjectEditPath(projectId))
  }

  return (
    <section className="flex min-w-0 flex-col gap-4 px-4 pt-7 pb-8 md:gap-6 md:px-8 md:pt-8 md:pb-12 lg:px-10 lg:pt-10 lg:pb-14 xl:px-12 xl:pt-11 xl:pb-16">
      <h1 className="text-[26px] font-extrabold leading-[1.25] tracking-[-.03em] text-main-00 md:text-4xl">
        프로젝트 모음
      </h1>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ProjectCreateCard />

        {errorMessage ? (
          <ErrorProjectsState
            message={errorMessage ?? "잠시 후 다시 시도해주세요."}
          />
        ) : projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.projectId}
              onEdit={handleProjectEdit}
              project={project}
              onOpen={handleProjectOpen}
            />
          ))
        ) : (
          <EmptyProjectsState />
        )}
      </div>
    </section>
  )
}
