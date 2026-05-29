import Link from "next/link"

import { ProjectEditorForm } from "@/features/project/project-editor"
import { appRoutes } from "@/shared/config"

type ProjectEditorPageProps = {
  mode: "create" | "edit"
  projectId?: number
}

/**
 * 프로젝트 등록/수정 페이지의 상위 레이아웃을 렌더링한다.
 * @param props 등록/수정 모드와 기존 프로젝트 ID
 * @returns 프로젝트 편집 페이지 UI
 */
export function ProjectEditorPage({ mode, projectId }: ProjectEditorPageProps) {
  return (
    <main className="min-h-screen bg-[#F5F8FB]">
      <section className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-10">
        <Link
          href={appRoutes.mypageProjects}
          className="inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-main-10"
        >
          ← 대시보드로 돌아가기
        </Link>

        <div className="mt-10 mb-12 max-w-3xl">
          <h1 className="text-4xl font-extrabold leading-tight text-main-10 sm:text-5xl">
            프로젝트 등록 및 정보 수정
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-700">
            삼육대학교 캠퍼스폴리오에 귀하의 연구 및 창작물을 기록합니다.
            모든 정보는 아카이브 표준에 맞추어 전시됩니다.
          </p>
        </div>

        <ProjectEditorForm mode={mode} projectId={projectId} />
      </section>

      <footer className="mt-20 border-t border-slate-200 bg-slate-100/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-8 text-xs tracking-[0.18em] text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© COPYRIGHT 어쩌고 저쩌고.. ALL RIGHTS RESERVED.</p>
          <div className="flex flex-wrap gap-6 tracking-normal">
            <span>대학교 홈페이지</span>
            <span>아카이브 정책</span>
            <span>큐레이터 문의</span>
            <span>디지털 아카이브</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
