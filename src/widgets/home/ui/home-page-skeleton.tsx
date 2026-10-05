import { Skeleton } from "@/shared/ui/skeleton";

/** 홈의 강조 트랙과 분야별 카드 배치를 유지하면서 데이터 조회 중임을 안내한다. */
export function HomePageSkeleton() {
  return (
    <main aria-busy="true" className="min-h-screen bg-[#F5F8FB]">
      <span role="status" className="sr-only">
        프로젝트를 불러오는 중입니다.
      </span>
      <div className="mx-auto max-w-[1440px] px-4 pt-7 md:px-8 md:pt-10 lg:px-10 xl:px-12 xl:pt-14">
        <Skeleton className="mb-6 h-8 w-44" />
        <div className="-mx-4 flex gap-3 overflow-hidden px-4 md:mx-0 md:gap-6 md:px-0">
          {[0, 1, 2].map((index) => (
            <Skeleton
              key={index}
              className="aspect-[5/6] w-[290px] shrink-0 md:aspect-[4/3] md:w-[400px] lg:w-[480px]"
            />
          ))}
        </div>
        <Skeleton className="mt-11 mb-6 h-8 w-44 md:mt-14" />
        <div className="mb-6 flex gap-2">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-9 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="aspect-[16/14]" />
          ))}
        </div>
      </div>
    </main>
  );
}
