import { Skeleton } from "@/shared/ui/skeleton"

/** 상세 정보의 반응형 본문과 자료 패널 자리를 로딩 중에도 유지한다. */
export function ProjectDetailSkeleton() {
  return (
    <main aria-busy="true" className="min-h-screen bg-[#F5F8FB]">
      <span className="sr-only">프로젝트를 불러오는 중</span>
      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 pt-7 pb-10 md:px-8 md:pt-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 lg:px-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-14 xl:px-12 xl:pt-9">
        <div className="flex min-w-0 flex-col gap-4 md:gap-5">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-1.5">{[0, 1, 2].map((n) => <Skeleton key={n} className="h-7 w-14 rounded-full" />)}</div>
          <Skeleton className="h-9 w-[96%] md:h-12" /><Skeleton className="h-9 w-[70%] md:h-12" />
          <Skeleton className="h-5 w-[88%]" />
          <div className="grid grid-cols-2 gap-5 border-y border-[#E3E9F0] py-[18px] md:grid-cols-4">{[0, 1, 2, 3].map((n) => <div key={n} className="space-y-1.5"><Skeleton className="h-3 w-12" /><Skeleton className="h-4 w-20" /></div>)}</div>
          <Skeleton className="aspect-video w-full rounded-[14px]" />
          <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-[94%]" /><Skeleton className="h-4 w-[62%]" /></div>
        </div>
        <div className="grid content-start gap-4 md:grid-cols-2 lg:grid-cols-1"><Skeleton className="h-60 rounded-[14px]" /><Skeleton className="h-28 rounded-[14px]" /></div>
      </div>
    </main>
  )
}
