import Link from "next/link"
import { MailCheck } from "lucide-react"

import { appRoutes } from "@/shared/config"
import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"

export function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full border bg-muted">
            <MailCheck aria-hidden="true" className="size-5" />
          </div>
          <CardTitle>학교 이메일 인증이 필요합니다</CardTitle>
          <CardDescription>
            Google 로그인은 완료되었습니다. 프로젝트 기능을 사용하려면 학교
            이메일 인증을 진행해야 합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm leading-6 text-muted-foreground">
            인증번호 발송과 확인 기능은 다음 단계에서 연결됩니다. 현재는
            인증이 필요한 사용자를 분리하기 위한 안내 화면입니다.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href={appRoutes.home}>홈으로 돌아가기</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
