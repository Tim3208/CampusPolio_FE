import { ApiError } from "@/shared/api"

export function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 400) {
      return "로그인 요청이 올바르지 않습니다. 다시 시도해 주세요."
    }

    if (error.status === 401) {
      return "Google 인증에 실패했습니다. 계정을 다시 선택해 주세요."
    }

    if (error.status >= 500) {
      return "서버 오류로 로그인하지 못했습니다. 잠시 후 다시 시도해 주세요."
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "로그인 중 알 수 없는 오류가 발생했습니다."
}
