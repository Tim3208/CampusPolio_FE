export const storybookEnvironment = {
  NEXT_PUBLIC_API_BASE_URL: "",
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: "",
  NEXT_PUBLIC_USE_MOCK_API: "false",
  NEXT_PUBLIC_MOCK_AUTH_STATE: "unverified",
} as const;

/** 작업별 브라우저 서버 포트를 정수 1024~65535로 제한한다. */
export function getStorybookTestPort(value = process.env.STORYBOOK_TEST_PORT) {
  if (value === undefined) return 6211;
  if (!/^[1-9]\d*$/.test(value) || Number(value) < 1024 || Number(value) > 65535) {
    throw new Error("STORYBOOK_TEST_PORT는 1024~65535 범위의 정수여야 합니다.");
  }
  return Number(value);
}

/** Storybook 번들에서 허용한 공개 환경 값만 명시적으로 치환한다. */
export function getStorybookDefines() {
  return Object.fromEntries(
    Object.entries(storybookEnvironment).map(([key, value]) => [
      `process.env.${key}`,
      JSON.stringify(value),
    ]),
  );
}
