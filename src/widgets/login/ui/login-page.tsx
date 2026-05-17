import { ShieldCheck } from "lucide-react"

import { GoogleSignInButton } from "@/features/auth/google-sign-in"
import { Badge } from "@/shared/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"

type LoginPageProps = {
  nextPath: string
}

export function LoginPage({ nextPath }: LoginPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Badge variant="outline" className="mb-4">
            CampusPolio
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Google 계정으로 로그인
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            삼육대학교 Google 계정으로 로그인하면 프로젝트 아카이브와
            포트폴리오 기능을 사용할 수 있습니다.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full border bg-muted">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </div>
            <CardTitle>로그인</CardTitle>
            <CardDescription>
              학교 계정 확인 후 서비스 이용 상태를 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <GoogleSignInButton nextPath={nextPath} />
            <Separator />
            <p className="text-center text-xs leading-5 text-muted-foreground">
              로그인하면 CampusPolio의 서비스 이용 약관과 개인정보 처리
              기준에 동의한 것으로 간주됩니다.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
