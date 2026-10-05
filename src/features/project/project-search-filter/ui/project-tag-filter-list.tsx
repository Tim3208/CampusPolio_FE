"use client";
import type { RefObject } from "react";
import { Check } from "lucide-react";
import { projectFilterTags, toggleTag } from "../lib/search-query";

/** 하나의 태그 목록을 즉시 적용 또는 시트 초안 편집용 체크박스로 표시한다. */
export function ProjectTagFilterList({
  tags,
  onChange,
  firstInputRef,
  sheet = false,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  firstInputRef?: RefObject<HTMLInputElement | null>;
  sheet?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {projectFilterTags.map((tag, index) => (
        <label
          key={tag}
          className={
            "relative flex cursor-pointer items-center gap-2.5 text-gray-03 " +
            (sheet
              ? "h-[50px] border-b border-[#E3E9F0] px-1 text-[15px]"
              : "h-10 rounded-lg px-2.5 text-[14.5px] hover:bg-[#FDFEFF]")
          }
        >
          <input
            ref={index === 0 ? firstInputRef : undefined}
            type="checkbox"
            checked={tags.includes(tag)}
            onChange={() => onChange(toggleTag(tags, tag))}
            className="peer sr-only"
          />
          <span className="flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-main-13 bg-[#FDFEFF] peer-checked:border-main-10 peer-checked:bg-main-10 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-main-10">
            {tags.includes(tag) && (
              <Check
                className="size-[13px]"
                strokeWidth={3}
                aria-hidden="true"
              />
            )}
          </span>
          <span className={tags.includes(tag) ? "font-bold text-main-00" : ""}>
            {tag}
          </span>
        </label>
      ))}
    </div>
  );
}
