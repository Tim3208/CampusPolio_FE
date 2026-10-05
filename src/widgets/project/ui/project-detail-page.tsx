import Link from "next/link"
import { ArrowLeft, ExternalLink, Eye, FilePenLine, FileText, Heart } from "lucide-react"

import type { ProjectDetail } from "@/entities/project"
import { ProjectReviewPanel } from "@/features/project/project-review"
import { appRoutes } from "@/shared/config"
import { MarkdownViewer } from "@/shared/ui/markdown-viewer"
import { ProjectDetailError } from "./project-detail-error"
import { ProjectDetailImage } from "./project-detail-image"

type ProjectDetailPageProps = {
  project?: ProjectDetail
  errorMessage?: string
}

/** API 날짜를 기존 한국어 등록일 형식으로 표시한다. */
function formatProjectDate(value?: string) {
  if (!value) return "날짜 정보 없음"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "날짜 정보 없음"
  return date.toLocaleDateString("ko-KR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** 실제 상세 데이터의 메타·Markdown 본문·자료와 기존 AI 리뷰를 조합한다. */
export function ProjectDetailPage({ errorMessage, project }: ProjectDetailPageProps) {
  if (errorMessage || !project) return <ProjectDetailError message={errorMessage} />

  const tags = Array.isArray(project.tags) ? project.tags : []
  const users = Array.isArray(project.users) ? project.users : []
  const files = Array.isArray(project.files) ? project.files : []
  const viewCount = project.viewCount ?? 0
  const likeCount = project.likeCount ?? 0
  const owner = users.find((user) => user.role === "OWNER")
  const members = users.filter((user) => user.role === "MEMBER")

  return (
    <main className="min-h-screen bg-[#F5F8FB] text-gray-01">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 px-4 pt-7 pb-10 md:gap-5 md:px-8 md:pt-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 lg:px-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-14 xl:px-12 xl:pt-9">
        <article className="flex min-w-0 flex-col gap-4 md:gap-5">
          <Link href={appRoutes.projects} className="inline-flex self-start items-center gap-1.5 text-sm font-semibold text-main-10 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10">
            <ArrowLeft className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            프로젝트 모음으로
          </Link>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex h-7 items-center rounded-full bg-main-22 px-3 text-[13px] font-semibold text-main-10">{tag}</span>
              ))}
            </div>
          ) : null}
          <h1 className="max-w-[900px] text-[26px] leading-[1.35] font-extrabold tracking-[-.03em] break-keep [overflow-wrap:anywhere] text-balance text-main-00 md:text-[32px] md:leading-[1.28] lg:text-[36px] xl:text-[42px]">{project.title}</h1>
          {project.description?.trim() ? <p className="max-w-[62ch] text-[15.5px] leading-[1.75] break-words text-gray-03 md:text-[17px]">{project.description}</p> : null}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-y border-[#E3E9F0] py-[18px] md:grid-cols-4 md:gap-5 [&_dt]:text-[12.5px] [&_dt]:font-bold [&_dt]:text-gray-05 [&_dd]:mt-1 [&_dd]:text-[15px] [&_dd]:font-semibold [&_dd]:[overflow-wrap:anywhere]">
            <div><dt>작성자</dt><dd className={owner?.name?.trim() ? "" : "text-gray-05"}>{owner?.name?.trim() || "작성자 정보 없음"}</dd></div>
            <div><dt>참여자</dt><dd className={members.length ? "" : "text-gray-05"}>{members.length ? members.map((member) => member.name).join(", ") : "없음"}</dd></div>
            <div><dt>등록일</dt><dd>{formatProjectDate(project.createdAt)}</dd></div>
            <div>
              <dt>조회와 좋아요</dt>
              <dd className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1" aria-label={"조회 " + viewCount}><Eye className="size-[15px]" strokeWidth={1.75} aria-hidden="true" />{viewCount.toLocaleString("ko-KR")}</span>
                <span className="inline-flex items-center gap-1" aria-label={"좋아요 " + likeCount}><Heart className={"size-[15px] " + (project.isLiked ? "fill-current text-main-10" : "")} strokeWidth={1.75} aria-hidden="true" />{likeCount.toLocaleString("ko-KR")}</span>
              </dd>
            </div>
          </dl>
          {project.thumbnailUrl ? <ProjectDetailImage url={project.thumbnailUrl} title={project.title} /> : null}
          {project.content?.trim() ? (
            <MarkdownViewer content={project.content} />
          ) : (
            <section className="flex flex-col items-center gap-2.5 rounded-[14px] border border-dashed border-[#CBD6E2] bg-[#FDFEFF] px-6 py-10 text-center">
              <span className="mb-1 grid size-[52px] place-items-center rounded-[14px] bg-main-22 text-main-10"><FilePenLine className="size-6" strokeWidth={1.75} aria-hidden="true" /></span>
              <h2 className="text-[17px] font-bold text-main-00">아직 본문이 작성되지 않았어요</h2>
              <p className="text-sm leading-[1.6] text-gray-05">작성자가 내용을 추가하면 이곳에 표시돼요.</p>
            </section>
          )}
        </article>
        <aside className="min-w-0">
          <div className="grid items-start gap-4 md:grid-cols-2 lg:sticky lg:top-6 lg:grid-cols-1">
            <section className="flex min-w-0 flex-col gap-3 rounded-[14px] border border-[#E3E9F0] bg-[#FDFEFF] p-5 shadow-[0_1px_2px_rgb(0_29_53/.05),0_8px_24px_-14px_rgb(0_29_53/.22)]">
              <div className="flex items-center justify-between"><h2 className="text-base font-bold text-main-00">자료</h2><span className="inline-flex h-[22px] items-center rounded-full bg-main-22 px-2 text-xs font-bold text-main-10">{files.length}</span></div>
              {files.length ? files.map((file) => (
                <a key={file.fileId} href={file.fileUrl} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3 rounded-[10px] border border-[#E3E9F0] bg-[#FDFEFF] px-3 py-2.5 hover:border-main-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-main-22 text-main-10"><FileText className="size-[18px]" strokeWidth={1.75} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1 text-sm leading-[1.45] font-semibold break-all">{file.originalName}</span>
                  <ExternalLink className="size-4 shrink-0 text-gray-05" strokeWidth={1.75} aria-hidden="true" />
                </a>
              )) : <p className="text-sm text-gray-05">첨부된 자료가 없어요.</p>}
            </section>
            <ProjectReviewPanel projectId={project.projectId} />
          </div>
        </aside>
      </div>
    </main>
  )
}
