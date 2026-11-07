const debugMode = process.env.NEXT_PUBLIC_GA_DEBUG === "true";

export const analyticsConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "",
  debugMode,
  // 로컬·Mock 방문은 제외하며, 별도 테스트 스트림을 확인할 때만 명시적으로 켠다.
  enabled: debugMode || (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_USE_MOCK_API !== "true"
  ),
} as const;
