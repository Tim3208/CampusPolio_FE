import type { Metadata } from "next";

import { UserFlowPage } from "@/widgets/user-flows";

export const metadata: Metadata = {
  title: "전체 유저 플로우 | CampusPolio",
  description: "사용자 행동과 기대 결과, 구현 상태와 조건별 흐름을 검토하는 목록입니다.",
  robots: { index: false, follow: false },
};

/** 서버 연결 없이 확인할 수 있는 전체 유저 플로우 목록을 연결한다. */
export default function Page() {
  return <UserFlowPage />;
}
