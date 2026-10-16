"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

/** 전역 오류 경계에서 발생한 클라이언트 렌더링 오류를 수집하고 기본 오류 화면을 표시한다. */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // 서버 오류는 이번 클라이언트 수집 범위에서 제외한다.
    if (!error.digest) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
