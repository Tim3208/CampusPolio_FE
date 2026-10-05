"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CircleHelp, FolderArchive, Images, Settings, Upload } from "lucide-react"
import { appRoutes } from "@/shared/config"
import { cn } from "@/shared/lib/utils"

const mypageTabs = [
  { href: appRoutes.mypageProjects, icon: FolderArchive, label: "프로젝트 모음" },
  { href: appRoutes.mypagePortfolios, icon: Images, label: "포트폴리오 모음" },
  { href: appRoutes.mypageSettings, icon: Settings, label: "설정" },
  { href: appRoutes.mypageSupport, icon: CircleHelp, label: "지원" },
] as const

/** 하나의 메뉴 목록으로 데스크톱 사이드바와 태블릿·모바일 공통 메뉴를 표시한다. */
export function MypageNav({ desktop = false }: { desktop?: boolean }) {
  const pathname = usePathname()
  return (
    <div className={desktop ? "flex flex-col gap-6" : "flex flex-col gap-3 border-b border-[#E3E9F0] bg-[#FDFEFF] p-4 md:flex-row md:items-center md:px-8 md:py-3"}>
      <nav aria-label="마이페이지 메뉴" className={desktop ? "flex flex-col gap-1" : "grid min-w-0 grid-cols-2 gap-2 md:flex md:flex-1 md:gap-1"}>
        {mypageTabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + "/")
          const Icon = tab.icon
          return (
            <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={cn(
              "flex items-center gap-2.5 rounded-[10px] px-3 font-semibold text-gray-03 hover:bg-[#F5F8FB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10",
              desktop ? "h-11 text-[14.5px]" : "h-12 justify-center border border-[#E3E9F0] text-sm md:h-11 md:justify-start md:border-0 md:text-[14.5px]",
              active && "border-main-20 bg-main-22 font-bold text-main-00 hover:bg-main-22",
            )}>
              <Icon className={cn("size-[18px] shrink-0", active && "text-main-10")} strokeWidth={1.75} aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </nav>
      <Link href={appRoutes.projectCreate} className={cn("inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] bg-main-10 px-4 text-[15px] font-semibold text-white hover:bg-main-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10", desktop ? "h-12 w-full" : "h-12 w-full md:h-10 md:w-auto md:text-sm")}>
        <Upload className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />프로젝트 등록
      </Link>
    </div>
  )
}
