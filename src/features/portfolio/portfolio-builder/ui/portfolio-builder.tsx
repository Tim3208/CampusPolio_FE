"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUpDown,
  Eye,
  FilePlus2,
  Grid2X2,
  Search,
  X,
} from "lucide-react"

import type { MyProject, MyProjectsPage } from "@/entities/project"
import { appRoutes } from "@/shared/config"
import { cn } from "@/shared/lib/utils"

type PortfolioBuilderProps = {
  projectsPage: MyProjectsPage | null
  errorMessage?: string
}

type SelectedTemplate = {
  id: "my-projects"
  title: string
  description: string
}

const selectedTemplate: SelectedTemplate = {
  id: "my-projects",
  title: "My Projects",
  description: "읽기 전용 아카이브 느낌의 리스트형 포트폴리오 템플릿",
}

/**
 * 프로젝트 날짜를 포트폴리오 제작 화면 표시 형식으로 변환한다.
 * @param updatedAt API에서 받은 업데이트 시각
 * @returns `YYYY.MM` 형식 날짜
 */
function formatProjectMonth(updatedAt: string) {
  const date = new Date(updatedAt)

  if (Number.isNaN(date.getTime())) {
    return "날짜 없음"
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`
}

/**
 * 프로젝트 설명의 표시용 fallback 문구를 반환한다.
 * @param project 표시할 프로젝트
 * @returns 카드 설명 문구
 */
function getProjectDescription(project: MyProject) {
  return project.description?.trim() || "프로젝트 상세 설명은 다음 단계에서 연결됩니다."
}

/**
 * 선택 프로젝트 배열에서 특정 프로젝트 위치를 이동한다.
 * @param projects 현재 선택 프로젝트
 * @param projectId 이동할 프로젝트 ID
 * @param direction 이동 방향
 * @returns 순서가 변경된 선택 프로젝트
 */
function moveSelectedProject(
  projects: MyProject[],
  projectId: number,
  direction: "up" | "down"
) {
  const currentIndex = projects.findIndex(
    (project) => project.projectId === projectId
  )
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

  if (
    currentIndex < 0 ||
    targetIndex < 0 ||
    targetIndex >= projects.length
  ) {
    return projects
  }

  const nextProjects = [...projects]
  const [project] = nextProjects.splice(currentIndex, 1)
  nextProjects.splice(targetIndex, 0, project)

  return nextProjects
}

/**
 * 포트폴리오 제작 화면의 프로젝트 선택/템플릿 선택 UI를 렌더링한다.
 * @param props 서버에서 조회한 프로젝트 페이지와 오류 메시지
 * @returns 포트폴리오 제작 빌더 UI
 */
export function PortfolioBuilder({
  errorMessage,
  projectsPage,
}: PortfolioBuilderProps) {
  const projects = useMemo(() => projectsPage?.content ?? [], [projectsPage])
  const [keyword, setKeyword] = useState("")
  const [selectedProjects, setSelectedProjects] = useState<MyProject[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [notice, setNotice] = useState("")

  const filteredProjects = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    if (!normalizedKeyword) {
      return projects
    }

    return projects.filter((project) => {
      const searchable = [
        project.title,
        project.description ?? "",
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase()

      return searchable.includes(normalizedKeyword)
    })
  }, [keyword, projects])

  /**
   * 프로젝트 선택 여부를 전환한다.
   * @param project 선택하거나 해제할 프로젝트
   */
  function toggleProject(project: MyProject) {
    setNotice("")
    setSelectedProjects((currentProjects) => {
      const isSelected = currentProjects.some(
        (currentProject) => currentProject.projectId === project.projectId
      )

      if (isSelected) {
        return currentProjects.filter(
          (currentProject) => currentProject.projectId !== project.projectId
        )
      }

      return [...currentProjects, project]
    })
  }

  /**
   * 선택된 프로젝트를 목록에서 제거한다.
   * @param projectId 제거할 프로젝트 ID
   */
  function removeSelectedProject(projectId: number) {
    setSelectedProjects((currentProjects) =>
      currentProjects.filter((project) => project.projectId !== projectId)
    )
  }

  /**
   * 선택된 프로젝트 순서를 위아래로 변경한다.
   * @param projectId 이동할 프로젝트 ID
   * @param direction 이동 방향
   */
  function handleMoveProject(projectId: number, direction: "up" | "down") {
    setSelectedProjects((currentProjects) =>
      moveSelectedProject(currentProjects, projectId, direction)
    )
  }

  /**
   * 다음 단계 버튼의 임시 안내 메시지를 표시한다.
   */
  function handleNextStep() {
    setNotice("다음 단계 연동은 템플릿 생성 API 연결 단계에서 제공됩니다.")
  }

  /**
   * 임시 저장 버튼의 임시 안내 메시지를 표시한다.
   */
  function handleTemporarySave() {
    setNotice("임시 저장은 포트폴리오 저장 API 연결 단계에서 제공됩니다.")
  }

  return (
    <main className="min-h-screen bg-[#f5f8fb] pb-28 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1504px] items-center justify-between gap-6 px-8 py-7">
          <div>
            <p className="text-xs font-bold tracking-[0.28em] text-slate-500">
              INSTITUTIONAL REPOSITORY
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
              포트폴리오 제작
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={appRoutes.mypagePortfolios}
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              나가기
            </Link>
            <Link
              href={appRoutes.mypagePortfolios}
              aria-label="포트폴리오 제작 닫기"
              className="inline-flex size-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <X className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1504px] px-8 py-6">
        <ol className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <StepItem number={1} label="프로젝트 선택" active />
          <StepLine />
          <StepItem number={2} label="템플릿 선택" active />
          <StepLine />
          <StepItem number={3} label="미리보기 및 생성" />
        </ol>
      </section>

      <section className="mx-auto grid w-full max-w-[1504px] grid-cols-1 gap-4 px-8 lg:grid-cols-[1.08fr_0.82fr] xl:grid-cols-[1.08fr_0.82fr_1fr]">
        <Panel>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-base font-extrabold text-slate-950">내 프로젝트</h2>
            <span className="text-sm font-medium text-slate-500">
              {projectsPage?.totalElements ?? projects.length}개
            </span>
          </div>

          <div className="mb-5 grid grid-cols-[1fr_auto] gap-3">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="프로젝트 검색"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-main-10 focus:ring-2 focus:ring-main-20"
              />
            </label>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700"
            >
              최신순
              <ChevronsUpDown className="size-4" aria-hidden="true" />
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const selected = selectedProjects.some(
                  (selectedProject) =>
                    selectedProject.projectId === project.projectId
                )

                return (
                  <ProjectSelectCard
                    key={project.projectId}
                    project={project}
                    selected={selected}
                    onToggle={toggleProject}
                  />
                )
              })
            ) : (
              <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
                표시할 프로젝트가 없습니다.
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-[1fr_auto_auto_1fr] gap-2">
            <button
              type="button"
              disabled
              className="h-9 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-300"
            >
              이전
            </button>
            <span className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-900">
              {projectsPage ? projectsPage.page + 1 : 1}
            </span>
            <span className="inline-flex size-9 items-center justify-center text-sm font-medium text-slate-500">
              {projectsPage?.totalPages && projectsPage.totalPages > 1 ? 2 : ""}
            </span>
            <button
              type="button"
              disabled
              className="h-9 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-400"
            >
              다음
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm font-bold text-slate-950">
              선택된 프로젝트
              <span className="ml-3 text-main-10">{selectedProjects.length}개</span>
            </p>
            <button
              type="button"
              onClick={() => setSelectedProjects([])}
              className="h-9 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              선택 해제
            </button>
          </div>
        </Panel>

        <Panel>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-950">
                선택된 프로젝트
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                위/아래 버튼으로 포트폴리오 표시 순서를 조정할 수 있습니다.
              </p>
            </div>
            <span className="whitespace-nowrap text-sm font-medium text-slate-500">
              {selectedProjects.length}개
            </span>
          </div>

          <div className="space-y-2">
            {selectedProjects.length > 0 ? (
              selectedProjects.map((project, index) => (
                <SelectedProjectCard
                  key={project.projectId}
                  index={index}
                  project={project}
                  totalCount={selectedProjects.length}
                  onMove={handleMoveProject}
                  onRemove={removeSelectedProject}
                />
              ))
            ) : (
              <div className="flex min-h-[328px] flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white px-6 text-center">
                <FilePlus2 className="size-10 text-slate-400" aria-hidden="true" />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  프로젝트를 추가하면 이곳에서 순서를 변경할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </Panel>

        <Panel className="lg:col-span-2 xl:col-span-1">
          <div className="mb-5">
            <h2 className="text-base font-extrabold text-slate-950">템플릿 선택</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              포트폴리오에 사용할 템플릿을 선택하세요.
            </p>
          </div>

          <button
            type="button"
            aria-pressed="true"
            className="w-full rounded-md border border-slate-950 bg-white p-3 text-left"
          >
            <div className="grid grid-cols-[140px_1fr_auto] gap-4">
              <TemplatePreview />
              <div className="min-w-0 self-center">
                <h3 className="text-base font-extrabold text-slate-950">
                  {selectedTemplate.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {selectedTemplate.description}
                </p>
              </div>
              <span className="mt-9 inline-flex size-5 items-center justify-center rounded-full border border-main-10 bg-white">
                <span className="size-2.5 rounded-full bg-main-10" />
              </span>
            </div>
          </button>

          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-main-10" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-950">
                My Projects 템플릿
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              큰 제목, 읽기 전용 배지, 아카이브 ID, 리스트형 프로젝트 카드로
              구성된 공개용 포트폴리오 스타일입니다.
            </p>
          </div>
        </Panel>
      </section>

      {notice && (
        <div className="mx-auto mt-4 w-full max-w-[1504px] px-8">
          <p className="rounded-md border border-main-20 bg-main-22 px-4 py-3 text-sm font-medium text-main-10">
            {notice}
          </p>
        </div>
      )}

      <section className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1504px] flex-col gap-3 px-8 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleTemporarySave}
            className="h-12 rounded-md border border-slate-200 bg-white px-10 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            임시 저장
          </button>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="h-12 rounded-md border border-main-20 bg-main-22 px-10 text-sm font-bold text-main-10 transition hover:bg-main-20"
          >
            미리보기
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="h-12 rounded-md bg-slate-900 px-14 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            다음 단계로
          </button>
        </div>
      </section>

      {isPreviewOpen && (
        <PreviewDialog
          selectedProjects={selectedProjects}
          template={selectedTemplate}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </main>
  )
}

/**
 * 공통 패널 컨테이너를 렌더링한다.
 * @param props 패널 children과 추가 className
 * @returns 카드형 패널 UI
 */
function Panel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      {children}
    </section>
  )
}

/**
 * 제작 단계 항목을 렌더링한다.
 * @param props 단계 번호, 라벨, 활성 여부
 * @returns 단계 표시 UI
 */
function StepItem({
  active,
  label,
  number,
}: {
  active?: boolean
  label: string
  number: number
}) {
  return (
    <li className="flex items-center justify-center gap-3">
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full text-sm font-extrabold",
          active ? "bg-slate-900 text-white" : "bg-slate-400 text-white"
        )}
      >
        {number}
      </span>
      <span className="text-sm font-extrabold text-slate-800">{label}</span>
    </li>
  )
}

/**
 * 제작 단계 사이 연결선을 렌더링한다.
 * @returns 단계 연결선 UI
 */
function StepLine() {
  return <span className="hidden h-px w-44 bg-slate-200 md:block" />
}

/**
 * 프로젝트 선택 카드 UI를 렌더링한다.
 * @param props 프로젝트, 선택 상태, 전환 핸들러
 * @returns 프로젝트 선택 카드
 */
function ProjectSelectCard({
  onToggle,
  project,
  selected,
}: {
  onToggle: (project: MyProject) => void
  project: MyProject
  selected: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(project)}
      className={cn(
        "grid w-full grid-cols-[28px_88px_1fr] items-center gap-4 rounded-md border p-3 text-left transition",
        selected
          ? "border-main-20 bg-main-22/40"
          : "border-slate-200 bg-white hover:border-main-20"
      )}
    >
      <span
        className={cn(
          "inline-flex size-5 items-center justify-center rounded border",
          selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-transparent"
        )}
      >
        <Check className="size-3.5" aria-hidden="true" />
      </span>
      <ProjectThumb project={project} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-extrabold text-slate-950">
          {project.title}
        </span>
        <span className="mt-2 block text-sm text-slate-500">
          {formatProjectMonth(project.updatedAt)} ㅣ{" "}
          {project.status === "PUBLISHED" ? "개인 프로젝트" : "임시 저장"}
        </span>
        <span className="mt-2 flex flex-wrap gap-2">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={`${project.projectId}-${tag}`}
              className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </span>
      </span>
    </button>
  )
}

/**
 * 선택된 프로젝트 카드 UI를 렌더링한다.
 * @param props 프로젝트, 위치, 이동/제거 핸들러
 * @returns 선택된 프로젝트 카드
 */
function SelectedProjectCard({
  index,
  onMove,
  onRemove,
  project,
  totalCount,
}: {
  index: number
  onMove: (projectId: number, direction: "up" | "down") => void
  onRemove: (projectId: number) => void
  project: MyProject
  totalCount: number
}) {
  return (
    <article className="grid grid-cols-[28px_72px_1fr_auto] items-center gap-4 rounded-md border border-slate-200 bg-white p-3">
      <span className="text-center text-sm font-bold text-slate-400">
        {String(index + 1).padStart(2, "0")}
      </span>
      <ProjectThumb project={project} />
      <div className="min-w-0">
        <h3 className="truncate text-sm font-extrabold text-slate-950">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {formatProjectMonth(project.updatedAt)}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMove(project.projectId, "up")}
          disabled={index === 0}
          className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
          <span className="sr-only">위로 이동</span>
        </button>
        <button
          type="button"
          onClick={() => onMove(project.projectId, "down")}
          disabled={index === totalCount - 1}
          className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
        >
          <ArrowDown className="size-4" aria-hidden="true" />
          <span className="sr-only">아래로 이동</span>
        </button>
        <button
          type="button"
          onClick={() => onRemove(project.projectId)}
          className="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">선택 해제</span>
        </button>
      </div>
    </article>
  )
}

/**
 * 프로젝트 썸네일 또는 대체 이미지를 렌더링한다.
 * @param project 표시할 프로젝트
 * @returns 썸네일 UI
 */
function ProjectThumb({ project }: { project: MyProject }) {
  if (project.thumbnailUrl) {
    return (
      <span
        aria-hidden="true"
        className="block h-16 w-full rounded bg-cover bg-center grayscale"
        style={{ backgroundImage: `url(${project.thumbnailUrl})` }}
      />
    )
  }

  return (
    <span className="flex h-16 w-full items-center justify-center rounded bg-slate-100 text-slate-300">
      <Grid2X2 className="size-6" aria-hidden="true" />
    </span>
  )
}

/**
 * My Projects 템플릿 축소 미리보기를 렌더링한다.
 * @returns 템플릿 미리보기 UI
 */
function TemplatePreview() {
  return (
    <div className="h-[112px] rounded border border-slate-200 bg-[#f5f8fb] p-2">
      <div className="mb-2 h-2 w-16 rounded bg-slate-200" />
      <div className="mb-3 h-6 w-24 rounded bg-slate-900" />
      <div className="space-y-2">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="grid h-5 grid-cols-[20px_36px_1fr] items-center gap-2 rounded bg-white px-1"
          >
            <div className="h-2 rounded bg-slate-200" />
            <div className="h-3 rounded bg-slate-300" />
            <div className="h-2 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 선택 내용 요약 미리보기 dialog를 렌더링한다.
 * @param props 선택 프로젝트, 템플릿, 닫기 핸들러
 * @returns 미리보기 dialog UI
 */
function PreviewDialog({
  onClose,
  selectedProjects,
  template,
}: {
  onClose: () => void
  selectedProjects: MyProject[]
  template: SelectedTemplate
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.24em] text-main-10">
              PREVIEW
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
              포트폴리오 미리보기
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">미리보기 닫기</span>
          </button>
        </div>

        <div className="mt-6 rounded-lg bg-[#f5f8fb] p-6">
          <span className="inline-flex items-center gap-2 rounded bg-main-21 px-3 py-1 text-xs font-extrabold tracking-[0.18em] text-main-10">
            <Eye className="size-3.5" aria-hidden="true" />
            READ ONLY PAGE
          </span>
          <h3 className="mt-8 text-5xl font-extrabold tracking-tight text-slate-950">
            My Projects<span className="text-main-10">.</span>
          </h3>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-700">
            선택한 프로젝트 {selectedProjects.length}개가 `{template.title}`
            템플릿 구조로 배치될 예정입니다.
          </p>

          <div className="mt-8 space-y-3">
            {selectedProjects.length > 0 ? (
              selectedProjects.map((project, index) => (
                <article
                  key={project.projectId}
                  className="grid grid-cols-[56px_1fr] gap-4 rounded-md bg-white p-4"
                >
                  <span className="text-2xl font-extrabold text-slate-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={`${project.projectId}-preview-${tag}`}
                          className="rounded bg-main-22 px-2 py-1 text-xs font-bold text-main-10"
                        >
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-950">
                      {project.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {getProjectDescription(project)}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
                미리볼 프로젝트를 먼저 선택해주세요.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
