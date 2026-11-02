import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
/** 설치된 패키지가 공개한 실제 CLI 경로를 찾는다. */
function resolveBin(name) {
  const filename = require.resolve(`${name}/package.json`);
  const metadata = JSON.parse(readFileSync(filename, "utf8"));
  const bin = typeof metadata.bin === "string" ? metadata.bin : metadata.bin[name];
  return resolve(dirname(filename), bin);
}
const modes = {
  dev: [resolveBin("storybook"), "dev", "-p", "6006", "--no-open"],
  build: [resolveBin("storybook"), "build", "--output-dir", "build/storybook"],
  test: [resolveBin("vitest"), "run", "--project=storybook"],
  visual: [resolveBin("vitest"), "run", "--project=visual", "--update=none"],
  "visual-update": [resolveBin("vitest"), "run", "--project=visual", "--update"],
};
const mode = process.argv[2];
if (!(mode in modes)) throw new Error("지원하지 않는 Storybook 실행 모드입니다.");

// OS 실행과 브라우저 위치만 전달하고 개인 API/OAuth 및 임의 환경변수는 제외한다.
const allowedKeys = new Set([
  "PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "TEMP", "TMP",
  "USERPROFILE", "HOME", "HOMEDRIVE", "HOMEPATH", "LOCALAPPDATA", "APPDATA",
  "PROGRAMFILES", "PROGRAMFILES(X86)", "PROGRAMDATA", "CI",
  "PLAYWRIGHT_BROWSERS_PATH", "PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD",
]);
const env = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => allowedKeys.has(key.toUpperCase())),
);
Object.assign(env, {
  NODE_ENV: mode === "test" || mode.startsWith("visual") ? "test" : mode === "build" ? "production" : "development",
  NEXT_PUBLIC_API_BASE_URL: "",
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: "",
  NEXT_PUBLIC_USE_MOCK_API: "false",
  NEXT_PUBLIC_MOCK_AUTH_STATE: "unverified",
  STORYBOOK_DISABLE_TELEMETRY: "1",
  NEXT_TELEMETRY_DISABLED: "1",
});
// 일반 비교는 누락된 기준도 새로 만들지 않고 실패시킨다.
if (mode === "visual") env.CI = "true";
if (mode.startsWith("visual") && process.argv.slice(3).some((arg) => /^(?:-u|--update)(?:=|$)/.test(arg))) {
  throw new Error("기준 갱신은 test:visual:update 명령에서만 실행하세요.");
}
// 테스트 포트만 별도로 검증해 전달하고 다른 사용자 설정은 계속 차단한다.
if ((mode === "test" || mode.startsWith("visual")) && process.env.STORYBOOK_TEST_PORT !== undefined) {
  const value = process.env.STORYBOOK_TEST_PORT;
  if (!/^[1-9]\d*$/.test(value) || Number(value) < 1024 || Number(value) > 65535) {
    throw new Error("STORYBOOK_TEST_PORT는 1024~65535 범위의 정수여야 합니다.");
  }
  env.STORYBOOK_TEST_PORT = value;
}
const child = spawn(process.execPath, [...modes[mode], ...process.argv.slice(3)], {
  env,
  stdio: "inherit",
});
/** 실행이 끝나면 자식 프로세스의 종료 결과를 반환한다. */
function handleExit(code) {
  process.exitCode = code ?? 1;
}
child.on("exit", handleExit);
/** 사용자가 중단한 Storybook 프로세스를 함께 종료한다. */
function handleInterrupt() {
  child.kill("SIGINT");
}
process.on("SIGINT", handleInterrupt);
