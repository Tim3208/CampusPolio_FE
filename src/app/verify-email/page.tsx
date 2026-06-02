import type { Metadata } from "next"

import { appRoutes, getSafeNextPath } from "@/shared/config"
import { VerifyEmailPage } from "@/widgets/verify-email"

export const metadata: Metadata = {
  title: "이메일 인증 | CampusPolio",
  description: "CampusPolio 학교 이메일 인증 안내",
}

type PageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

/**
 * 학교 이메일 인증이 필요한 사용자에게 안내 화면을 보여준다.
 * @param props URL query promise
 * @returns 이메일 인증 안내 페이지 UI
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next

  return (
    <VerifyEmailPage
      nextPath={getSafeNextPath(nextParam, appRoutes.home)}
    />
  )
}
