import { redirect } from "next/navigation"

import { appRoutes } from "@/shared/config"

/**
 * 마이페이지 기본 경로를 프로젝트 모음 탭으로 이동시킨다.
 */
export default function Page() {
  redirect(appRoutes.mypageProjects)
}
