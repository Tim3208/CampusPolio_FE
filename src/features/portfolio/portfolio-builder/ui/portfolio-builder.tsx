"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronsUpDown,
  Eye,
  FilePlus2,
  Grid2X2,
  ImagePlus,
  Loader2,
  Search,
  UploadCloud,
  X,
} from "lucide-react";

import type { MyProject, MyProjectsPage } from "@/entities/project";
import {
  createPortfolio,
  updatePortfolio,
  updatePortfolioOrder,
  updatePortfolioProjects,
  updatePortfolioVisibility,
} from "@/entities/portfolio";
import { appRoutes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";

type PortfolioBuilderProps = {
  projectsPage: MyProjectsPage | null;
  errorMessage?: string;
};

type SelectedTemplate = {
  id: "my-projects";
  title: string;
  description: string;
};

const selectedTemplate: SelectedTemplate = {
  id: "my-projects",
  title: "My Projects",
  description: "읽기 전용 아카이브 느낌의 리스트형 포트폴리오 템플릿",
};

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

/**
 * 프로젝트 날짜를 포트폴리오 제작 화면 표시 형식으로 변환한다.
 * @param updatedAt API에서 받은 업데이트 시각
 * @returns `YYYY.MM` 형식 날짜
 */
function formatProjectMonth(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "날짜 없음";
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * 프로젝트 설명의 표시용 fallback 문구를 반환한다.
 * @param project 표시할 프로젝트
 * @returns 카드 설명 문구
 */
function getProjectDescription(project: MyProject) {
  return (
    project.description?.trim() ||
    "프로젝트 상세 설명은 다음 단계에서 연결됩니다."
  );
}

/**
 * 선택된 첫 프로젝트에서 포트폴리오 기본 썸네일 URL을 찾는다.
 * @param projects 선택된 프로젝트 목록
 * @returns 저장 payload에 사용할 썸네일 URL
 */
function getDefaultThumbnailUrl(projects: MyProject[]) {
  return projects.find((project) => project.thumbnailUrl)?.thumbnailUrl ?? null;
}

/**
 * 포트폴리오 생성 입력값의 오류 메시지를 반환한다.
 * @param title 입력한 제목
 * @param description 입력한 설명
 * @returns 유효성 오류 메시지. 통과하면 빈 문자열
 */
function getPortfolioValidationError(title: string, description: string) {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return "포트폴리오 제목을 입력해주세요.";
  }

  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    return `포트폴리오 제목은 ${TITLE_MAX_LENGTH}자 이하로 입력해주세요.`;
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return `포트폴리오 설명은 ${DESCRIPTION_MAX_LENGTH}자 이하로 입력해주세요.`;
  }

  return "";
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
  direction: "up" | "down",
) {
  const currentIndex = projects.findIndex(
    (project) => project.projectId === projectId,
  );
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= projects.length) {
    return projects;
  }

  const nextProjects = [...projects];
  const [project] = nextProjects.splice(currentIndex, 1);
  nextProjects.splice(targetIndex, 0, project);

  return nextProjects;
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
  const router = useRouter();
  const projects = useMemo(() => projectsPage?.content ?? [], [projectsPage]);
  const [keyword, setKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<MyProject[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const defaultThumbnailUrl = useMemo(
    () => getDefaultThumbnailUrl(selectedProjects),
    [selectedProjects],
  );

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(thumbnailPreviewUrl);
      }
    };
  }, [thumbnailPreviewUrl]);

  const filteredProjects = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return projects;
    }

    return projects.filter((project) => {
      const searchable = [
        project.title,
        project.description ?? "",
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedKeyword);
    });
  }, [keyword, projects]);

  /**
   * 프로젝트 선택 여부를 전환한다.
   * @param project 선택하거나 해제할 프로젝트
   */
  function toggleProject(project: MyProject) {
    setNotice("");
    setFormError("");
    setSelectedProjects((currentProjects) => {
      const isSelected = currentProjects.some(
        (currentProject) => currentProject.projectId === project.projectId,
      );

      if (isSelected) {
        return currentProjects.filter(
          (currentProject) => currentProject.projectId !== project.projectId,
        );
      }

      return [...currentProjects, project];
    });
  }

  /**
   * 선택된 프로젝트를 목록에서 제거한다.
   * @param projectId 제거할 프로젝트 ID
   */
  function removeSelectedProject(projectId: number) {
    setFormError("");
    setSelectedProjects((currentProjects) =>
      currentProjects.filter((project) => project.projectId !== projectId),
    );
  }

  /**
   * 선택된 프로젝트 순서를 위아래로 변경한다.
   * @param projectId 이동할 프로젝트 ID
   * @param direction 이동 방향
   */
  function handleMoveProject(projectId: number, direction: "up" | "down") {
    setFormError("");
    setSelectedProjects((currentProjects) =>
      moveSelectedProject(currentProjects, projectId, direction),
    );
  }

  /**
   * 포트폴리오 제목 입력을 상태에 반영한다.
   * @param event 제목 입력 변경 이벤트
   */
  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value);
    setFormError("");
  }

  /**
   * 포트폴리오 설명 입력을 상태에 반영한다.
   * @param event 설명 입력 변경 이벤트
   */
  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
    setFormError("");
  }

  /**
   * 포트폴리오 썸네일 파일 선택을 로컬 미리보기 상태에 반영한다.
   * @param event 파일 input 변경 이벤트
   */
  function handleThumbnailInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    setThumbnailFileName(file.name);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
    setNotice(
      "포트폴리오 썸네일 업로드 API 준비 중입니다. 저장에는 첫 번째 선택 프로젝트 썸네일이 사용됩니다.",
    );
  }

  /**
   * 현재 입력값과 선택 프로젝트로 비공개 포트폴리오를 생성한다.
   */
  async function handlePrivateSave() {
    const validationError = getPortfolioValidationError(title, description);

    setNotice("");
    setFormError("");

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const projectIds = selectedProjects.map((project) => project.projectId);
    const thumbnailUrl = defaultThumbnailUrl;

    setIsSaving(true);

    try {
      const createdPortfolio = await createPortfolio({
        title: trimmedTitle,
      });

      if (trimmedDescription || thumbnailUrl) {
        await updatePortfolio(createdPortfolio.portfolioId, {
          description: trimmedDescription,
          thumbnailUrl,
          title: trimmedTitle,
        });
      }

      if (projectIds.length > 0) {
        await updatePortfolioProjects(createdPortfolio.portfolioId, {
          add: projectIds,
          remove: [],
        });
      }

      if (projectIds.length > 1) {
        await updatePortfolioOrder(createdPortfolio.portfolioId, {
          projectOrder: projectIds,
        });
      }

      await updatePortfolioVisibility(createdPortfolio.portfolioId, {
        isPublic: false,
      });

      router.push(appRoutes.portfolioDetail(createdPortfolio.slug));
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "포트폴리오를 저장하지 못했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
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
              className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white pl-3 pr-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              이전으로 돌아가기
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
            <h2 className="text-base font-extrabold text-slate-950">
              내 프로젝트
            </h2>
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
                    selectedProject.projectId === project.projectId,
                );

                return (
                  <ProjectSelectCard
                    key={project.projectId}
                    project={project}
                    selected={selected}
                    onToggle={toggleProject}
                  />
                );
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
              <span className="ml-3 text-main-10">
                {selectedProjects.length}개
              </span>
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
                <FilePlus2
                  className="size-10 text-slate-400"
                  aria-hidden="true"
                />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  프로젝트를 추가하면 이곳에서 순서를 변경할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </Panel>

        <Panel className="lg:col-span-2 xl:col-span-1">
          <div className="mb-6">
            <h2 className="text-base font-extrabold text-slate-950">
              기본 정보
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              비공개 포트폴리오로 저장한 뒤 상세 페이지에서 확인할 수
              있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-bold text-slate-800">
                제목 <span className="text-main-10">*</span>
              </span>
              <input
                value={title}
                onChange={handleTitleChange}
                maxLength={TITLE_MAX_LENGTH}
                placeholder="예: 공모전 포트폴리오"
                className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-main-10 focus:ring-2 focus:ring-main-20"
              />
              <span className="mt-1 block text-right text-xs font-medium text-slate-400">
                {title.trim().length}/{TITLE_MAX_LENGTH}
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-800">설명</span>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                maxLength={DESCRIPTION_MAX_LENGTH + 1}
                placeholder="포트폴리오 설명을 입력하세요"
                className="mt-2 min-h-28 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-main-10 focus:ring-2 focus:ring-main-20"
              />
              <span
                className={cn(
                  "mt-1 block text-right text-xs font-medium",
                  description.length > DESCRIPTION_MAX_LENGTH
                    ? "text-red-600"
                    : "text-slate-400",
                )}
              >
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </label>

            <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-main-10">
                  <ImagePlus className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    썸네일 업로드
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    포트폴리오 전용 업로드 API 준비 중입니다. 파일 선택은
                    미리보기만 제공하며, 저장 시 첫 번째 선택 프로젝트의
                    썸네일을 사용합니다.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[132px_1fr]">
                <div className="h-24 overflow-hidden rounded-md bg-white">
                  {thumbnailPreviewUrl ? (
                    <div
                      aria-label="선택한 썸네일 미리보기"
                      className="size-full bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${thumbnailPreviewUrl})` }}
                    />
                  ) : defaultThumbnailUrl ? (
                    <div
                      aria-label="저장에 사용할 프로젝트 썸네일"
                      className="size-full bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${defaultThumbnailUrl})` }}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-slate-300">
                      <Grid2X2 className="size-7" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    <UploadCloud className="size-4" aria-hidden="true" />
                    파일 선택
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={handleThumbnailInputChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {thumbnailFileName
                      ? `${thumbnailFileName} 미리보기 중`
                      : defaultThumbnailUrl
                        ? "첫 번째 선택 프로젝트 썸네일이 저장에 사용됩니다."
                        : "저장할 썸네일이 아직 없습니다."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-5 mt-8">
            <h2 className="text-base font-extrabold text-slate-950">
              템플릿 선택
            </h2>
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

      {(formError || notice) && (
        <div className="mx-auto mt-4 w-full max-w-[1504px] px-8">
          <p
            className={cn(
              "rounded-md border px-4 py-3 text-sm font-medium",
              formError
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-main-20 bg-main-22 text-main-10",
            )}
          >
            {formError || notice}
          </p>
        </div>
      )}

      <section className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1504px] flex-col gap-3 px-8 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            disabled={isSaving}
            className="h-12 rounded-md border border-main-20 bg-main-22 px-10 text-sm font-bold text-main-10 transition hover:bg-main-20"
          >
            미리보기
          </button>
          <button
            type="button"
            onClick={handlePrivateSave}
            disabled={isSaving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-slate-900 px-14 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isSaving ? "저장 중" : "비공개 저장"}
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
  );
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
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
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
  active?: boolean;
  label: string;
  number: number;
}) {
  return (
    <li className="flex items-center justify-center gap-3">
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-full text-sm font-extrabold",
          active ? "bg-slate-900 text-white" : "bg-slate-400 text-white",
        )}
      >
        {number}
      </span>
      <span className="text-sm font-extrabold text-slate-800">{label}</span>
    </li>
  );
}

/**
 * 제작 단계 사이 연결선을 렌더링한다.
 * @returns 단계 연결선 UI
 */
function StepLine() {
  return <span className="hidden h-px w-44 bg-slate-200 md:block" />;
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
  onToggle: (project: MyProject) => void;
  project: MyProject;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(project)}
      className={cn(
        "grid w-full grid-cols-[28px_88px_1fr] items-center gap-4 rounded-md border p-3 text-left transition",
        selected
          ? "border-main-20 bg-main-22/40"
          : "border-slate-200 bg-white hover:border-main-20",
      )}
    >
      <span
        className={cn(
          "inline-flex size-5 items-center justify-center rounded border",
          selected
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-transparent",
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
  );
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
  index: number;
  onMove: (projectId: number, direction: "up" | "down") => void;
  onRemove: (projectId: number) => void;
  project: MyProject;
  totalCount: number;
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
  );
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
    );
  }

  return (
    <span className="flex h-16 w-full items-center justify-center rounded bg-slate-100 text-slate-300">
      <Grid2X2 className="size-6" aria-hidden="true" />
    </span>
  );
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
        {[0, 1].map((item) => (
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
  );
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
  onClose: () => void;
  selectedProjects: MyProject[];
  template: SelectedTemplate;
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
  );
}
