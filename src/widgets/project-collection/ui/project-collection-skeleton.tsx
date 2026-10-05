import { Skeleton } from "@/shared/ui/skeleton";

/** 탐색 화면의 검색 도구와 카드 그리드 자리를 유지하고 조회 진행을 안내한다. */
export function ProjectCollectionSkeleton() {
  return (
    <main aria-busy="true" className="min-h-screen bg-[#F5F8FB]">
      <span role="status" className="sr-only">
        프로젝트를 불러오는 중입니다.
      </span>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 pt-7 md:px-8 md:pt-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-10 xl:grid-cols-[224px_minmax(0,1fr)] xl:gap-11 xl:px-12">
        <aside className="hidden lg:block">
          <Skeleton className="h-8 w-40" />
          {[0, 1, 2, 3, 4].map((index) => (
            <Skeleton key={index} className="mt-4 h-10 w-full" />
          ))}
        </aside>
        <div>
          <Skeleton className="mb-6 h-9 w-56" />
          <Skeleton className="mb-4 h-11 w-full" />
          <Skeleton className="mb-6 h-12 w-full" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[14px] border border-[#E3E9F0] bg-[#FDFEFF]"
              >
                <Skeleton className="aspect-[16/10] rounded-none" />
                <div className="space-y-3 p-[18px]">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
