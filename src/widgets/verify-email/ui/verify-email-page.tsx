"use client"

import {
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Landmark, Loader2 } from "lucide-react"

import {
  resendSchoolEmailCode,
  sendSchoolEmailCode,
  verifySchoolEmailCode,
} from "@/features/auth/email-verification"
import { getCurrentUser } from "@/entities/user"
import { ApiError } from "@/shared/api"
import { appRoutes, queryParams } from "@/shared/config"

type VerifyEmailPageProps = {
  nextPath: string
}

type VerificationStep = "email" | "code"
type PendingAction = "send" | "resend" | "verify"
type VerificationError = { target: "user" | "email" | "code"; text: string }

const CODE_LENGTH = 6
const VERIFY_TIMEOUT_SECONDS = 180

/**
 * 학교 이메일 인증에서 사용할 빈 코드 입력 배열을 만든다.
 * @returns 6자리 빈 코드 배열
 */
function createEmptyCodeDigits() {
  return Array.from({ length: CODE_LENGTH }, () => "")
}

/**
 * 이메일이 대학 이메일 도메인인지 검사한다.
 * @param email 검사할 이메일
 * @returns .ac.kr 이메일 여부
 */
function isAcademicEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.ac\.kr$/i.test(email.trim())
}

/**
 * 남은 초를 MM:SS 표시 문자열로 변환한다.
 * @param seconds 남은 초
 * @returns 타이머 표시 문자열
 */
