import Link from "next/link"
import { FolderKanban, Globe2, Lock } from "lucide-react"

import type { PortfolioDetail } from "@/entities/portfolio"
import { appRoutes, getProjectDetailPath } from "@/shared/config"

type PortfolioDetailPageProps = {
  errorMessage?: string
  portfolio?: PortfolioDetail
}

/**
 * 포트폴리오 상세 화면의 공개 상태 문구를 반환한다.
 * @param portfolio 표시할 포트폴리오
 * @returns 공개 상태 문구
 */
function getPortfolioVisibilityLabel(portfolio: PortfolioDetail) {
  return portfolio.isPublic ? "공개 포트폴리오" : "비공개 포트폴리오"
}

/**
 * 포트폴리오 상세 페이지 본문을 렌더링한다.
 * @param props 포트폴리오 상세 데이터와 오류 메시지
 * @returns 포트폴리오 상세 화면 UI
 */
export function PortfolioDetailPage({
  errorMessage,
  portfolio,
}: PortfolioDetailPageProps) {
  if (errorMessage || !portfolio) {
    return (
      <main className="min-h-screen bg-[#F5F8FB]">
        <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-lg bg-white px-8 py-12 text-center shadow-sm">
            <h1 className="text-2xl font-extrabold text-slate-950">
              포트폴리오를 불러오지 못했습니다
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {errorMessage ?? "잠시 후 다시 시도해주세요."}
            </p>
            <Link
              href={appRoutes.mypagePortfolios}
              className="mt-8 inline-flex h-10 items-center rounded-md bg-main-10 px-4 text-sm font-bold text-white"
            >
              포트폴리오 모음으로 돌아가기
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const projects = Array.isArray(portfolio.projects) ? portfolio.projects : []

  return (
    <main className="min-h-screen bg-[#F5F8FB]">
      <article className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href={appRoutes.mypagePortfolios}
          className="text-sm font-semibold text-slate-600 transition hover:text-main-10"
        >
          포트폴리오 모음으로 돌아가기
        </Link>

        <header className="mt-8">
          <span className="inline-flex h-8 items-center gap-2 rounded bg-main-22 px-3 text-sm font-bold text-main-10">
            {portfolio.isPublic ? (
              <Globe2 className="size-4" aria-hidden="true" />
            ) : (
              <Lock className="size-4" aria-hidden="true" />
            )}
            {getPortfolioVisibilityLabel(portfolio)}
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
            {portfolio.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            {portfolio.description || "포트폴리오 설명이 없습니다."}
          </p>
        </header>

        <div className="mt-10 overflow-hidden rounded-lg bg-slate-200 shadow-sm">
          {portfolio.thumbnailUrl ? (
            <div
              aria-label={`${portfolio.title} 썸네일`}
              className="h-[420px] bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${portfolio.thumbnailUrl})` }}
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm font-medium text-slate-500">
              썸네일 없음
            </div>
          )}
        </div>

        <section className="mt-10 rounded-lg bg-white px-7 py-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-950">
                포함된 프로젝트
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                공개 포트폴리오에 연결된 프로젝트 목록입니다.
              </p>
            </div>
            <span className="inline-flex h-8 items-center gap-2 rounded bg-main-22 px-3 text-sm font-bold text-main-10">
              <FolderKanban className="size-4" aria-hidden="true" />
              {projects.length}개
            </span>
          </div>

          {projects.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.projectId}
                  href={getProjectDetailPath(project.projectId)}
                  className="group overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-02"
                >
                  <div className="h-36 bg-slate-200">
                    {project.thumbnailUrl ? (
                      <div
                        aria-hidden="true"
                        className="size-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${project.thumbnailUrl})`,
                        }}
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm font-medium text-slate-500">
                        썸네일 없음
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-extrabold leading-7 text-[#171f24]">
                      {project.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {project.description || "프로젝트 설명이 없습니다."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-lg border border-dashed border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
              연결된 공개 프로젝트가 없습니다.
            </div>
          )}
        </section>
      </article>
    </main>
  )
}
