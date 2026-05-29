"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { getCurrentUser } from "@/entities/user"
import { appRoutes, queryParams } from "@/shared/config"

type MypageAuthGateProps = {
  children: ReactNode
}

/**
 * 마이페이지 접근 전 브라우저 인증 상태를 확인한다.
 * @param children 인증 성공 후 보여줄 마이페이지 화면
 * @returns 인증 확인 중 UI 또는 마이페이지 화면
 */
export function MypageAuthGate({ children }: MypageAuthGateProps) {
  const router = useRouter()
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    let ignore = false

    /**
     * 현재 로그인 상태를 확인하고 실패 시 로그인 화면으로 이동한다.
     */
    async function verifyUser() {
      try {
        await getCurrentUser({ cache: "no-store" })

        if (!ignore) {
          setIsAllowed(true)
        }
      } catch {
        const params = new URLSearchParams({
          [queryParams.next]: appRoutes.mypage,
        })

        router.replace(`${appRoutes.login}?${params.toString()}`)
      }
    }

    verifyUser()

    return () => {
      ignore = true
    }
  }, [router])

  if (!isAllowed) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f5f8fb] px-6 py-16">
        <p className="text-sm text-gray-05">로그인 상태를 확인하고 있습니다.</p>
      </main>
    )
  }

  return children
}
