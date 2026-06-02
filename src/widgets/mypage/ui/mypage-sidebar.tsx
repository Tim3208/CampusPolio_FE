"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  FolderArchive,
  Images,
  Settings,
  Upload,
} from "lucide-react";

import { appRoutes } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const mypageTabs = [
  {
    href: appRoutes.mypageProjects,
    icon: FolderArchive,
    label: "프로젝트 모음",
  },
  {
    href: appRoutes.mypagePortfolios,
    icon: Images,
    label: "포트폴리오 모음",
  },
  {
    href: appRoutes.mypageSettings,
    icon: Settings,
    label: "설정",
  },
  {
    href: appRoutes.mypageSupport,
    icon: CircleHelp,
    label: "Support",
  },
] as const;

/**
 * 현재 경로가 사이드바 탭 경로에 속하는지 확인한다.
 * @param pathname 현재 브라우저 경로
 * @param href 탭 링크 경로
 * @returns 현재 탭 활성 여부
 */
function isActiveTab(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 마이페이지 좌측 탭 사이드바를 렌더링한다.
 * @returns 마이페이지 사이드바 UI
 */
export function MypageSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-5 border-r bg-white px-5 py-8">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-main-02">삼육 아카이브</p>
        <p className="text-xs text-gray-05">프로젝트 저장소</p>
      </div>

      <nav className="flex flex-col gap-1" aria-label="마이페이지 메뉴">
        {mypageTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActiveTab(pathname, tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-gray-06 transition-colors hover:bg-main-22 hover:text-main-02",
                active && "bg-main-22 text-main-02",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <Button
        asChild
        className="mt-2 h-9 rounded-md bg-main-10 text-xs text-white hover:bg-main-11"
      >
        <Link href={appRoutes.projectCreate}>
          <Upload className="size-4" aria-hidden="true" />
          Upload Project
        </Link>
      </Button>
    </aside>
  );
}
