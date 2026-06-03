"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileImage,
  FileText,
  Globe2,
  Lock,
  Save,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";

import {
  createProjectDraft,
  getProject,
  publishProject,
  requestProjectFileUpload,
  updateProject,
} from "@/entities/project";
import { getCurrentUser } from "@/entities/user";
import { ApiError } from "@/shared/api";
import {
  appRoutes,
  getProjectEditPath,
  queryParams,
} from "@/shared/config";
import { cn } from "@/shared/lib/utils";

import {
  ProjectEditorErrorDialog,
  type ProjectEditorDialogError,
} from "./project-editor-error-dialog";
import {
  RichMarkdownEditor,
  type RichMarkdownEditorHandle,
} from "./rich-markdown-editor";

type ProjectEditorMode = "create" | "edit";

type ProjectEditorFormProps = {
  mode: ProjectEditorMode;
  projectId?: number;
};

type UploadedProjectAsset = {
  id: string;
  name: string;
  size: number;
  type: string;
  fileUrl: string;
  kind: "image" | "document";
};

type LoadState = "idle" | "loading" | "error" | "success";
type SavingAction = "draft" | "publish" | "save";

const recommendedTags = [
  "건축학",
  "시각디자인",
  "AI",
  "지속가능성",
  "학술연구",
  "졸업작품",
] as const;

const departments = [
  "신학과",
  "간호학과",
  "약학과",
  "자유전공학부(창의)",
  "자유전공학부(미래)",
  "경영학과",
  "글로벌한국학과",
  "영어영문학과",
  "상담심리학과",
  "유아교육과",
  "항공관광외국어학부",
  "사회복지학과",
  "음악학과",
  "아트앤디자인학과",
  "체육학과",
  "물리치료학과",
  "식품영양학과",
  "동물자원과학과",
  "바이오융합공학과",
  "화학생명과학과",
  "환경디자인원예학과",
  "인공지능융합학부",
  "컴퓨터공학부",
  "건축학과(5년제)",
  "건축학과(4년제)",
  "데이터클라우드공학과",
  "기타",
] as const;

type Department = (typeof departments)[number];

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_PROJECT_TITLE_LENGTH = 255;
const MAX_TAG_COUNT = 10;

/**
 * 파일 크기를 사용자에게 읽기 쉬운 단위로 변환한다.
 * @param size 파일 byte 크기
 * @returns 표시용 파일 크기 문자열
 */
