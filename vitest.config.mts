import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { inspectVisualFonts } from "./tests/visual/browser-commands.mts";
import { getStorybookDefines, getStorybookTestPort, storybookEnvironment } from "./.storybook/environment.mts";

Object.assign(process.env, storybookEnvironment);
const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  envDir: false,
  define: getStorybookDefines(),
  test: {
    projects: [
      {
        extends: true,
        plugins: [storybookTest({ configDir: `${root}.storybook` })],
        test: {
          name: "storybook",
          setupFiles: [".storybook/vitest.setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            screenshotDirectory: "build/storybook-tests",
            api: { host: "127.0.0.1", port: getStorybookTestPort(), strictPort: true },
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: `${root}tests/visual` })],
        test: {
          name: "visual",
          root,
          setupFiles: [".storybook/visual.setup.ts"],
          fileParallelism: false,
          testTimeout: 30000,
          attachmentsDir: "build/visual/attachments",
          browser: {
            commands: { inspectVisualFonts },
            enabled: true,
            headless: true,
            screenshotDirectory: "build/visual/failures",
            api: { host: "127.0.0.1", port: process.env.STORYBOOK_TEST_PORT === undefined ? 6221 : getStorybookTestPort(), strictPort: true, allowWrite: true },
            provider: playwright({ contextOptions: { viewport: { width: 1600, height: 2000 }, deviceScaleFactor: 1, locale: "ko-KR", timezoneId: "Asia/Seoul", reducedMotion: "reduce", colorScheme: "light" } }),
            instances: [{ browser: "chromium" }],
            expect: { toMatchScreenshot: {
              comparatorOptions: { threshold: 0, allowedMismatchedPixels: 0, includeAA: true },
              screenshotOptions: { animations: "disabled", caret: "hide", scale: "css" },
              /** 플랫폼별 기준 파일만 읽거나 명시적 갱신으로 쓴다. */
              resolveScreenshotPath: ({ root, platform, arg, ext }) => resolve(root, "tests/visual/baselines", platform, `${arg}${ext}`),
              /** 실제 차이는 기준과 분리된 빌드 산출물에 보관한다. */
              resolveDiffPath: ({ root, platform, arg, ext }) => resolve(root, "build/visual/diffs", platform, `${arg}${ext}`),
            } },
          },
        },
      },
    ],
  },
});
