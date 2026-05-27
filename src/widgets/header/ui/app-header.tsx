"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";

import { appRoutes } from "@/shared/config";

export function AppHeader() {
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchKeyword.trim()) return;

    console.log("검색어:", searchKeyword);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6">
        <Link
          href={appRoutes.home}
          className="text-sm font-bold text-[#005E9C]"
        >
          Campus Polio
        </Link>

        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearch}
            className="hidden h-8 w-[260px] items-center gap-2 rounded-full bg-slate-100 px-3 md:flex"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="검색어를 입력하세요"
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            />
          </form>

          <Link
            href={appRoutes.login}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            로그인
          </Link>

          <span className="rounded-md bg-[#005E9C] px-3 py-2 text-[12px] font-medium text-white shadow-sm">
            회원가입
          </span>
        </div>
      </div>
    </header>
  );
}
