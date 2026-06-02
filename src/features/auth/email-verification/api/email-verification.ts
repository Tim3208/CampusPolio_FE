import { apiRequest, ApiError, type ApiResponse } from "@/shared/api"
import { authApiPaths } from "@/shared/config"

type EmailAuthResponse = {
  message?: string
}

type EmailVerificationPayload = {
  email: string
  userId: number
}

type EmailCodeVerificationPayload = EmailVerificationPayload & {
  code: string
}

/**
 * 이메일 인증 API path에 userId query를 붙인다.
 * @param path 이메일 인증 API path
 * @param userId 현재 로그인한 사용자 ID
 * @returns userId query가 포함된 API path
 */
function getEmailAuthPath(path: `/${string}`, userId: number) {
  const params = new URLSearchParams({ userId: String(userId) })

  return `${path}?${params.toString()}` as `/${string}`
}

/**
 * mock 응답이 실패 상태로 내려온 경우 실제 API 오류처럼 처리한다.
 * @param response 이메일 인증 API 응답
 * @returns 응답 메시지
 */
function getEmailAuthMessage(response: ApiResponse<EmailAuthResponse>) {
  if (response.success === false) {
    throw new ApiError(
      response.message ?? response.data?.message ?? "요청을 처리하지 못했습니다.",
      400,
      response
    )
  }

  return response.data?.message ?? response.message ?? ""
}

/**
 * 학교 이메일로 인증번호 발송을 요청한다.
 * @param payload 이메일과 현재 사용자 ID
 * @returns 서버 응답 메시지
 */
export async function sendSchoolEmailCode({
  email,
  userId,
}: EmailVerificationPayload) {
  const response = await apiRequest<EmailAuthResponse>(
    getEmailAuthPath(authApiPaths.sendEmailCode, userId),
    {
      body: { email },
      method: "POST",
    }
  )

  return getEmailAuthMessage(response)
}

/**
 * 학교 이메일 인증번호 재발송을 요청한다.
 * @param payload 이메일과 현재 사용자 ID
 * @returns 서버 응답 메시지
 */
export async function resendSchoolEmailCode({
  email,
  userId,
}: EmailVerificationPayload) {
  const response = await apiRequest<EmailAuthResponse>(
    getEmailAuthPath(authApiPaths.resendEmailCode, userId),
    {
      body: { email },
      method: "POST",
    }
  )

  return getEmailAuthMessage(response)
}

/**
 * 학교 이메일과 6자리 인증번호를 검증한다.
 * @param payload 이메일, 인증번호, 현재 사용자 ID
 * @returns 서버 응답 메시지
 */
export async function verifySchoolEmailCode({
  code,
  email,
  userId,
}: EmailCodeVerificationPayload) {
  const response = await apiRequest<EmailAuthResponse>(
    getEmailAuthPath(authApiPaths.verifyEmailCode, userId),
    {
      body: { code, email },
      method: "POST",
    }
  )

  return getEmailAuthMessage(response)
}
