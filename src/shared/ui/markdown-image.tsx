"use client";

import { useCallback, useState } from "react";
import { ImageOff } from "lucide-react";

type MarkdownImageProps = { src?: string; alt?: string; title?: string };

/** 동적 본문 이미지를 표시하고 초기·이후 실패 시 같은 비율의 대체 표현을 제공한다. */
export function MarkdownImage({ src, alt = "", title }: MarkdownImageProps) {
  const [failedSource, setFailedSource] = useState<string | undefined>();
  /** 하이드레이션 전에 완료된 이미지 실패도 현재 주소에 연결해 확인한다. */
  const attachImage = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) setFailedSource(src);
  }, [src]);

  if (!src || failedSource === src) {
    return (
      <span role="img" aria-label={alt || "이미지 없음"} title={title} className="campus-markdown-image flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-main-22 text-sm text-main-12">
        <ImageOff className="size-6" strokeWidth={1.75} aria-hidden="true" />
        <span>이미지 없음</span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- API 본문의 동적 외부 이미지를 원격 최적화 없이 표시하고 초기·이후 로드 실패를 처리한다.
    <img ref={attachImage} src={src} alt={alt} title={title} onError={() => setFailedSource(src)} className="campus-markdown-image" />
  );
}
