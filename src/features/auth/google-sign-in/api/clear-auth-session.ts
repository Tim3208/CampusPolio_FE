import { authApiPaths, buildApiUrl } from "@/shared/config"

/**
 * 로그인 실패로 처리해야 하는 응답 뒤에 남을 수 있는 인증 세션을 정리한다.
 */
export async function clearAuthSession() {
  await fetch(buildApiUrl(authApiPaths.logout), {
    credentials: "include",
    method: "POST",
  })
}