function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(restSeconds).padStart(
    2,
    "0"
  )}`
}

/**
 * 인증 API 오류를 사용자 안내 문구로 변환한다.
 * @param error API 또는 일반 오류
 * @returns 화면에 표시할 오류 문구
 */
function getVerificationErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "로그인이 필요합니다. 로그인 페이지로 이동합니다."
    }

    if (error.status === 400) {
      return error.message || "이메일 또는 인증번호를 다시 확인해주세요."
    }

    return error.message || "요청을 처리하지 못했습니다."
  }

  return error instanceof Error
    ? error.message
    : "요청을 처리하지 못했습니다."
}

/**
 * 로그인 페이지로 돌아올 next 경로를 만든다.
 * @param nextPath 인증 후 이동할 경로
 * @returns verify-email 경로를 next로 담은 로그인 경로
 */
function getLoginRedirectPath(nextPath: string) {
  const verifyParams = new URLSearchParams({ [queryParams.next]: nextPath })
  const loginParams = new URLSearchParams({
    [queryParams.next]: `${appRoutes.verifyEmail}?${verifyParams.toString()}`,
  })

  return `${appRoutes.login}?${loginParams.toString()}`
}

/**
 * 학교 이메일 인증 폼을 렌더링한다.
 * @param props 인증 성공 후 이동할 안전한 내부 경로
 * @returns 이메일 인증 UI
 */
export function VerifyEmailPage({ nextPath }: VerifyEmailPageProps) {
  const router = useRouter()
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const shouldFocusCode = useRef(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const [codeDigits, setCodeDigits] = useState(createEmptyCodeDigits)
  const [step, setStep] = useState<VerificationStep>("email")
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const actionLock = useRef(false)
  const userLoadLock = useRef(true)
  const userRequest = useRef<ReturnType<typeof getCurrentUser> | null>(null)
  const isMounted = useRef(false)
  const [userLoadAttempt, setUserLoadAttempt] = useState(0)
  const isSubmitting = pendingAction !== null
  const [message, setMessage] = useState("")
  const [error, setError] = useState<VerificationError | null>(null)
  const code = useMemo(() => codeDigits.join(""), [codeDigits])
  const isCodeStep = step === "code"
  const canSendCode =
    !isCodeStep && isAcademicEmail(email) && !isSubmitting && !!userId
  const canVerifyCode =
    isCodeStep &&
    code.length === CODE_LENGTH &&
    remainingSeconds > 0 &&
    !isSubmitting &&
    !!userId
  const canResend =
    isCodeStep && remainingSeconds === 0 && isAcademicEmail(email) && !!userId && !isSubmitting

  useEffect(() => {
    let ignore = false
    isMounted.current = true
    // Strict Mode의 effect 재연결에서도 진행 중인 최초 요청은 함께 기다린다.
    const request = userRequest.current ?? getCurrentUser({ cache: "no-store" })
    userRequest.current = request

    /** 조회 결과를 현재 화면에만 반영하고 실패한 조회를 다시 시도할 수 있게 한다. */
    async function loadCurrentUser() {
      try {
        const user = await request
        if (ignore) return
        if (user.isVerified) {
          router.replace(nextPath)
          return
        }
        setUserId(user.id)
        setEmail(isAcademicEmail(user.email) ? user.email : "")
      } catch (cause) {
        if (ignore) return
        setError({ target: "user", text: getVerificationErrorMessage(cause) })
        if (cause instanceof ApiError && cause.status === 401) {
          router.replace(getLoginRedirectPath(nextPath))
        }
      } finally {
        if (!ignore) {
          userRequest.current = null
          userLoadLock.current = false
          setIsLoadingUser(false)
        }
      }
    }
    void loadCurrentUser()
    return () => {
      ignore = true
      isMounted.current = false
    }
  }, [nextPath, router, userLoadAttempt])

  /** 실패한 사용자 조회를 중복 실행 없이 다시 요청한다. */
  function handleReloadUser() {
    if (userLoadLock.current || actionLock.current || userId) return
    userLoadLock.current = true
    setIsLoadingUser(true)
    setError(null)
    setUserLoadAttempt((attempt) => attempt + 1)
  }

  useEffect(() => {
    if (!isCodeStep || remainingSeconds <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0))
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [isCodeStep, remainingSeconds])

  useEffect(() => {
    if (isCodeStep && !isSubmitting && shouldFocusCode.current) {
      shouldFocusCode.current = false
      codeInputRefs.current[0]?.focus()
    }
  }, [isCodeStep, isSubmitting])

  /**
   * 인증번호 입력칸으로 포커스를 이동한다.
   * @param index 이동할 코드 입력 인덱스
   */
  function focusCodeInput(index: number) {
    codeInputRefs.current[index]?.focus()
  }

  /**
   * 코드 입력 상태와 타이머를 인증 대기 상태로 초기화한다.
   */
  function startCodeVerification() {
    shouldFocusCode.current = true
    setStep("code")
    setCodeDigits(createEmptyCodeDigits())
    setRemainingSeconds(VERIFY_TIMEOUT_SECONDS)
  }

  /**
   * 현재 오류가 401이면 로그인 페이지로 이동한다.
   * @param error API 또는 일반 오류
   */
  function handleVerificationError(error: unknown, target: "email" | "code") {
    setError({ target, text: getVerificationErrorMessage(error) })

    if (error instanceof ApiError && error.status === 401) {
      router.replace(getLoginRedirectPath(nextPath))
    }
  }

  /**
   * 학교 이메일로 인증번호 발송을 요청한다.
   * @param event 이메일 전송 폼 제출 이벤트
   */
  async function handleSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (actionLock.current || userLoadLock.current || step !== "email") return
    const trimmedEmail = email.trim()

    if (!isAcademicEmail(trimmedEmail)) {
      setError({ target: "email", text: ".ac.kr로 끝나는 학교 이메일을 입력해주세요." })
      setMessage("")
      return
    }

    if (!userId) {
      setError({ target: "user", text: "사용자 정보를 확인하는 중입니다." })
      setMessage("")
      return
    }

    actionLock.current = true
    setPendingAction("send")
    setError(null)
    setMessage("")

    try {
      const responseMessage = await sendSchoolEmailCode({
        email: trimmedEmail,
        userId,
      })

      if (!isMounted.current) return
      setEmail(trimmedEmail)
      setMessage(responseMessage || "인증번호가 발송되었습니다.")
      startCodeVerification()
    } catch (error) {
      if (isMounted.current) handleVerificationError(error, "email")
    } finally {
      actionLock.current = false
      if (isMounted.current) setPendingAction(null)
    }
  }

  /**
   * 학교 이메일 인증번호 재발송을 요청한다.
   */
  async function handleResendCode() {
    const trimmedEmail = email.trim()

    if (actionLock.current || userLoadLock.current || !canResend || !userId) {
      return
    }

    actionLock.current = true
    setPendingAction("resend")
    setError(null)
    setMessage("")

    try {
      const responseMessage = await resendSchoolEmailCode({
        email: trimmedEmail,
        userId,
      })

      if (!isMounted.current) return
      setMessage(responseMessage || "인증번호를 다시 발송했습니다.")
      startCodeVerification()
    } catch (error) {
      if (isMounted.current) handleVerificationError(error, "code")
    } finally {
      actionLock.current = false
      if (isMounted.current) setPendingAction(null)
    }
  }

  /**
   * 6자리 인증번호 검증을 요청한다.
   */
  async function handleVerifyCode() {
    const trimmedEmail = email.trim()

    if (actionLock.current || userLoadLock.current || !canVerifyCode || !userId || !isAcademicEmail(trimmedEmail)) {
      return
    }

    actionLock.current = true
    setPendingAction("verify")
    setError(null)
    setMessage("")

    try {
      const responseMessage = await verifySchoolEmailCode({
        code,
        email: trimmedEmail,
        userId,
      })

      if (!isMounted.current) return
      setMessage(responseMessage || "학교 이메일 인증이 완료되었습니다.")
      router.replace(nextPath)
    } catch (error) {
      if (isMounted.current) handleVerificationError(error, "code")
    } finally {
      actionLock.current = false
      if (isMounted.current) setPendingAction(null)
    }
  }

  /**
   * 인증번호 한 칸의 변경을 처리한다.
   * @param index 변경된 입력칸 인덱스
   * @param event 입력 변경 이벤트
   */
  function handleCodeChange(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const nextDigit = event.target.value.replace(/\D/g, "").slice(-1)

    setCodeDigits((currentDigits) => {
      const nextDigits = [...currentDigits]
      nextDigits[index] = nextDigit
      return nextDigits
    })

    if (nextDigit && index < CODE_LENGTH - 1) {
      focusCodeInput(index + 1)
    }
  }

  /**
   * 인증번호 입력칸의 삭제와 좌우 이동을 처리한다.
   * @param index 현재 입력칸 인덱스
   * @param event 키보드 이벤트
   */
  function handleCodeKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      focusCodeInput(index - 1)
      return
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      focusCodeInput(index - 1)
      return
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault()
      focusCodeInput(index + 1)
    }
  }

  /**
   * 붙여넣은 인증번호를 6칸 입력에 나누어 반영한다.
   * @param index 붙여넣기를 시작한 입력칸 인덱스
   * @param event 클립보드 이벤트
   */
  function handleCodePaste(
    index: number,
    event: ClipboardEvent<HTMLInputElement>
  ) {
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH - index)

    if (!pastedDigits) {
      return
    }

    event.preventDefault()

    setCodeDigits((currentDigits) => {
      const nextDigits = [...currentDigits]

      pastedDigits.split("").forEach((digit, offset) => {
        nextDigits[index + offset] = digit
      })

      return nextDigits
    })

    focusCodeInput(Math.min(index + pastedDigits.length, CODE_LENGTH - 1))
  }

  const isExpired = isCodeStep && remainingSeconds === 0
  const statusMessage = isLoadingUser
    ? "사용자 정보를 불러오는 중입니다."
    : pendingAction === "send"
      ? "인증번호를 전송하는 중입니다."
      : pendingAction === "resend"
        ? "인증번호를 다시 전송하는 중입니다."
        : pendingAction === "verify"
          ? "인증번호를 확인하는 중입니다."
          : isExpired
            ? "인증번호가 만료되었습니다. 이메일이 오지 않았나요? 버튼으로 다시 발송해주세요."
            : message
  const emailDescription = "school-email-hint" + (error?.target === "email" ? " verification-error" : "")
  const codeDescription = "verification-code-hint verification-status" + (error?.target === "code" ? " verification-error" : "")

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-between bg-slate-50 px-5 py-10">
      <section className="flex w-full flex-1 items-center justify-center">
        <div className="w-full max-w-[430px] rounded-lg bg-white px-8 py-10 shadow-sm ring-1 ring-slate-200 sm:px-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#005E9C] text-white shadow-md shadow-blue-900/20">
                <Landmark className="size-5" aria-hidden="true" />
              </div>
              <span className="text-xl font-extrabold text-[#005E9C]">
                CampusPolio
              </span>
            </div>

            <h1 className="mt-9 text-2xl font-extrabold text-slate-950">
              구성원 인증
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              삼육대학교 이메일을 통해 본인 인증을 진행해주세요.
              <br />
              인증 후 모든 서비스를 이용하실 수 있습니다.
            </p>
          </div>

          <form onSubmit={handleSendCode} className="mt-10">
            <label
              htmlFor="school-email"
              className="text-[11px] font-extrabold tracking-[0.18em] text-[#005E9C]"
            >
              UNIVERSITY EMAIL
            </label>
            <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
              <input
                id="school-email"
                type="email"
                aria-describedby={emailDescription}
                aria-invalid={error?.target === "email" || undefined}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoadingUser || isSubmitting || isCodeStep}
                placeholder="username@syu.ac.kr"
                className="h-12 min-w-0 border-0 border-b border-slate-400 bg-transparent px-0 text-base font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#005E9C] transition placeholder:text-slate-500 focus:border-[#005E9C]"
              />
              <button
                aria-busy={pendingAction === "send"}
                type="submit"
                disabled={!canSendCode || isLoadingUser}
                className="inline-flex h-12 min-w-24 items-center justify-center rounded-lg bg-[#005E9C] px-5 text-sm font-bold text-white transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005E9C] hover:bg-[#004E82] disabled:bg-slate-200 disabled:text-slate-600"
              >
                {pendingAction === "send" && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                )}
                코드 전송
              </button>
            </div>
            <p id="school-email-hint" className="mt-2 text-xs leading-5 text-slate-600">
              .ac.kr로 끝나는 학교 이메일을 입력해주세요.
            </p>
          </form>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <span id="verification-code-label" className="text-[11px] font-extrabold tracking-[0.18em] text-slate-600">
                6-DIGIT CODE
              </span>
              <span className="text-xs font-bold text-[#005E9C]">
                {formatRemainingTime(remainingSeconds)}
              </span>
            </div>

            <p id="verification-code-hint" className="mt-2 text-xs leading-5 text-slate-600">
              이메일로 받은 6자리 인증번호를 입력해주세요.
            </p>
            <div role="group" aria-labelledby="verification-code-label" aria-describedby={codeDescription} className="mt-3 grid grid-cols-6 gap-3">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    codeInputRefs.current[index] = element
                  }}
                  value={digit}
                  onChange={(event) => handleCodeChange(index, event)}
                  onKeyDown={(event) => handleCodeKeyDown(index, event)}
                  onPaste={(event) => handleCodePaste(index, event)}
                  inputMode="numeric"
                  maxLength={1}
                  disabled={!isCodeStep || isSubmitting}
                  aria-describedby={codeDescription}
                  aria-invalid={(error?.target === "code" || isExpired) || undefined}
                  aria-label={`${index + 1}번째 인증번호`}
                  className="aspect-square w-full rounded border border-slate-300 bg-slate-50 text-center text-xl font-bold text-slate-950 outline-none transition focus:border-[#005E9C] focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-600"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyCode}
              aria-busy={pendingAction === "verify"}
              disabled={!canVerifyCode}
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 transition-shadow hover:bg-slate-200 disabled:text-slate-600 enabled:bg-[#005E9C] enabled:text-white enabled:hover:bg-[#004E82]"
            >
              {pendingAction === "verify" && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              )}
              인증 확인
            </button>
          </div>

          <p id="verification-status" role="status" aria-atomic="true"
            className={statusMessage ? "mt-5 rounded bg-blue-50 px-3 py-2 text-center text-sm leading-5 text-[#005E9C]" : ""}>
            {statusMessage}
          </p>
          <p id="verification-error" role="alert" aria-atomic="true"
            className={error ? "mt-5 rounded bg-red-50 px-3 py-2 text-center text-sm leading-5 text-red-700" : ""}>
            {error?.text}
          </p>
          {!userId && (error?.target === "user" || isLoadingUser) && (
            <button type="button" onClick={handleReloadUser} disabled={isLoadingUser}
              aria-busy={isLoadingUser} aria-describedby="verification-error verification-status"
              className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded border border-slate-400 px-4 text-sm font-bold text-[#005E9C] disabled:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005E9C]">
              {isLoadingUser && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              다시 불러오기
            </button>
          )}

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              aria-busy={pendingAction === "resend"}
              disabled={!canResend || isSubmitting}
              className="text-xs font-semibold text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005E9C] underline-offset-4 hover:text-[#005E9C] hover:underline disabled:text-slate-600 disabled:no-underline"
            >
              {pendingAction === "resend" && <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden="true" />}
              이메일이 오지 않았나요?
            </button>
          </div>
        </div>
      </section>

      <footer className="mt-8 text-center">
        <p className="text-[11px] font-bold tracking-[0.28em] text-slate-600">
          © 2026 SAHMYOOK UNIVERSITY.
        </p>
        <div className="mt-6 flex items-center justify-center gap-8 text-[11px] font-bold text-slate-700">
          <Link href={appRoutes.home}>CampusPolio Policy</Link>
          <Link href={appRoutes.home}>Contact</Link>
          <Link href={appRoutes.home}>Help Center</Link>
        </div>
      </footer>
    </main>
  )
}
