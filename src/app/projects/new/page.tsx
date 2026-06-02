import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/entities/user"
import type { User } from "@/entities/user"
import { appRoutes, queryParams } from "@/shared/config"
import { ProjectEditorPage } from "@/widgets/project"

/**
 * 프로젝트 작성 가능 인증 상태를 확인하고 필요하면 안내 페이지로 이동한다.
 * @param nextPath 인증 후 돌아올 작성 화면 경로
 */
async function requireProjectEditorAccess(nextPath: string) {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")
  const params = new URLSearchParams({ [queryParams.next]: nextPath })

  if (!cookie) {
    redirect(`${appRoutes.login}?${params.toString()}`)
  }

  let user: User

  try {
    user = await getCurrentUser({
      cache: "no-store",
      headers: { cookie },
    })
  } catch {
    redirect(`${appRoutes.login}?${params.toString()}`)
  }

  if (!user.isVerified) {
    redirect(`${appRoutes.verifyEmail}?${params.toString()}`)
  }
}

/**
 * 새 프로젝트 등록 페이지를 렌더링한다.
 * @returns 프로젝트 등록 페이지
 */
export default async function Page() {
  await requireProjectEditorAccess(appRoutes.projectCreate)

  return <ProjectEditorPage mode="create" />
}
