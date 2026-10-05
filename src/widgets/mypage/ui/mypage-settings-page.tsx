import type { Profile } from "@/entities/profile"
import { ProfileSettingsForm } from "@/features/profile/profile-settings"

type MypageSettingsPageProps = {
  errorMessage?: string
  profile?: Profile | null
}

/**
 * 마이페이지 설정 탭의 프로필 설정 화면을 렌더링한다.
 * @param props 조회된 프로필 또는 오류 메시지
 * @returns 프로필 설정 본문 UI
 */
export function MypageSettingsPage({
  errorMessage,
  profile,
}: MypageSettingsPageProps) {
  return (
    <section className="flex min-w-0 flex-col gap-8 px-4 py-7 md:px-8 md:py-8 lg:px-10 lg:py-10 xl:px-12 xl:pt-11 xl:pb-16">
      <div>
        <h1 className="text-[32px] font-extrabold leading-tight text-[#171f24]">
          설정
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          캠퍼스폴리오에서 사용할 공개 프로필 정보를 설정합니다.
        </p>
      </div>

      {errorMessage ? (
        <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-red-100 bg-white px-6 text-center">
          <div>
            <p className="text-lg font-bold text-red-600">
              프로필 정보를 불러오지 못했습니다
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {errorMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="min-w-0 w-full [&_form]:min-w-0 [&_form]:w-full [&_form_div]:min-w-0 [&_form_aside]:min-w-0"><ProfileSettingsForm profile={profile} /></div>
      )}
    </section>
  )
}
