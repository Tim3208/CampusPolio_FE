import type { ReactNode } from "react"

import { MypageSidebar } from "./mypage-sidebar"

type MypageShellProps = {
  children: ReactNode
}

/**
 * 마이페이지 내부에서 사이드바를 유지하는 공통 화면 틀을 구성한다.
 * @param children 현재 탭 본문 영역
 * @returns 마이페이지 shell UI
 */
export function MypageShell({ children }: MypageShellProps) {
  return (
    <main className="flex flex-1 bg-[#f5f8fb]">
      <div className="mx-auto flex w-full max-w-6xl flex-1">
        <MypageSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  )
}
