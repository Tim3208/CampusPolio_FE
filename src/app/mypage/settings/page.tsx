import { headers } from "next/headers"

import { getMyProfile, type Profile } from "@/entities/profile"
import { ApiError } from "@/shared/api"
import { MypageSettingsPage } from "@/widgets/mypage"

type SettingsPageState = {
  errorMessage?: string
  profile?: Profile | null
}

/**
 * 마이페이지 설정 탭에 필요한 프로필 초기 상태를 서버에서 조회한다.
 * @returns 프로필 정보, 프로필 없음 상태, 또는 오류 메시지
 */
async function getSettingsPageState(): Promise<SettingsPageState> {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  if (!cookie) {
    return {
      errorMessage: "로그인이 필요합니다.",
    }
  }

  try {
    const profile = await getMyProfile({
      headers: {
        cookie,
      },
    })

    return {
      profile,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        profile: null,
      }
    }

    return {
      errorMessage:
        error instanceof Error
          ? error.message
          : "프로필 정보를 불러오지 못했습니다.",
    }
  }
}

/**
 * 마이페이지 설정 탭 라우트를 렌더링한다.
 * @returns 프로필 설정 화면
 */
export default async function Page() {
  const settingsPageState = await getSettingsPageState()

  return <MypageSettingsPage {...settingsPageState} />
}
