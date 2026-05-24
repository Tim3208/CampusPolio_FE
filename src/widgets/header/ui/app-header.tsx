import Link from "next/link";
import { headers } from "next/headers";
import { CircleUserRound, Search } from "lucide-react";

import { getCurrentUser } from "@/entities/user";
import { appRoutes, mockConfig } from "@/shared/config";
import { Button } from "@/shared/ui/button";

/**
 * 요청 쿠키를 전달해 현재 로그인 사용자를 조회한다.
 * @returns 로그인 사용자가 있으면 사용자 정보, 없으면 null
 */
async function getHeaderUser() {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie");

  if (!cookie && !mockConfig.useMockApi) {
    return null;
  }

  try {
    return await getCurrentUser({
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    });
  } catch {
    return null;
  }
}

/**
 * 모든 페이지 상단에 표시되는 공통 애플리케이션 헤더를 렌더링한다.
 * @returns 공통 헤더 UI
 */
export async function AppHeader() {
  const user = await getHeaderUser();

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

        <div className="flex items-center justify-between gap-2">
          <div className="hidden items-center gap-2 rounded-2xl bg-gray-200 px-3 py-2 text-sm text-gray-700 sm:flex">
            <Search className="size-4" aria-hidden="true" />
            <span>검색창이 들어갈 예정입니다.</span>
          </div>
          {user ? (
            <Button asChild variant="ghost" size="icon" aria-label="마이페이지로 이동">
              <Link href={appRoutes.mypage}>
                <CircleUserRound className="size-5" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={appRoutes.login}>로그인</Link>
              </Button>
              <Button asChild size="sm" className="bg-[#005E9C] text-white">
                <Link href={appRoutes.login}>회원가입</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
