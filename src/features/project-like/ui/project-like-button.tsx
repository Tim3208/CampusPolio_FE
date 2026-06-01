"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type ProjectLikeButtonProps = {
  initialLiked: boolean;
  initialLikeCount: number;
};

/**
 * 프로젝트 좋아요 상태와 숫자를 화면에서 토글한다.
 * @param initialLiked 초기 좋아요 여부
 * @param initialLikeCount 초기 좋아요 수
 */
export function ProjectLikeButton({
  initialLiked,
  initialLikeCount,
}: ProjectLikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  /**
   * 좋아요 버튼 클릭 시 좋아요 여부와 카운트를 함께 변경한다.
   */
  const handleLikeClick = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => prev + (isLiked ? -1 : 1));
  };

  return (
    <button
      type="button"
      onClick={handleLikeClick}
      className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition ${
        isLiked
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      {likeCount}
    </button>
  );
}
