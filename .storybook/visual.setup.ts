import "./visual-fonts.css";
import { beforeEach, afterEach, vi } from "vitest";
import { assertNoUnhandledApiRequests } from "./test-support";
/** 실제 timer는 유지하면서 fixture의 날짜 기준만 고정한다. */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-26T12:00:00+09:00"));
});
/** 시계와 미처리 요청 검사를 스토리마다 정리한다. */
afterEach(() => {
  vi.useRealTimers();
  assertNoUnhandledApiRequests();
});

