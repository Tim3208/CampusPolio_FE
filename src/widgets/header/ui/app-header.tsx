"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { CircleUserRound, Search } from "lucide-react";

import { getCurrentUser } from "@/entities/user";
import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";

/**
 * 브라우저에서 현재 로그인 사용자를 조회한다.
 * @returns 로그인 상태 여부
 */
async function getIsLoggedIn() {
  try {
    await getCurrentUser({ cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

/**
 * 모든 페이지 상단에 표시되는 공통 애플리케이션 헤더를 렌더링한다.
 * @returns 공통 헤더 UI
 */
export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    let ignore = false;

    getIsLoggedIn().then((nextIsLoggedIn) => {
      if (!ignore) {
        setIsLoggedIn(nextIsLoggedIn);
      }
    });

    return () => {
      ignore = true;
    };
  }, [pathname]);

  /**
   * 헤더 검색 폼의 기본 제출 동작을 막는다.
   * @param event 검색 폼 제출 이벤트
   */
  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const keyword = searchKeyword.trim();
    const params = new URLSearchParams();

    if (keyword) {
      params.set("keyword", keyword);
    }

    router.push(
      params.toString()
        ? `${appRoutes.projects}?${params.toString()}`
        : appRoutes.projects,
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
        <Link
          href={appRoutes.home}
          className="flex min-w-0 items-center gap-2.5"
          aria-label="CampusPolio 홈으로 이동"
        >
          <Image
            src="/images/syu_logo.png"
            alt=""
            width={42}
            height={42}
            className="h-[42px] w-[42px] shrink-0"
            priority
          />
          <span className="text-2xl font-black leading-none text-[#005E9C]">
            Campus Polio
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearch}
            className="hidden h-8 w-[260px] items-center gap-2 rounded-full bg-slate-100 px-3 md:flex"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </form>

          {isLoggedIn ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="마이페이지로 이동"
            >
              <Link href={appRoutes.mypage}>
                <CircleUserRound className="size-5" aria-hidden="true" />
              </Link>
            </Button>
          ) : (
            <>
              <Link
                href={appRoutes.login}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                로그인
              </Link>
              <Link
                href={appRoutes.login}
                className="rounded-md bg-[#005E9C] px-3 py-2 text-[12px] font-medium text-white shadow-sm"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
