import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const configUrl = new URL("../../src/shared/config/analytics.ts", import.meta.url);
const environmentKeys = ["NODE_ENV", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_GA_DEBUG", "NEXT_PUBLIC_USE_MOCK_API"];

type AnalyticsConfiguration = {
  measurementId: string;
  enabled: boolean;
  debugMode: boolean;
};

/** 환경변수와 모듈 캐시를 별도 프로세스로 격리해 실제 설정 모듈을 읽는다. */
function readConfiguration(variables: Record<string, string>): AnalyticsConfiguration {
  const environment = { ...process.env };
  for (const key of environmentKeys) delete environment[key];
  Object.assign(environment, variables);
  const result = spawnSync(process.execPath, [
    "--input-type=module",
    "--eval",
    `import { analyticsConfig } from ${JSON.stringify(configUrl.href)}; process.stdout.write(JSON.stringify(analyticsConfig));`,
  ], { env: environment, encoding: "utf8", timeout: 10000, windowsHide: true });
  assert.equal(result.status, 0, result.error?.message ?? result.stderr);
  return JSON.parse(result.stdout) as AnalyticsConfiguration;
}

test("실행 환경별 기본 수집 정책과 명시적 Debug 선택, 측정 ID 공백을 처리한다", () => {
  const measurementId = "G-CONFIG1234";
  const cases: Array<{ name: string; variables: Record<string, string>; expected: AnalyticsConfiguration }> = [
    {
      name: "미설정 환경에서는 빈 ID와 비활성 상태를 사용한다",
      variables: {},
      expected: { measurementId: "", enabled: false, debugMode: false },
    },
    {
      name: "개발 방문은 유효한 ID가 있어도 기본 수집하지 않는다",
      variables: { NODE_ENV: "development", NEXT_PUBLIC_GA_MEASUREMENT_ID: measurementId },
      expected: { measurementId, enabled: false, debugMode: false },
    },
    {
      name: "운영 빌드라도 Mock 방문은 기본 수집하지 않는다",
      variables: { NODE_ENV: "production", NEXT_PUBLIC_USE_MOCK_API: "true", NEXT_PUBLIC_GA_MEASUREMENT_ID: measurementId },
      expected: { measurementId, enabled: false, debugMode: false },
    },
    {
      name: "실제 API의 운영 환경은 수집 대상으로 지정한다",
      variables: { NODE_ENV: "production", NEXT_PUBLIC_USE_MOCK_API: "false", NEXT_PUBLIC_GA_MEASUREMENT_ID: measurementId },
      expected: { measurementId, enabled: true, debugMode: false },
    },
    {
      name: "명시적인 Debug true는 개발 및 Mock 수신 확인을 허용한다",
      variables: { NODE_ENV: "development", NEXT_PUBLIC_USE_MOCK_API: "true", NEXT_PUBLIC_GA_DEBUG: "true", NEXT_PUBLIC_GA_MEASUREMENT_ID: measurementId },
      expected: { measurementId, enabled: true, debugMode: true },
    },
    {
      name: "Debug처럼 보이는 다른 문자열은 수집을 켜지 않는다",
      variables: { NODE_ENV: "development", NEXT_PUBLIC_GA_DEBUG: "TRUE", NEXT_PUBLIC_GA_MEASUREMENT_ID: measurementId },
      expected: { measurementId, enabled: false, debugMode: false },
    },
    {
      name: "측정 ID를 복사할 때 들어간 앞뒤 공백만 제거한다",
      variables: { NODE_ENV: "production", NEXT_PUBLIC_GA_MEASUREMENT_ID: `  ${measurementId}\n` },
      expected: { measurementId, enabled: true, debugMode: false },
    },
    {
      name: "공백뿐인 ID는 빈 값으로 정리하여 컴포넌트의 미설정 차단에 전달한다",
      variables: { NODE_ENV: "production", NEXT_PUBLIC_GA_MEASUREMENT_ID: "  \t\n" },
      expected: { measurementId: "", enabled: true, debugMode: false },
    },
  ];

  for (const scenario of cases) {
    assert.deepEqual(readConfiguration(scenario.variables), scenario.expected, scenario.name);
  }
});
