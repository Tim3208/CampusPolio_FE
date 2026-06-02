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
  const [userId, setUserId] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const [codeDigits, setCodeDigits] = useState(createEmptyCodeDigits)
  const [step, setStep] = useState<VerificationStep>("email")
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
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
    isCodeStep && remainingSeconds === 0 && isAcademicEmail(email) && !!userId

  useEffect(() => {
    let ignore = false

    /**
     * 현재 로그인 사용자를 확인해 인증 화면 초기 상태를 준비한다.
     */
    async function loadCurrentUser() {
      try {
        const user = await getCurrentUser({ cache: "no-store" })

        if (ignore) {
          return
        }

        if (user.isVerified) {
          router.replace(nextPath)
          return
        }

        setUserId(user.id)
        setEmail(isAcademicEmail(user.email) ? user.email : "")
      } catch (error) {
        if (ignore) {
          return
        }

        setErrorMessage(getVerificationErrorMessage(error))
        if (error instanceof ApiError && error.status === 401) {
          router.replace(getLoginRedirectPath(nextPath))
        }
      } finally {
        if (!ignore) {
          setIsLoadingUser(false)
        }
      }
    }

    void loadCurrentUser()

    return () => {
      ignore = true
    }
  }, [nextPath, router])

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
    setStep("code")
    setCodeDigits(createEmptyCodeDigits())
    setRemainingSeconds(VERIFY_TIMEOUT_SECONDS)

    window.requestAnimationFrame(() => {
      focusCodeInput(0)
    })
  }

  /**
   * 현재 오류가 401이면 로그인 페이지로 이동한다.
   * @param error API 또는 일반 오류
   */
  function handleVerificationError(error: unknown) {
    setErrorMessage(getVerificationErrorMessage(error))

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

    const trimmedEmail = email.trim()

    if (!isAcademicEmail(trimmedEmail)) {
      setErrorMessage(".ac.kr로 끝나는 학교 이메일을 입력해주세요.")
      setMessage("")
      return
    }

    if (!userId) {
      setErrorMessage("사용자 정보를 확인하는 중입니다.")
      setMessage("")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")
    setMessage("")

    try {
      const responseMessage = await sendSchoolEmailCode({
        email: trimmedEmail,
        userId,
      })

      setEmail(trimmedEmail)
      setMessage(responseMessage || "인증번호가 발송되었습니다.")
      startCodeVerification()
    } catch (error) {
      handleVerificationError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 학교 이메일 인증번호 재발송을 요청한다.
   */
  async function handleResendCode() {
    const trimmedEmail = email.trim()

    if (!canResend || !userId) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")
    setMessage("")

    try {
      const responseMessage = await resendSchoolEmailCode({
        email: trimmedEmail,
        userId,
      })

      setMessage(responseMessage || "인증번호를 다시 발송했습니다.")
      startCodeVerification()
    } catch (error) {
      handleVerificationError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * 6자리 인증번호 검증을 요청한다.
   */
  async function handleVerifyCode() {
    const trimmedEmail = email.trim()

    if (!canVerifyCode || !userId) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")
    setMessage("")

    try {
      const responseMessage = await verifySchoolEmailCode({
        code,
        email: trimmedEmail,
        userId,
      })

      setMessage(responseMessage || "학교 이메일 인증이 완료되었습니다.")
      router.replace(nextPath)
    } catch (error) {
      handleVerificationError(error)
    } finally {
      setIsSubmitting(false)
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
              className="text-[11px] font-extrabold tracking-[0.18em] text-blue-300"
            >
              UNIVERSITY EMAIL
            </label>
            <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
              <input
                id="school-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isLoadingUser || isSubmitting || isCodeStep}
                placeholder="username@syu.ac.kr"
                className="h-12 min-w-0 border-0 border-b border-slate-400 bg-transparent px-0 text-base font-semibold text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#005E9C]"
              />
              <button
                type="submit"
                disabled={!canSendCode || isLoadingUser}
                className="inline-flex h-12 min-w-24 items-center justify-center rounded-lg bg-[#005E9C] px-5 text-sm font-bold text-white transition hover:bg-[#004E82] disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isSubmitting && !isCodeStep ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  "코드 전송"
                )}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold tracking-[0.18em] text-slate-300">
                6-DIGIT CODE
              </span>
              <span className="text-xs font-bold text-[#005E9C]">
                {formatRemainingTime(remainingSeconds)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-6 gap-3">
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
                  aria-label={`${index + 1}번째 인증번호`}
                  className="aspect-square w-full rounded border border-slate-300 bg-slate-50 text-center text-xl font-bold text-slate-950 outline-none transition focus:border-[#005E9C] focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-300"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={!canVerifyCode}
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-500 transition hover:bg-slate-200 disabled:text-slate-400 enabled:bg-[#005E9C] enabled:text-white enabled:hover:bg-[#004E82]"
            >
              {isSubmitting && isCodeStep ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                "인증 확인"
              )}
            </button>
          </div>

          {(message || errorMessage) && (
            <p
              className={`mt-5 rounded px-3 py-2 text-center text-sm leading-5 ${
                errorMessage
                  ? "bg-red-50 text-red-600"
                  : "bg-blue-50 text-[#005E9C]"
              }`}
            >
              {errorMessage || message}
            </p>
          )}

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isSubmitting}
              className="text-xs font-semibold text-slate-500 underline-offset-4 hover:text-[#005E9C] hover:underline disabled:text-slate-300 disabled:no-underline"
            >
              이메일이 오지 않았나요?
            </button>
          </div>
        </div>
      </section>

      <footer className="mt-8 text-center">
        <p className="text-[11px] font-bold tracking-[0.28em] text-slate-300">
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
