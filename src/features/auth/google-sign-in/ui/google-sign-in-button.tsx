"use client"

import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import {
  appRoutes,
  publicEnv,
  queryParams,
  requiresSchoolVerification,
} from "@/shared/config"

import { loginWithGoogle } from "../api/login-with-google"
import { getLoginErrorMessage } from "../lib/error-message"
import type { GoogleCredentialResponse } from "../model/google-identity"

type GoogleSignInButtonProps = {
  nextPath: string
}

/**
 * Google Identity Services 버튼을 렌더링하고 로그인 결과에 따라 다음 화면으로 이동한다.
 * @param nextPath 로그인 후 이동할 안전한 내부 경로
 * @returns Google 로그인 버튼과 처리 상태 UI
 */
export function GoogleSignInButton({ nextPath }: GoogleSignInButtonProps) {
  const router = useRouter()
  const buttonRef = useRef<HTMLDivElement>(null)
  const [isScriptReady, setIsScriptReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.google)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const setupErrorMessage = !publicEnv.googleClientId
    ? "Google Client ID 환경변수가 설정되지 않았습니다."
    : null
  const visibleErrorMessage = errorMessage ?? setupErrorMessage

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setErrorMessage("Google 인증 정보를 받지 못했습니다.")
        return
      }

      setIsSubmitting(true)
      setErrorMessage(null)

      try {
        const user = await loginWithGoogle(response.credential)

        if (requiresSchoolVerification(nextPath) && !user.isVerified) {
          const params = new URLSearchParams({ [queryParams.next]: nextPath })

          router.push(`${appRoutes.verifyEmail}?${params.toString()}`)
          return
        }

        router.push(nextPath)
        router.refresh()
      } catch (error) {
        setErrorMessage(getLoginErrorMessage(error))
      } finally {
        setIsSubmitting(false)
      }
    },
    [nextPath, router]
  )

  useEffect(() => {
    if (!isScriptReady || !buttonRef.current) {
      return
    }

    if (!publicEnv.googleClientId) {
      return
    }

    if (!window.google) {
      return
    }

    buttonRef.current.innerHTML = ""
    window.google.accounts.id.initialize({
      client_id: publicEnv.googleClientId,
      callback: handleCredential,
      ux_mode: "popup",
    })
    window.google.accounts.id.renderButton(buttonRef.current, {
      logo_alignment: "left",
      shape: "rectangular",
      size: "large",
      text: "continue_with",
      theme: "outline",
      width: 320,
    })
  }, [handleCredential, isScriptReady])

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptReady(true)}
        onError={() =>
          setErrorMessage("Google 로그인 스크립트를 불러오지 못했습니다.")
        }
      />

      <div
        ref={buttonRef}
        aria-busy={isSubmitting}
        className="flex min-h-10 justify-center data-[busy=true]:pointer-events-none data-[busy=true]:opacity-60"
        data-busy={isSubmitting}
      />

      {isSubmitting ? (
        <p className="text-center text-sm text-muted-foreground">
          로그인 처리 중입니다.
        </p>
      ) : null}

      {visibleErrorMessage ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {visibleErrorMessage}
        </p>
      ) : null}
    </div>
  )
}
