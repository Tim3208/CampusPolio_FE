"use client"

import { useCallback, useState } from "react"
import { ImageOff } from "lucide-react"

/** 동적 대표 이미지의 로드 실패를 같은 16:9 크기의 제목 대체 영역으로 표시한다. */
export function ProjectDetailImage({ url, title }: { url: string; title: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  /** 하이드레이션 전에 완료된 이미지 실패도 확인한다. */
  const attachImage = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) setFailedUrl(url)
  }, [url])

  return failedUrl === url ? (
    <div role="img" aria-label={title} className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-[14px] bg-main-22 text-[13px] font-semibold text-main-12">
      <ImageOff className="size-[26px]" strokeWidth={1.75} aria-hidden="true" />
      <span>이미지를 불러오지 못했어요</span>
    </div>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- API의 동적 외부 이미지를 원격 최적화 없이 표시하며 로드 실패를 처리한다.
    <img ref={attachImage} src={url} alt={title + " 대표 이미지"} onError={() => setFailedUrl(url)} className="block aspect-video w-full rounded-[14px] bg-main-22 object-cover" />
  )
}
