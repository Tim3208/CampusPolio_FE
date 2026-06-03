"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { type KeyboardEvent } from "react"
import { FilePlus2, FolderKanban, Globe2, Lock, Plus } from "lucide-react"

import type { MyPortfolio } from "@/entities/portfolio"
import { appRoutes } from "@/shared/config"
import { cn } from "@/shared/lib/utils"

type MypagePortfoliosPageProps = {
  errorMessage?: string
  portfolios?: MyPortfolio[]
}

type PortfolioCardProps = {
  onOpen: (slug: string) => void
  portfolio: MyPortfolio
}

/**
 * 포트폴리오 공개 상태를 사용자 표시용 문구로 변환한다.
 * @param portfolio 표시할 포트폴리오
 * @returns 공개 여부 문구
 */
function getVisibilityLabel(portfolio: MyPortfolio) {
  return portfolio.isPublic ? "공개" : "비공개"
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
 * 포트폴리오 제작 화면으로 이동하는 카드 UI를 렌더링한다.
 * @returns 포트폴리오 제작 링크 카드
 */
function PortfolioCreateCard() {
  return (
    <Link
      href={appRoutes.portfolioCreate}
      className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white/40 px-6 text-center transition-colors hover:border-main-02 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-02"
    >
      <span className="mb-5 inline-flex size-14 items-center justify-center rounded-xl bg-slate-200 text-main-02">
        <Plus className="size-6" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold text-[#171f24]">포트폴리오 제작</span>
      <span className="mt-3 max-w-44 text-sm leading-6 text-slate-600">
        프로젝트를 모아 공개용 포트폴리오를 구성하세요
      </span>
    </Link>
  )
}

/**
 * 포트폴리오 카드 클릭 가능 영역을 렌더링한다.
 * @param props 표시할 포트폴리오와 이동 핸들러
 * @returns 포트폴리오 카드 UI
 */
function PortfolioCard({ onOpen, portfolio }: PortfolioCardProps) {
  const visibilityLabel = getVisibilityLabel(portfolio)

  /**
   * 현재 포트폴리오 상세 페이지로 이동한다.
   */
  function handleOpen() {
    onOpen(portfolio.slug)
  }

  /**
   * 키보드 조작으로 포트폴리오 상세 페이지 이동을 실행한다.
   * @param event 카드 키보드 이벤트
   */
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter" && event.key !== " ") {
      return
    }

    event.preventDefault()
    handleOpen()
  }

  return (
    <article
      aria-label={`${portfolio.title} 상세 보기`}
      className="group flex min-h-[360px] cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-02"
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      <div className="relative h-44 overflow-hidden bg-slate-200">
        {portfolio.thumbnailUrl ? (
          <div
            aria-hidden="true"
            className="size-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${portfolio.thumbnailUrl})` }}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm font-medium text-slate-500">
            썸네일 없음
          </div>
        )}

        <span
          className={cn(
            "absolute left-4 top-4 inline-flex h-7 items-center gap-1.5 rounded-sm px-2.5 text-xs font-semibold shadow-sm",
            portfolio.isPublic
              ? "bg-white text-main-02"
              : "bg-slate-950 text-white"
          )}
        >
          {portfolio.isPublic ? (
            <Globe2 className="size-3.5" aria-hidden="true" />
          ) : (
            <Lock className="size-3.5" aria-hidden="true" />
          )}
          {visibilityLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-6 py-6">
        <h2 className="line-clamp-2 min-h-14 text-xl font-extrabold leading-7 text-[#171f24]">
          {portfolio.title}
        </h2>

        <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
          {portfolio.description || "포트폴리오 설명이 없습니다."}
        </p>

        <div className="mt-4">
          <span className="inline-flex h-7 items-center gap-1.5 rounded bg-main-22 px-2.5 text-xs font-bold text-main-02">
            <FolderKanban className="size-3.5" aria-hidden="true" />
            프로젝트 {portfolio.projectCount}개
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
          <span className="text-sm text-slate-600">
            {formatUpdatedAt(portfolio.updatedAt)}
          </span>
          <span className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition group-hover:bg-slate-100 group-hover:text-slate-900">
            <FilePlus2 className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  )
}

/**
 * 포트폴리오 목록이 비어 있을 때의 안내 영역을 렌더링한다.
 * @returns 빈 포트폴리오 목록 상태 UI
 */
function EmptyPortfoliosState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center">
      <div>
        <p className="text-lg font-bold text-[#171f24]">
          아직 포트폴리오가 없습니다
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          포트폴리오 제작 카드에서 첫 포트폴리오를 시작할 수 있습니다.
        </p>
      </div>
    </div>
  )
}

/**
 * 포트폴리오 목록 조회 실패 상태를 렌더링한다.
 * @param message 실패 원인 메시지
 * @returns 포트폴리오 목록 오류 상태 UI
 */
function ErrorPortfoliosState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-red-100 bg-white px-6 text-center">
      <div>
        <p className="text-lg font-bold text-red-600">
          포트폴리오 목록을 불러오지 못했습니다
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      </div>
    </div>
  )
}

/**
 * 마이페이지 포트폴리오 모음 본문을 렌더링한다.
 * @param props 서버에서 조회한 내 포트폴리오 목록과 오류 메시지
 * @returns 포트폴리오 제작 카드와 내 포트폴리오 카드 목록
 */
export function MypagePortfoliosPage({
  errorMessage,
  portfolios = [],
}: MypagePortfoliosPageProps) {
  const router = useRouter()

  /**
   * 선택한 포트폴리오 상세 화면으로 이동한다.
   * @param slug 이동할 포트폴리오 slug
   */
  function handlePortfolioOpen(slug: string) {
    router.push(appRoutes.portfolioDetail(slug))
  }

  return (
    <section className="flex flex-col gap-8 px-8 py-10">
      <h1 className="text-[32px] font-extrabold leading-tight text-[#171f24]">
        포트폴리오 모음
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <PortfolioCreateCard />

        {errorMessage ? (
          <ErrorPortfoliosState
            message={errorMessage ?? "잠시 후 다시 시도해주세요."}
          />
        ) : portfolios.length > 0 ? (
          portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.portfolioId}
              onOpen={handlePortfolioOpen}
              portfolio={portfolio}
            />
          ))
        ) : (
          <EmptyPortfoliosState />
        )}
      </div>
    </section>
  )
}
