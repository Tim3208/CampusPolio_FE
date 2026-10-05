import type { ReactNode } from "react"
import { MypageNav } from "./mypage-nav"
import { MypageSidebar } from "./mypage-sidebar"

/** 본문 폭을 확보하고 1024px 미만에서는 메뉴를 본문 위로 옮긴다. */
export function MypageShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-w-0 flex-1 grid-cols-1 bg-[#F5F8FB] lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
      <MypageSidebar />
      <div className="min-w-0 lg:hidden"><MypageNav /></div>
      <div className="min-w-0 w-full">{children}</div>
    </main>
  )
}
