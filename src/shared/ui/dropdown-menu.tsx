"use client";

import * as React from "react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { cn } from "@/shared/lib/utils";

/** 키보드 탐색과 닫기 후 포커스 복귀를 제공하는 메뉴를 구성한다. */
function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root {...props} />;
}
/** 메뉴를 여는 버튼을 렌더링한다. */
function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}
/** 화면 경계 안에 배치되는 메뉴 항목 영역을 렌더링한다. */
function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content data-slot="dropdown-menu-content" sideOffset={sideOffset} className={cn("z-50 min-w-48 max-w-[calc(100vw-32px)] overflow-y-auto rounded-xl border border-[#E3E9F0] bg-[#FDFEFF] p-2 text-gray-03 shadow-[0_2px_4px_rgb(0_29_53/0.06),0_20px_40px_-18px_rgb(0_29_53/0.32)] outline-none", className)} {...props} /></DropdownMenuPrimitive.Portal>;
}
/** 선택 가능한 메뉴 항목을 렌더링한다. */
function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" className={cn("relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold outline-none select-none data-[highlighted]:bg-[#F5F8FB] data-[highlighted]:text-main-10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0", className)} {...props} />;
}
/** 메뉴의 항목 묶음을 렌더링한다. */
function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}
/** 메뉴 묶음의 설명을 표시한다. */
function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn("px-3 py-2 text-sm font-semibold", className)} {...props} />;
}
/** 메뉴 묶음 사이의 구분선을 표시한다. */
function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("my-1 h-px bg-[#E3E9F0]", className)} {...props} />;
}
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator };
