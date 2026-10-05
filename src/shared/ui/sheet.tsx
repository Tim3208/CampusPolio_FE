"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** 포커스와 닫기 동작을 제공하는 모달 시트를 구성한다. */
function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}
/** 시트를 여는 접근 가능한 트리거를 렌더링한다. */
function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}
/** 시트를 닫고 트리거로 포커스를 돌려주는 버튼을 렌더링한다. */
function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}
/** 시트 바깥의 클릭 가능한 배경을 렌더링한다. */
function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn("fixed inset-0 z-50 bg-main-00/48", className)} {...props} />;
}
/** 제목과 조작 요소를 담는 시트 본문을 선택한 방향에 표시한다. */
function SheetContent({ className, children, side = "bottom", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: "top" | "bottom" | "left" | "right" }) {
  const positions = {
    bottom: "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t",
    top: "inset-x-0 top-0 max-h-[85dvh] rounded-b-2xl border-b",
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
    right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
  };
  return (
    <SheetPrimitive.Portal>
      <SheetOverlay />
      <SheetPrimitive.Content data-slot="sheet-content" className={cn("fixed z-50 flex flex-col gap-4 overflow-y-auto border-[#E3E9F0] bg-[#FDFEFF] p-6 text-gray-01 shadow-xl outline-none", positions[side], className)} {...props}>
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-lg text-gray-03 hover:bg-[#F5F8FB] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-main-10" aria-label="닫기">
          <X className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
/** 시트 제목과 설명을 묶어 배치한다. */
function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-2 pr-10", className)} {...props} />;
}
/** 시트 하단의 행동 버튼을 배치한다. */
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2", className)} {...props} />;
}
/** 대화상자의 접근 가능한 제목을 렌더링한다. */
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-xl font-extrabold text-main-00", className)} {...props} />;
}
/** 대화상자의 보조 설명을 렌더링한다. */
function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-gray-05", className)} {...props} />;
}
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
