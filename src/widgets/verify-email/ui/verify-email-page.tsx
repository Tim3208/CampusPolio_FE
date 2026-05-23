import Link from "next/link";
import { MailCheck } from "lucide-react";

import { appRoutes } from "@/shared/config";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

/**
 * 로그인 후 학교 이메일 인증이 필요한 서비스 접근 상태를 안내한다.
 * @returns 이메일 인증 안내 UI
 */
export function VerifyEmailPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-md p-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full border bg-muted">
            <MailCheck aria-hidden="true" className="size-5" />
          </div>
          <CardTitle>학교 이메일 인증이 필요합니다</CardTitle>
          <CardDescription>
            Google 로그인은 완료되었습니다. 일부 서비스를 이용하려면 학교
            이메일 인증을 추가로 진행해야 합니다.
          </CardDescription>
        </CardHeader>
        <div className="flex gap-4">
          <Button asChild variant="default" className="flex-1">
            <Link href={appRoutes.home}>학교 이메일 인증하기</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={appRoutes.home}>홈으로 돌아가기</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
