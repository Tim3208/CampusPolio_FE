import type { Metadata } from "next"

import { VerifyEmailPage } from "@/widgets/verify-email"

export const metadata: Metadata = {
  title: "이메일 인증 | CampusPolio",
  description: "CampusPolio 학교 이메일 인증 안내",
}

/**
 * 학교 이메일 인증이 필요한 사용자에게 안내 화면을 보여준다.
 * @returns 이메일 인증 안내 페이지 UI
 */
export default function Page() {
  return <VerifyEmailPage />
}
