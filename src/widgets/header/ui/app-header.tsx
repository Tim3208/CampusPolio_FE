"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { CircleUserRound, FolderArchive, Images, Search, Settings, Upload } from "lucide-react";

import { getCurrentUser } from "@/entities/user";
import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu";

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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

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

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 48rem)");

    /** 데스크톱 배치로 바뀌면 숨겨진 계정 메뉴와 모달 잠금을 해제한다. */
    const closeAccountMenuOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsAccountMenuOpen(false);
      }
    };

    desktopQuery.addEventListener("change", closeAccountMenuOnDesktop);
    return () => {
      desktopQuery.removeEventListener("change", closeAccountMenuOnDesktop);
    };
  }, []);

  /**
   * 헤더 검색어의 공백을 정리하여 프로젝트 탐색 화면으로 이동한다.
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
    <header className="sticky top-0 z-40 h-[58px] border-b md:h-16 border-[#E3E9F0] bg-[#FDFEFF]">
      <div className="flex h-full w-full items-center justify-between gap-3 px-4 md:px-6 xl:px-8">
        <Link href={appRoutes.home} className="flex shrink-0 items-center gap-[7px] whitespace-nowrap text-[17px] font-extrabold tracking-[-0.02em] text-main-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10 md:gap-2.5 md:text-[21px]" aria-label="CampusPolio 홈으로 이동">
          <Image src="/images/syu_logo.png" alt="" width={36} height={36} className="size-7 shrink-0 md:size-9" priority />
          <span>Campus Polio</span>
        </Link>
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="mr-2 hidden h-10 w-[200px] items-center gap-2 rounded-full border border-[#E3E9F0] bg-[#F5F8FB] px-4 text-sm text-gray-05 focus-within:border-main-10 focus-within:ring-3 focus-within:ring-main-10/20 md:flex lg:w-[300px]">
            <Search className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
            <input aria-label="프로젝트 검색" value={searchKeyword} onChange={(event) => setSearchKeyword(event.target.value)} placeholder="프로젝트 검색" className="min-w-0 w-full bg-transparent text-sm text-gray-03 outline-none placeholder:text-gray-05" />
          </form>
          <Button asChild variant="outline" size="icon-md" className="border-[#CBD6E2] bg-[#FDFEFF] text-gray-01 hover:border-main-20 hover:bg-[#FDFEFF] hover:text-main-10 md:hidden">
            <Link href={appRoutes.projects} aria-label="프로젝트 검색"><Search className="size-[18px]" strokeWidth={1.75} aria-hidden="true" /></Link>
          </Button>
          {isLoggedIn ? (
            <>
              <Button asChild variant="outline" size="md" className="hidden border-[#CBD6E2] bg-[#FDFEFF] font-semibold text-gray-01 hover:border-main-20 hover:bg-[#FDFEFF] hover:text-main-10 md:inline-flex">
                <Link href={appRoutes.mypage}><CircleUserRound className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />마이페이지</Link>
              </Button>
              {isAccountMenuOpen && <div aria-hidden="true" className="fixed inset-x-0 top-[58px] bottom-0 bg-main-00/48 md:hidden" />}
              <DropdownMenu open={isAccountMenuOpen} onOpenChange={setIsAccountMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-md" aria-label="계정 메뉴" className="border-[#CBD6E2] bg-[#FDFEFF] text-gray-01 hover:border-main-20 hover:bg-[#FDFEFF] hover:text-main-10 data-[state=open]:border-main-10 data-[state=open]:bg-main-10 data-[state=open]:text-white md:hidden"><CircleUserRound className="size-[18px]" strokeWidth={1.75} aria-hidden="true" /></Button>
                </DropdownMenuTrigger>
                {/* Radix 스크롤 잠금의 여백을 보정하여 메뉴를 화면 왼쪽에 맞춘다. */}
                <DropdownMenuContent align="end" alignOffset={-16} sideOffset={9} avoidCollisions={false} style={{ transform: "translateX(var(--removed-body-scroll-bar-size, 0px))" }} className="w-screen max-w-none rounded-none border-0 border-b border-[#E3E9F0] p-0 md:hidden">
                  <DropdownMenuGroup className="flex flex-col gap-1 p-3">
                    <DropdownMenuItem asChild className="h-11 gap-2.5 py-0 text-[14.5px]"><Link href={appRoutes.mypageProjects}><FolderArchive strokeWidth={1.75} aria-hidden="true" />내 프로젝트</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild className="h-11 gap-2.5 py-0 text-[14.5px]"><Link href={appRoutes.mypagePortfolios}><Images strokeWidth={1.75} aria-hidden="true" />내 포트폴리오</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild className="h-11 gap-2.5 py-0 text-[14.5px]"><Link href={appRoutes.mypageSettings}><Settings strokeWidth={1.75} aria-hidden="true" />프로필 설정</Link></DropdownMenuItem>
                  </DropdownMenuGroup>
                  <div className="px-4 pt-1 pb-4">
                    <DropdownMenuItem asChild className="h-12 justify-center bg-main-10 text-[15px] text-white data-[highlighted]:bg-main-11 data-[highlighted]:text-white"><Link href={appRoutes.projectCreate}><Upload strokeWidth={1.75} aria-hidden="true" />프로젝트 등록</Link></DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="md" className="hidden font-semibold text-gray-03 hover:bg-[#F5F8FB] hover:text-gray-03 md:inline-flex"><Link href={appRoutes.login}>로그인</Link></Button>
              <Button asChild size="md" className="hidden bg-main-10 font-semibold text-white hover:bg-main-11 [a]:hover:bg-main-11 md:inline-flex"><Link href={appRoutes.login}>회원가입</Link></Button>
              <Button asChild size="lg" className="bg-main-10 px-3 text-[13px] font-semibold text-white hover:bg-main-11 [a]:hover:bg-main-11 md:hidden"><Link href={appRoutes.login}>로그인</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
