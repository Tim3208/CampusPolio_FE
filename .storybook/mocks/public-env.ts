import { getStorybookGoogleClientId } from "./google-scenario";

// 이 모듈은 Storybook Vite에서만 src/shared/config/env를 대체한다.
export const publicEnv = {
  apiBaseUrl: "",
  /** 인증 시나리오에서만 가상 ID를 읽는다. */
  get googleClientId() { return getStorybookGoogleClientId(); },
} as const;

/** Storybook은 모든 API 요청을 같은 출처의 MSW 경계로 보낸다. */
export function buildApiUrl(path: `/${string}`) {
  return path;
}
