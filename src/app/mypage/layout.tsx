import type { Metadata } from "next"
import type { ReactNode } from "react"

import { MypageAuthGate, MypageShell } from "@/widgets/mypage"

export const metadata: Metadata = {
  title: "마이페이지 | CampusPolio",
  description: "CampusPolio 마이페이지",
}

type LayoutProps = {
  children: ReactNode
}

/**
 * 마이페이지 하위 라우트에 클라이언트 로그인 가드와 공통 shell을 적용한다.
 * @param children 현재 탭 본문
 * @returns 마이페이지 레이아웃 UI
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <MypageAuthGate>
      <MypageShell>{children}</MypageShell>
    </MypageAuthGate>
  )
}
