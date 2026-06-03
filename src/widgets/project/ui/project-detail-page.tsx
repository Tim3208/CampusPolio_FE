import Link from "next/link"
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  UserRound,
  UsersRound,
} from "lucide-react"

import type { ProjectDetail, ProjectDetailUser } from "@/entities/project"
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
function formatProjectDate(value?: string) {
  if (!value) {
    return "날짜 정보 없음"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "날짜 정보 없음"
  }

  return date.toLocaleDateString("ko-KR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * 프로젝트 사용자 목록에서 작성자를 찾는다.
 * @param users 프로젝트 상세 API의 사용자 목록
 * @returns 작성자 사용자 정보
 */
function getProjectOwner(users: ProjectDetailUser[]) {
  return users.find((user) => user.role === "OWNER")
}

/**
 * 프로젝트 사용자 목록에서 참여자 목록을 찾는다.
 * @param users 프로젝트 상세 API의 사용자 목록
 * @returns OWNER를 제외한 참여자 목록
 */
function getProjectMembers(users: ProjectDetailUser[]) {
  return users.filter((user) => user.role !== "OWNER")
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
      <main className="min-h-screen bg-[#F4F7FA]">
        <section className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-4xl items-center justify-center px-6 py-16">
          <div className="w-full rounded-lg bg-white px-8 py-12 text-center shadow-sm">
            <h1 className="text-2xl font-extrabold text-slate-950">
              프로젝트를 불러오지 못했습니다.
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
  const users = Array.isArray(project.users) ? project.users : []
  const files = Array.isArray(project.files) ? project.files : []
  const owner = getProjectOwner(users)
  const members = getProjectMembers(users)

  return (
    <main className="min-h-screen bg-[#F4F7FA] text-slate-950">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0">
          <Link
            href={appRoutes.home}
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#005E9C] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            이전으로 돌아가기
          </Link>

          <div className="mt-5 flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-[#DCEBFF] px-2 py-1 text-[10px] font-bold uppercase text-[#005E9C]"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="rounded-sm bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                태그 없음
              </span>
            )}
          </div>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[1.02] text-[#151B23] md:text-5xl">
            {project.title}
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
            {project.description || "프로젝트 설명이 없습니다."}
          </p>

          <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-5 border-b border-slate-200 pb-6 text-[11px] uppercase text-slate-500 md:grid-cols-4">
            <div>
              <dt className="font-bold text-slate-400">Author</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {owner?.name ?? "작성자 정보 없음"}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">Members</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {members.length > 0
                  ? members.map((member) => member.name).join(", ")
                  : "참여자 정보 없음"}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">Published</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {formatProjectDate(project.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-400">Stats</dt>
              <dd className="mt-1 normal-case text-slate-950">
                {project.viewCount ?? 0} views
              </dd>
            </div>
          </dl>

          <div className="mt-8 overflow-hidden rounded-md bg-slate-200 shadow-sm">
            {project.thumbnailUrl ? (
              <div
                className="aspect-[16/8.5] bg-cover bg-center"
                style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
                aria-label={`${project.title} 썸네일`}
                role="img"
              />
            ) : (
              <div className="flex aspect-[16/8.5] items-center justify-center text-sm font-medium text-slate-500">
                썸네일 없음
              </div>
            )}
          </div>

          <section className="mt-8 max-w-3xl">
            <h2 className="text-base font-black text-[#151B23]">
              프로젝트 소개
            </h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {project.content || project.description || "본문이 없습니다."}
            </div>
          </section>
        </article>

        <aside className="lg:pt-24">
          <div className="sticky top-20 space-y-4">
            <section className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-[11px] font-black uppercase tracking-wide text-[#151B23]">
                Resources & Links
              </h2>

              <div className="mt-4 space-y-2">
                {files.length > 0 ? (
                  files.map((file) => (
                    <a
                      key={file.fileId}
                      href={file.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#005E9C] hover:text-[#005E9C]"
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{file.originalName}</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ))
                ) : (
                  <p className="rounded-sm border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                    첨부 파일 없음
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCEBFF] text-[#005E9C]">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#151B23]">
                    {owner?.name ?? "작성자 정보 없음"}
                  </p>
                  <p className="text-xs text-slate-500">프로젝트 작성자</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  {project.viewCount ?? 0}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      project.isLiked ? "fill-current text-main-10" : ""
                    }`}
                    aria-hidden="true"
                  />
                  {project.likeCount ?? 0}
                </span>
                <span className="col-span-2 inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatProjectDate(project.createdAt)}
                </span>
                <span className="col-span-2 inline-flex items-start gap-1">
                  <UsersRound
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>
                    {members.length > 0
                      ? members.map((member) => member.name).join(", ")
                      : "참여자 정보 없음"}
                  </span>
                </span>
              </div>
            </section>
          </div>
        </aside>
      </section>
    </main>
  )
}
