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
    <header className="sticky top-0 z-40 h-14 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-4 px-6 md:px-10">
        <Link
          href={appRoutes.home}
          className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold"
          aria-label="CampusPolio 홈으로 이동"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted">
            <GraduationCap aria-hidden="true" className="size-4" />
          </span>
          <span className="truncate">CampusPolio</span>
        </Link>

        <Button asChild variant="outline" size="sm">
          <Link href={appRoutes.login}>
            <LogIn aria-hidden="true" />
            로그인
          </Link>
        </Button>
      </div>
    </header>
  );
}
