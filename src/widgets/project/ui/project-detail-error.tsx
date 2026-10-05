"use client"

import Link from "next/link"
import { useState } from "react"
import { RotateCw, WifiOff } from "lucide-react"
import { appRoutes } from "@/shared/config"
import { Button } from "@/shared/ui/button"

/** 조회 오류와 상세 404에 동일한 재조회·프로젝트 모음 회복 경로를 제공한다. */
export function ProjectDetailError({ message }: { message?: string }) {
  const [pending, setPending] = useState(false)
  /** 현재 서버 상세 조회를 다시 실행한다. */
  function handleRetry() {
    setPending(true)
    window.location.reload()
  }
  return (
    <main className="min-h-screen bg-[#F5F8FB] px-4 pt-[72px] pb-10 md:px-8">
      <section className="mx-auto flex max-w-lg flex-col items-center gap-2.5 rounded-[14px] border border-[#CBD6E2] bg-[#FDFEFF] px-6 py-10 text-center">
        <span className="mb-1 grid size-[52px] place-items-center rounded-[14px] bg-main-22 text-main-10"><WifiOff className="size-6" strokeWidth={1.75} aria-hidden="true" /></span>
        <h1 className="text-[17px] font-bold text-main-00">프로젝트를 불러오지 못했어요</h1>
        <p className="mb-2 max-w-[32ch] text-sm leading-[1.6] text-gray-05">{message || "삭제되었거나 주소가 바뀌었을 수 있어요. 잠시 후 다시 시도해 주세요."}</p>
        <div className="flex w-full flex-col gap-2">
          <Button size="xl" disabled={pending} onClick={handleRetry} className="rounded-[10px] bg-main-10 text-[15px] font-semibold text-white hover:bg-main-11 disabled:border disabled:border-[#E3E9F0] disabled:bg-[#F5F8FB] disabled:text-gray-08 disabled:opacity-100"><RotateCw className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />{pending ? "다시 불러오는 중" : "다시 시도"}</Button>
          <Button asChild size="xl" variant="outline" className="rounded-[10px] border-[#CBD6E2] bg-[#FDFEFF] text-[15px] font-semibold text-gray-01 hover:border-main-20 hover:bg-[#FDFEFF] hover:text-main-10"><Link href={appRoutes.projects}>프로젝트 모음으로</Link></Button>
        </div>
      </section>
    </main>
  )
}
