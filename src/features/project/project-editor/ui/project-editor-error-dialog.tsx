"use client"

export type ProjectEditorDialogAction = "close" | "login" | "verify-email"

export type ProjectEditorDialogError = {
  title: string
  description: string
  action: ProjectEditorDialogAction
  actionLabel: string
}

type ProjectEditorErrorDialogProps = {
  error: ProjectEditorDialogError | null
  onClose: () => void
  onLogin: () => void
  onVerifyEmail: () => void
}

/**
 * 프로젝트 저장/등록 실패 원인과 후속 행동을 모달로 안내한다.
 * @param props 표시할 오류 정보와 CTA 핸들러
 * @returns 오류 안내 대화상자
 */
export function ProjectEditorErrorDialog({
  error,
  onClose,
  onLogin,
  onVerifyEmail,
}: ProjectEditorErrorDialogProps) {
  if (!error) {
    return null
  }

  const handlePrimaryAction = () => {
    if (error.action === "login") {
      onLogin()
      return
    }

    if (error.action === "verify-email") {
      onVerifyEmail()
      return
    }

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-editor-error-title"
        aria-describedby="project-editor-error-description"
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl ring-1 ring-slate-200"
      >
        <p
          id="project-editor-error-title"
          className="text-lg font-extrabold text-slate-950"
        >
          {error.title}
        </p>
        <p
          id="project-editor-error-description"
          className="mt-3 text-sm leading-6 text-slate-600"
        >
          {error.description}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          {error.action !== "close" && (
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md bg-slate-100 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              닫기
            </button>
          )}
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="h-10 rounded-md bg-main-10 px-4 text-sm font-bold text-white transition hover:bg-main-11"
          >
            {error.actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
