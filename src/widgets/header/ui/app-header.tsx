import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";

import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";

/**
 * 모든 페이지 상단에 표시되는 공통 애플리케이션 헤더를 렌더링한다.
 * @returns 공통 헤더 UI
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-2 md:px-10 md:py-3">
        <Link
          href={appRoutes.home}
          className="inline-flex min-w-0 items-center gap-2 text-xl font-semibold"
          aria-label="CampusPolio 홈으로 이동"
        >
          <span className="truncate">Campus Polio</span>
        </Link>

        <div className="flex justify-between gap-2 items-center">
          <div className="bg-gray-300 rounded-2xl px-3 py-2 text-sm text-black">
            검색창이 들어갈 예정입니다.
          </div>
          <Link href={appRoutes.login} className="cursor-pointer">
            <span className="px-3 py-2 rounded-md font-medium text-[12px] shadow-sm">
              로그인
            </span>
          </Link>
          <Link href={appRoutes.login} className="cursor-pointer">
            <span className="px-3 py-2 rounded-md font-medium text-[12px] shadow-sm bg-[#005E9C] text-white">
              회원가입
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
