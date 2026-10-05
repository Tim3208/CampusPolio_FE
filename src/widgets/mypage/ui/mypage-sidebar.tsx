import { MypageNav } from "./mypage-nav"

/** 넓은 화면의 저장소 안내와 공통 마이페이지 메뉴를 표시한다. */
export function MypageSidebar() {
  return (
    <aside className="hidden flex-col gap-6 border-r border-[#E3E9F0] bg-[#FDFEFF] px-5 py-8 lg:flex">
      <div>
        <p className="text-[19px] font-extrabold tracking-[-.02em] text-main-00">삼육 아카이브</p>
        <p className="text-[13px] text-gray-05">프로젝트 저장소</p>
      </div>
      <MypageNav desktop />
    </aside>
  )
}
