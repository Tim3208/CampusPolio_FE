"use client"

import { useEffect, useRef } from "react"

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
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  const isOpen = error !== null

  /** 문구 변경은 열린 대화상자의 포커스를 초기화하지 않는다. */
  useEffect(() => { closeRef.current = onClose }, [onClose])

  /** 열림 동안 키보드 포커스를 가두고 닫힌 뒤 원래 조작 위치로 돌린다. */
  useEffect(() => {
    if (!isOpen) return
    const dialog = dialogRef.current
    if (!dialog) return
    const document = dialog.ownerDocument
    const previousFocus = document.activeElement
    dialog.focus()
    /** Escape는 닫고 Tab은 대화상자 안의 버튼을 순환한다. */
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current()
        return
      }
      if (event.key !== "Tab" || !dialog) return
      const buttons = dialog.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (!first || !last) { event.preventDefault(); dialog.focus(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus()
      }
    }
    /** 외부로 이동한 포커스는 열린 모달로 되돌린다. */
    function handleFocusIn(event: FocusEvent) {
      if (dialog && event.target instanceof Node && !dialog.contains(event.target)) dialog.focus()
    }
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("focusin", handleFocusIn)
    /** 이벤트를 제거하고 실제로 남아 있는 이전 요소로 복귀한다. */
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("focusin", handleFocusIn)
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [isOpen])

  if (!error) {
    return null
  }

  /** 오류 종류에 해당하는 기존 후속 행동만 호출한다. */
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
        ref={dialogRef}
        tabIndex={-1}
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
