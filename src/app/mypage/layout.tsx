import type { Metadata } from "next"
import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/entities/user"
import { appRoutes, mockConfig, queryParams } from "@/shared/config"
import { MypageShell } from "@/widgets/mypage"

export const metadata: Metadata = {
  title: "마이페이지 | CampusPolio",
  description: "CampusPolio 마이페이지",
}

type LayoutProps = {
  children: ReactNode
}

/**
 * 마이페이지에서 사용할 로그인 페이지 이동 URL을 만든다.
 * @returns next query가 포함된 로그인 URL
 */
function getMypageLoginUrl() {
  const params = new URLSearchParams({
    [queryParams.next]: appRoutes.mypage,
  })

  return `${appRoutes.login}?${params.toString()}`
}

/**
 * 요청 쿠키로 현재 사용자를 확인하고 실패 시 로그인 화면으로 이동한다.
 */
async function assertMypageUser() {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  if (!cookie && !mockConfig.useMockApi) {
    redirect(getMypageLoginUrl())
  }

  try {
    await getCurrentUser({
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    })
  } catch {
    redirect(getMypageLoginUrl())
  }
}

/**
 * 마이페이지 하위 라우트에 로그인 가드와 공통 shell을 적용한다.
 * @param children 현재 탭 본문
 * @returns 마이페이지 레이아웃 UI
 */
export default async function Layout({ children }: LayoutProps) {
  await assertMypageUser()

  return <MypageShell>{children}</MypageShell>
}
