import type { Metadata } from "next"

import { LoginPage } from "@/widgets/login"

import { getSafeNextPath } from "@/shared/config"

export const metadata: Metadata = {
  title: "로그인 | CampusPolio",
  description: "CampusPolio Google 로그인",
}

type PageProps = {
  searchParams: Promise<{
    next?: string | string[]
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const nextParam = Array.isArray(params.next) ? params.next[0] : params.next

  return <LoginPage nextPath={getSafeNextPath(nextParam)} />
}
