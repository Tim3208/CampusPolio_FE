type MypageRoutePlaceholderProps = {
  title: string
}

/**
 * 마이페이지 탭 라우팅 확인을 위한 최소 본문 영역을 렌더링한다.
 * @param title 현재 탭 제목
 * @returns 탭별 placeholder 본문 UI
 */
export function MypageRoutePlaceholder({
  title,
}: MypageRoutePlaceholderProps) {
  return (
    <section className="flex min-h-[360px] flex-1 flex-col gap-3 px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-01">{title}</h1>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white/70 px-6 py-10 text-sm text-gray-05">
        본문 영역은 다음 단계에서 구현됩니다.
      </div>
    </section>
  )
}
