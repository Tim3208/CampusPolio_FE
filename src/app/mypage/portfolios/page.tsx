import Link from "next/link"
import { FilePlus2 } from "lucide-react"

import { appRoutes } from "@/shared/config"

/**
 * 내 포트폴리오 모음 탭 라우트를 렌더링한다.
 * @returns 포트폴리오 모음 placeholder와 제작 진입 UI
 */
export default function Page() {
  return (
    <section className="flex min-h-[360px] flex-1 flex-col gap-6 px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-01">포트폴리오 모음</h1>
        <Link
          href={appRoutes.portfolioCreate}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-main-10 px-4 text-sm font-bold text-white transition hover:bg-main-11"
        >
          <FilePlus2 className="size-4" aria-hidden="true" />
          포트폴리오 제작
        </Link>
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white/70 px-6 py-10 text-sm leading-6 text-gray-05">
        제작된 포트폴리오 목록은 다음 단계에서 구현됩니다. 지금은 새
        포트폴리오 제작 화면으로 이동할 수 있습니다.
      </div>
    </section>
  )
}
