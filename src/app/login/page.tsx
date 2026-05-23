import type { Metadata } from "next"

import { getSafeNextPath } from "@/shared/config"
import { LoginPage } from "@/widgets/login"

export const metadata: Metadata = {
  title: "로그인 | CampusPolio",
  description: "CampusPolio Google 로그인",
}

type PageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

/**
 * 로그인 라우트에서 next query를 안전한 내부 경로로 정리해 로그인 화면에 전달한다.
 * @param searchParams Next.js가 전달하는 URL query promise
 * @returns 로그인 페이지 UI
 */
export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next

  return <LoginPage nextPath={getSafeNextPath(nextParam)} />
}