function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)}MB`;
  }

  if (size >= 1024) {
    return `${Math.ceil(size / 1024)}KB`;
  }

  return `${size}B`;
}

/**
 * 태그 입력값을 저장 가능한 태그 이름으로 정리한다.
 * @param value 사용자가 입력한 태그 문자열
 * @returns 앞의 #과 여백이 제거된 태그 이름
 */
function normalizeTag(value: string) {
  return value.trim().replace(/^#+/, "").trim();
}

/**
 * 파일이 프로젝트 첨부 허용 형식인지 확인한다.
 * @param file 검사할 파일
 * @returns 업로드 허용 여부
 */
function isAllowedProjectFile(file: File) {
  const name = file.name.toLowerCase();

  return (
    file.type === "application/pdf" ||
    file.type === "text/markdown" ||
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".pdf")
  );
}

/**
 * 파일이 본문 이미지 삽입에 사용할 수 있는 이미지인지 확인한다.
 * @param file 검사할 파일
 * @returns 이미지 파일 여부
 */
function isImageFile(file: File) {
  const name = file.name.toLowerCase();

  return (
    file.type.startsWith("image/") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png")
  );
}

/**
 * 마크다운 본문에서 목록용 설명 문구를 추출한다.
 * @param content 마크다운 본문
 * @returns 저장 API에 전달할 요약 설명
 */
function getMarkdownSummary(content: string) {
  const summary = content
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return summary.slice(0, 180);
}

/**
 * 프로젝트 제목이 API 저장 제한을 만족하는지 확인한다.
 * @param value 사용자가 입력한 프로젝트 제목
 * @returns 저장 가능하면 true
 */
function isValidProjectTitle(value: string) {
  return value.trim().length <= MAX_PROJECT_TITLE_LENGTH;
}

/**
 * 본문 또는 첨부 파일 목록에서 대표 이미지 URL을 찾는다.
 * @param content 마크다운 본문
 * @param assets 업로드된 파일 목록
 * @returns 대표 이미지 URL. 없으면 null
 */
function getThumbnailUrl(content: string, assets: UploadedProjectAsset[]) {
  const markdownImage = content.match(/!\[[^\]]*]\(([^)]+)\)/);

  if (markdownImage?.[1]) {
    return markdownImage[1];
  }

  return assets.find((asset) => asset.kind === "image")?.fileUrl ?? null;
}

/**
 * 편집 화면에서 사용할 연도 선택지를 만든다.
 * @returns 최근 5개 제작 연도
 */
function getProductionYears() {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 5 }, (_, index) => String(currentYear - index));
}

/**
 * 현재 편집 화면의 next 경로를 만든다.
 * @param mode 등록/수정 모드
 * @param projectId 수정 중인 프로젝트 ID
 * @returns 로그인/인증 이후 돌아올 내부 경로
 */
function getEditorNextPath(mode: ProjectEditorMode, projectId?: number) {
  return mode === "edit" && projectId
    ? getProjectEditPath(projectId)
    : appRoutes.projectCreate;
}

/**
 * next query를 포함한 인증 관련 경로를 만든다.
 * @param route 이동할 인증 화면 경로
 * @param nextPath 인증 후 돌아올 경로
 * @returns next query가 포함된 경로
 */
function getAuthRedirectPath(route: string, nextPath: string) {
  return `${route}?${queryParams.next}=${encodeURIComponent(nextPath)}`;
}

/**
 * API 오류를 프로젝트 등록 전용 대화상자 정보로 변환한다.
 * @param error API 또는 일반 오류 객체
 * @returns 사용자에게 표시할 오류 대화상자 정보
 */
function getProjectEditorDialogError(
  error: unknown,
): ProjectEditorDialogError {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return {
        action: "login",
        actionLabel: "로그인하기",
        description:
          "프로젝트를 저장하거나 등록하려면 먼저 로그인해야 합니다.",
        title: "로그인이 필요합니다",
      };
    }

    if (error.status === 403) {
      return {
        action: "verify-email",
        actionLabel: "학교 이메일 인증하기",
        description:
          "프로젝트를 저장하거나 등록하려면 학교 이메일 인증을 완료해야 합니다.",
        title: "학교 이메일 인증이 필요합니다",
      };
    }

    if (error.status === 400) {
      return {
        action: "close",
        actionLabel: "확인",
        description:
          error.message || "입력한 프로젝트 정보를 다시 확인해주세요.",
        title: "입력 내용을 확인해주세요",
      };
    }

    return {
      action: "close",
      actionLabel: "확인",
      description: error.message || "요청 처리 중 오류가 발생했습니다.",
      title: "요청을 처리하지 못했습니다",
    };
  }

  return {
    action: "close",
    actionLabel: "확인",
    description:
      error instanceof Error
        ? error.message
        : "요청 처리 중 오류가 발생했습니다.",
    title: "요청을 처리하지 못했습니다",
  };
}

/**
 * 프로젝트 등록과 수정에 공통으로 쓰이는 마크다운 편집 폼을 렌더링한다.
 * @param props 등록/수정 모드와 기존 프로젝트 ID
 * @returns 프로젝트 편집 폼 UI
 */
export function ProjectEditorForm({ mode, projectId }: ProjectEditorFormProps) {
  const router = useRouter();
  const richEditorRef = useRef<RichMarkdownEditorHandle | null>(null);
  const assetInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [draftProjectId, setDraftProjectId] = useState(projectId);
  const [loadState, setLoadState] = useState<LoadState>(
    mode === "edit" ? "loading" : "success",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [productionYear, setProductionYear] = useState(
    String(new Date().getFullYear()),
  );
  const [term, setTerm] = useState("1");
  const [department, setDepartment] = useState<Department>(departments[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedProjectAsset[]>(
    [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [savingAction, setSavingAction] = useState<SavingAction | null>(null);
  const [notice, setNotice] = useState("");
  const [dialogError, setDialogError] =
    useState<ProjectEditorDialogError | null>(null);
  const years = getProductionYears();
  const isSaving = savingAction !== null;
  const nextPath = getEditorNextPath(mode, projectId);

  useEffect(() => {
    if (mode !== "edit" || !projectId) {
      return;
    }

    let ignore = false;
    const targetProjectId = projectId;

    /**
     * 기존 프로젝트 정보를 불러와 수정 폼 초기값으로 반영한다.
     */
    async function loadProject() {
      setLoadState("loading");
      setErrorMessage("");

      try {
        const project = await getProject(targetProjectId);

        if (ignore) {
          return;
        }

        setDraftProjectId(project.projectId);
        setTitle(project.title);
        setContent(project.content || project.description);
        setTags(project.tags);
        setLoadState("success");
      } catch (error) {
        if (ignore) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "프로젝트 정보를 불러오지 못했습니다.",
        );
        setLoadState("error");
      }
    }

    void loadProject();

    return () => {
      ignore = true;
    };
  }, [mode, projectId]);

  /**
   * 임시 프로젝트가 없으면 생성하고 현재 편집 대상 ID를 반환한다.
   * @returns 저장과 파일 업로드에 사용할 프로젝트 ID
   */
  async function ensureDraftProjectId() {
    if (draftProjectId) {
      return draftProjectId;
    }

    const draft = await createProjectDraft({
      description: getMarkdownSummary(content),
      title: title.trim() || "새 프로젝트",
    });
    setDraftProjectId(draft.projectId);

    return draft.projectId;
  }

  /**
   * 저장/등록/업로드 직전에 로그인과 학교 인증 상태를 다시 확인한다.
   */
  async function ensureVerifiedUser() {
    const user = await getCurrentUser({ cache: "no-store" });

    if (!user.isVerified) {
      throw new ApiError("학교 이메일 인증이 필요합니다.", 403);
    }
  }

  /**
   * 태그 목록에 새 태그를 추가한다.
   * @param value 추가할 태그 입력값
   */
  function addTag(value: string) {
    const tag = normalizeTag(value);

    if (!tag || tags.includes(tag)) {
      return;
    }

    if (tags.length >= MAX_TAG_COUNT) {
      setNotice(`태그는 최대 ${MAX_TAG_COUNT}개까지 추가할 수 있습니다.`);
      return;
    }

    setTags((currentTags) => [...currentTags, tag]);
    setTagInput("");
  }

  /**
   * 선택한 태그를 목록에서 제거한다.
   * @param tag 제거할 태그
   */
  function removeTag(tag: string) {
    setTags((currentTags) =>
      currentTags.filter((currentTag) => currentTag !== tag),
    );
  }

  /**
   * 태그 입력 Enter 키로 태그를 추가한다.
   * @param event 태그 입력 키보드 이벤트
   */
  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addTag(tagInput);
  }

  /**
   * 파일 하나를 프로젝트 업로드 API와 스토리지에 업로드한다.
   * @param file 업로드할 파일
   * @returns 업로드된 파일 표시 정보
   */
  async function uploadSingleFile(file: File): Promise<UploadedProjectAsset> {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name}은 최대 50MB를 초과했습니다.`);
    }

    if (!isAllowedProjectFile(file)) {
      throw new Error(`${file.name}은 지원하지 않는 파일 형식입니다.`);
    }

    await ensureVerifiedUser();

    const targetProjectId = await ensureDraftProjectId();
    const upload = await requestProjectFileUpload(targetProjectId, file);

    return {
      fileUrl: upload.fileUrl,
      id: `${upload.fileId}-${file.name}`,
      kind: isImageFile(file) ? "image" : "document",
      name: file.name,
      size: file.size,
      type: file.type || "파일",
    };
  }

  /**
   * 선택되거나 드롭된 파일 목록을 순차 업로드한다.
   * @param files 업로드할 파일 목록
   */
  async function uploadFiles(files: FileList | File[]) {
    const nextFiles = Array.from(files);

    if (nextFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setNotice("");

    try {
      const uploaded: UploadedProjectAsset[] = [];

      for (const file of nextFiles) {
        uploaded.push(await uploadSingleFile(file));
      }

      setUploadedAssets((currentAssets) => [...currentAssets, ...uploaded]);
      setNotice(`${uploaded.length}개 파일을 업로드했습니다.`);
    } catch (error) {
      if (error instanceof ApiError) {
        setDialogError(getProjectEditorDialogError(error));
        return;
      }

      setNotice(
        error instanceof Error
          ? error.message
          : "파일 업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * 첨부 파일 input 변경을 처리한다.
   * @param event 파일 input 변경 이벤트
   */
  function handleAssetInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void uploadFiles(event.target.files);
    }

    event.target.value = "";
  }

  /**
   * 본문 삽입용 이미지 input 변경을 처리한다.
   * @param event 파일 input 변경 이벤트
   */
  async function handleInlineImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isImageFile(file)) {
      setNotice("본문에는 JPG 또는 PNG 이미지만 삽입할 수 있습니다.");
      return;
    }

    setIsUploading(true);
    setNotice("");

    try {
      const uploaded = await uploadSingleFile(file);

      setUploadedAssets((currentAssets) => [...currentAssets, uploaded]);
      richEditorRef.current?.insertImage(file.name, uploaded.fileUrl);
      setNotice("본문에 이미지를 삽입했습니다.");
    } catch (error) {
      if (error instanceof ApiError) {
        setDialogError(getProjectEditorDialogError(error));
        return;
      }

      setNotice(
        error instanceof Error
          ? error.message
          : "이미지 삽입 중 오류가 발생했습니다.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  /**
   * 파일 드래그 오버 기본 동작을 막는다.
   * @param event 드래그 이벤트
   */
  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  /**
   * 드롭된 파일을 업로드한다.
   * @param event 드롭 이벤트
   */
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void uploadFiles(event.dataTransfer.files);
  }

  /**
   * 첨부 파일 목록에서 파일을 제거한다.
   * @param assetId 제거할 파일 ID
   */
  function removeUploadedAsset(assetId: string) {
    setUploadedAssets((currentAssets) =>
      currentAssets.filter((asset) => asset.id !== assetId),
    );
  }

  /**
   * 현재 입력값을 프로젝트 수정 API payload로 만든다.
   * @returns 프로젝트 저장 요청에 사용할 payload
   */
  function getProjectUpdatePayload() {
    const thumbnail = getThumbnailUrl(content, uploadedAssets);

    return {
      content,
      description: getMarkdownSummary(content),
      tags: tags.slice(0, MAX_TAG_COUNT),
      title: title.trim(),
      ...(thumbnail ? { thumbnail } : {}),
    };
  }

  /**
   * 현재 입력값을 Draft 프로젝트에 저장한다.
   * @param targetProjectId 저장할 프로젝트 ID
   */
  async function saveProjectDetail(targetProjectId: number) {
    await updateProject(targetProjectId, getProjectUpdatePayload());
  }

  /**
   * Draft 상태로 현재 프로젝트를 임시 저장한다.
   */
  async function handleDraftSave() {
    if (!title.trim()) {
      setNotice("임시 저장하려면 프로젝트 제목을 입력해주세요.");
      return;
    }

    if (!isValidProjectTitle(title)) {
      setNotice(
        `프로젝트 제목은 최대 ${MAX_PROJECT_TITLE_LENGTH}자까지 입력할 수 있습니다.`,
      );
      return;
    }

    setSavingAction("draft");
    setNotice("");

    try {
      await ensureVerifiedUser();

      const targetProjectId = await ensureDraftProjectId();

      await saveProjectDetail(targetProjectId);
      router.push(appRoutes.mypageProjects);
    } catch (error) {
      setDialogError(getProjectEditorDialogError(error));
    } finally {
      setSavingAction(null);
    }
  }

  /**
   * 프로젝트 내용을 저장한 뒤 공개 등록한다.
   * @param event 폼 제출 이벤트
   */
  async function handlePublishSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isPublic) {
      if (!title.trim()) {
        setNotice("비공개로 저장하려면 프로젝트 제목을 입력해주세요.");
        return;
      }

      if (!isValidProjectTitle(title)) {
        setNotice(
          `프로젝트 제목은 최대 ${MAX_PROJECT_TITLE_LENGTH}자까지 입력할 수 있습니다.`,
        );
        return;
      }

      setSavingAction("draft");
      setNotice("");

      try {
        await ensureVerifiedUser();

        const targetProjectId = await ensureDraftProjectId();

        await saveProjectDetail(targetProjectId);
        router.push(appRoutes.mypageProjects);
      } catch (error) {
        setDialogError(getProjectEditorDialogError(error));
      } finally {
        setSavingAction(null);
      }

      return;
    }

    if (!title.trim() || !content.trim()) {
      setNotice("프로젝트 제목과 본문을 입력해주세요.");
      return;
    }

    if (!isValidProjectTitle(title)) {
      setNotice(
        `프로젝트 제목은 최대 ${MAX_PROJECT_TITLE_LENGTH}자까지 입력할 수 있습니다.`,
      );
      return;
    }

    if (mode === "edit") {
      setSavingAction("save");
      setNotice("");

      try {
        await ensureVerifiedUser();

        const targetProjectId = await ensureDraftProjectId();

        await saveProjectDetail(targetProjectId);
        router.push(appRoutes.mypageProjects);
      } catch (error) {
        setDialogError(getProjectEditorDialogError(error));
      } finally {
        setSavingAction(null);
      }

      return;
    }

    setSavingAction("publish");
    setNotice("");

    try {
      await ensureVerifiedUser();

      const targetProjectId = await ensureDraftProjectId();
      const payload = getProjectUpdatePayload();

      await saveProjectDetail(targetProjectId);
      await publishProject(targetProjectId, {
        content: payload.content,
        tags: payload.tags,
        title: payload.title,
      });

      router.push(appRoutes.mypageProjects);
    } catch (error) {
      setDialogError(getProjectEditorDialogError(error));
    } finally {
      setSavingAction(null);
    }
  }

  /**
   * 로그인 페이지로 이동한다.
   */
  function goToLogin() {
    router.push(getAuthRedirectPath(appRoutes.login, nextPath));
  }

  /**
   * 학교 이메일 인증 페이지로 이동한다.
   */
  function goToVerifyEmail() {
    router.push(getAuthRedirectPath(appRoutes.verifyEmail, nextPath));
  }

  if (loadState === "loading") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-sm text-slate-600">
        프로젝트 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="rounded-lg border border-red-100 bg-white p-10">
        <p className="text-lg font-bold text-red-600">
          프로젝트 정보를 불러오지 못했습니다
        </p>
        <p className="mt-2 text-sm text-slate-600">{errorMessage}</p>
        <button
          type="button"
          onClick={() => router.push(appRoutes.mypageProjects)}
          className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-main-10 px-4 text-sm font-bold text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          프로젝트 모음으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handlePublishSubmit}
        className="grid gap-10 lg:grid-cols-[1fr_360px]"
      >
      <section className="space-y-12">
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10">
          <div className="space-y-8">
            <div>
              <label
                htmlFor="project-title"
                className="text-sm font-bold text-main-10"
              >
                프로젝트 제목
              </label>
              <input
                id="project-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={MAX_PROJECT_TITLE_LENGTH}
                placeholder="프로젝트 제목을 입력하세요"
                className="mt-3 h-14 w-full border border-slate-400 bg-white px-3 text-xl font-semibold text-slate-950 outline-none transition focus:border-main-10 focus:ring-2 focus:ring-main-20"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label
                  htmlFor="project-content"
                  className="text-sm font-bold text-main-10"
                >
                  본문
                </label>
              </div>

              <RichMarkdownEditor
                ref={richEditorRef}
                id="project-content"
                value={content}
                disabled={isUploading}
                onChange={setContent}
                onImageButtonClick={() => imageInputRef.current?.click()}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="hidden"
                onChange={handleInlineImageChange}
              />
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950">
              태그 설정
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              프로젝트를 가장 잘 나타내는 키워드를 선택하거나 입력하세요.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="mb-4 text-xs font-semibold text-slate-500">
              추천 태그
            </p>
            <div className="flex flex-wrap gap-3">
              {recommendedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className={cn(
                    "inline-flex h-9 items-center rounded px-4 text-sm font-semibold transition",
                    tags.includes(tag)
                      ? "bg-main-21 text-main-10"
                      : "bg-slate-100 text-slate-700 hover:bg-main-22 hover:text-main-10",
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Tag
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="새로운 태그 입력 후 Enter..."
              className="h-14 w-full border border-slate-400 bg-white pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-main-10 focus:ring-2 focus:ring-main-20"
            />
          </div>

          <div className="flex min-h-8 flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => removeTag(tag)}
                className="inline-flex h-8 items-center gap-2 rounded bg-main-10 px-3 text-sm font-bold text-white"
              >
                #{tag}
                <X className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{tag} 태그 삭제</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
            <FileImage className="size-6 text-main-10" aria-hidden="true" />
            에셋 및 문서 관리
          </h2>

          <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex min-h-60 flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white px-6 text-center transition hover:border-main-20"
            >
              <input
                ref={assetInputRef}
                type="file"
                multiple
                accept=".pdf,.md,.markdown,.jpg,.jpeg,.png,application/pdf,text/markdown,image/jpeg,image/png"
                className="hidden"
                onChange={handleAssetInputChange}
              />
              <button
                type="button"
                onClick={() => assetInputRef.current?.click()}
                disabled={isUploading}
                className="mb-6 inline-flex size-16 items-center justify-center rounded-lg bg-main-21 text-main-10 disabled:opacity-50"
              >
                <UploadCloud className="size-7" aria-hidden="true" />
                <span className="sr-only">파일 선택</span>
              </button>
              <p className="text-base font-bold text-slate-950">
                클릭하거나 파일을 드래그하세요
              </p>
              <p className="mt-2 text-sm text-slate-500">
                PDF, Markdown, JPG, PNG (최대 50MB)
              </p>
            </div>

            <div className="min-h-60 bg-slate-100 p-6">
              <p className="mb-4 text-xs font-semibold text-slate-500">
                업로드된 파일 ({uploadedAssets.length})
              </p>

              {uploadedAssets.length > 0 ? (
                <ul className="space-y-3">
                  {uploadedAssets.map((asset) => (
                    <li
                      key={asset.id}
                      className="flex min-h-12 items-center justify-between gap-3 rounded bg-white px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {asset.kind === "image" ? (
                          <FileImage
                            className="size-5 shrink-0 text-main-10"
                            aria-hidden="true"
                          />
                        ) : (
                          <FileText
                            className="size-5 shrink-0 text-main-10"
                            aria-hidden="true"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {asset.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(asset.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUploadedAsset(asset.id)}
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <X className="size-4" aria-hidden="true" />
                        <span className="sr-only">{asset.name} 제거</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex min-h-36 items-center justify-center rounded border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                  아직 업로드된 파일이 없습니다.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg bg-white p-8 shadow-lg shadow-slate-200/70 ring-1 ring-slate-200">
          {mode === "create" ? (
            <button
              type="button"
              onClick={() => setIsPublic((currentValue) => !currentValue)}
              aria-pressed={isPublic}
              className={cn(
                "mb-6 flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-4 text-left transition",
                isPublic
                  ? "border-main-20 bg-main-22 text-main-10"
                  : "border-slate-200 bg-slate-50 text-slate-700",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-md",
                    isPublic ? "bg-white" : "bg-white text-slate-500",
                  )}
                >
                  {isPublic ? (
                    <Globe2 className="size-5" aria-hidden="true" />
                  ) : (
                    <Lock className="size-5" aria-hidden="true" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold">
                    {isPublic ? "공개 등록" : "비공개 저장"}
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                    {isPublic
                      ? "등록하면 프로젝트 모음에 공개됩니다."
                      : "내 프로젝트 모음에만 저장됩니다."}
                  </span>
                </span>
              </span>
              <span
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition",
                  isPublic ? "bg-main-10" : "bg-slate-300",
                )}
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "absolute top-1 size-4 rounded-full bg-white transition",
                    isPublic ? "left-6" : "left-1",
                  )}
                />
              </span>
            </button>
          ) : null}

          <h2 className="text-xl font-extrabold text-slate-950">
            저장 및 등록
          </h2>
          <div className="mt-6 h-px bg-slate-200" />

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">
                제작 연도
              </span>
              <select
                value={productionYear}
                onChange={(event) => setProductionYear(event.target.value)}
                className="mt-2 h-12 w-full border border-slate-400 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-main-10 focus:ring-2 focus:ring-main-20"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-500">
                해당 학기
              </span>
              <select
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                className="mt-2 h-12 w-full border border-slate-400 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-main-10 focus:ring-2 focus:ring-main-20"
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-500">
                소속 학과
              </span>
              <select
                value={department}
                onChange={(event) =>
                  setDepartment(event.target.value as Department)
                }
                className="mt-2 h-12 w-full border border-slate-400 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-main-10 focus:ring-2 focus:ring-main-20"
              >
                {departments.map((departmentName) => (
                  <option key={departmentName} value={departmentName}>
                    {departmentName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 h-px bg-slate-200" />

          {notice && (
            <p className="mt-5 rounded bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
              {notice}
            </p>
          )}

          <div className="mt-6 space-y-3">
            {mode === "create" ? (
              <button
                type="button"
                disabled={isSaving || isUploading}
                onClick={handleDraftSave}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-200 px-4 text-base font-bold text-slate-800 transition hover:bg-slate-300 disabled:opacity-50"
              >
                <Save className="size-5" aria-hidden="true" />
                {savingAction === "draft" ? "임시 저장 중..." : "임시 저장"}
              </button>
            ) : null}

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-main-10 px-4 text-base font-bold text-white shadow-sm transition hover:bg-main-11 disabled:opacity-50"
            >
              {mode === "edit" ? (
                <Save className="size-5" aria-hidden="true" />
              ) : isPublic ? (
                <UploadCloud className="size-5" aria-hidden="true" />
              ) : (
                <Lock className="size-5" aria-hidden="true" />
              )}
              {savingAction === "save"
                ? "저장 중..."
                : savingAction === "publish"
                ? "등록 중..."
                : savingAction === "draft" && !isPublic
                  ? "저장 중..."
                  : mode === "edit"
                    ? "수정 저장"
                    : isPublic
                    ? "등록하기"
                    : "비공개 저장"}
            </button>

            <button
              type="button"
              onClick={() => router.push(appRoutes.mypageProjects)}
              className="h-12 w-full rounded-lg bg-slate-200 px-4 text-base font-bold text-slate-800 transition hover:bg-slate-300"
            >
              취소
            </button>
          </div>
        </div>
      </aside>
      </form>

      <ProjectEditorErrorDialog
        error={dialogError}
        onClose={() => setDialogError(null)}
        onLogin={goToLogin}
        onVerifyEmail={goToVerifyEmail}
      />
    </>
  );
}
