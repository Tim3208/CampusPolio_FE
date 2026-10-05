import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

/** 최종 콘텐츠의 크기와 배치에 맞출 수 있는 로딩 자리 표시를 렌더링한다. */
function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn("campus-skeleton rounded-xl bg-[#E6EDF4]", className)} {...props} />;
}
export { Skeleton };
