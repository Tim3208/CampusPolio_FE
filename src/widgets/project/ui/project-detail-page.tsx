import Link from "next/link"
import { CalendarDays, Eye, Heart, UserRound, UsersRound } from "lucide-react"

import type { ProjectDetail } from "@/entities/project"
import { appRoutes } from "@/shared/config"

type ProjectDetailPageProps = {
  project?: ProjectDetail
  errorMessage?: string
}

/**
 * API에서 받은 날짜 문자열을 상세 페이지 표시용 날짜로 변환한다.
 * @param value API 날짜 문자열
 * @returns 한국어 날짜 문자열
 */
function formatProjectDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "날짜 없음"
  }

  return date.toLocaleDateString("ko-KR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * 프로젝트 작성자 이름을 안전하게 반환한다.
 * @param project 상세 페이지에 표시할 프로젝트
 * @returns 작성자 이름 또는 기본 문구
 */
function getAuthorName(project: ProjectDetail) {
  return project.author?.name || "작성자 정보 없음"
}

/**
 * 프로젝트 상세 페이지 본문을 렌더링한다.
 * @param props 프로젝트 상세 데이터와 오류 메시지
 * @returns 프로젝트 상세 화면 UI
 */
export function ProjectDetailPage({
  errorMessage,
  project,
}: ProjectDetailPageProps) {
  if (errorMessage || !project) {
    return (
      <main className="min-h-screen bg-[#F5F8FB]">
        <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-lg bg-white px-8 py-12 text-center shadow-sm">
            <h1 className="text-2xl font-extrabold text-slate-950">
              프로젝트를 불러오지 못했습니다
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {errorMessage ?? "잠시 후 다시 시도해주세요."}
            </p>
            <Link
              href={appRoutes.home}
              className="mt-8 inline-flex h-10 items-center rounded-md bg-main-10 px-4 text-sm font-bold text-white"
            >
              메인으로 돌아가기
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const tags = Array.isArray(project.tags) ? project.tags : []
  const members = Array.isArray(project.members) ? project.members : []

  return (
    <main className="min-h-screen bg-[#F5F8FB]">
      <article className="mx-auto w-full max-w-5xl px-6 py-12 lg:px-10">
        <Link
          href={appRoutes.home}
          className="text-sm font-semibold text-slate-600 transition hover:text-main-10"
        >
          메인으로 돌아가기
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-main-22 px-2.5 py-1 text-xs font-bold text-main-10"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                태그 없음
              </span>
            )}
          </div>

          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            {project.description || "프로젝트 설명이 없습니다."}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <UserRound className="size-4" aria-hidden="true" />
              {getAuthorName(project)}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatProjectDate(project.createdAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Heart className="size-4" aria-hidden="true" />
              {project.likes ?? 0}
            </span>
            <span className="inline-flex items-center gap-2">
              <Eye className="size-4" aria-hidden="true" />
              {project.views ?? 0}
            </span>
          </div>
        </header>

        <div className="mt-10 overflow-hidden rounded-lg bg-slate-200 shadow-sm">
          {project.thumbnailUrl ? (
            <div
              className="h-[420px] bg-cover bg-center"
              style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
              aria-label={`${project.title} 썸네일`}
              role="img"
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center text-sm font-medium text-slate-500">
              썸네일 없음
            </div>
          )}
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_240px]">
          <div className="rounded-lg bg-white px-7 py-8 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-950">
              프로젝트 소개
            </h2>
            <div className="mt-6 whitespace-pre-wrap text-base leading-8 text-slate-700">
              {project.content || project.description || "본문이 없습니다."}
            </div>
          </div>

          <aside className="rounded-lg bg-white px-6 py-7 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-950">
              프로젝트 정보
            </h2>

            <dl className="mt-5 space-y-5 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">공개 상태</dt>
                <dd className="mt-1 font-bold text-slate-900">
                  {project.isPublic ? "공개" : "비공개"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">수정일</dt>
                <dd className="mt-1 text-slate-900">
                  {formatProjectDate(project.updatedAt)}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">참여자</dt>
                <dd className="mt-2 space-y-2 text-slate-900">
                  {members.length > 0 ? (
                    members.map((member) => (
                      <span
                        key={member.userId}
                        className="flex items-center gap-2"
                      >
                        <UsersRound className="size-4 text-slate-400" aria-hidden="true" />
                        {member.name}
                      </span>
                    ))
                  ) : (
                    <span>참여자 정보 없음</span>
                  )}
                </dd>
              </div>
            </dl>
          </aside>
        </section>
      </article>
    </main>
  )
}
