import type { Metadata } from "next"

import { VerifyEmailPage } from "@/widgets/verify-email"

export const metadata: Metadata = {
  title: "이메일 인증 | CampusPolio",
  description: "CampusPolio 학교 이메일 인증 안내",
}

export default function Page() {
  return <VerifyEmailPage />
}
