import type { StorybookConfig } from "@storybook/nextjs-vite";
import { fileURLToPath } from "node:url";
import { getStorybookDefines, storybookEnvironment } from "./environment.mts";

Object.assign(process.env, storybookEnvironment);

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-vitest", "@storybook/addon-docs", "@storybook/addon-a11y", "msw-storybook-addon"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: { nextConfigPath: fileURLToPath(new URL("./next.config.mjs", import.meta.url)) },
  },
  staticDirs: ["../public", { from: "./public", to: "/" }],
  core: { disableTelemetry: true },
  /** 개인 환경 파일을 읽지 않고 앱 공개 설정을 고정한다. */
  async viteFinal(config) {
    /** Storybook 전용 모듈 mock의 절대 경로를 만든다. */
    const mockPath = (name: string) => fileURLToPath(new URL(`./mocks/${name}`, import.meta.url)).replaceAll("\\", "/");
    return {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        {
          name: "campuspolio-storybook-auth-boundary",
          enforce: "pre" as const,
          /** Storybook에서만 공개 환경 모듈을 안전한 시나리오 설정으로 교체한다. */
          resolveId(source: string, importer?: string) {
            if (source === "./env" && importer?.replaceAll("\\", "/").endsWith("/src/shared/config/index.ts")) {
              return mockPath("public-env.ts");
            }
          },
          /** 제품 파일을 수정하지 않고 인증 모듈의 singleton 정리 계약을 연결한다. */
          transform(source: string, id: string) {
            if (!id.split("?")[0].replaceAll("\\", "/").endsWith("/src/features/auth/google-sign-in/ui/google-sign-in-button.tsx")) return;
            return `import { registerGoogleModuleReset } from ${JSON.stringify(mockPath("google-scenario.ts"))};\n${source}\nregisterGoogleModuleReset(/** 다음 스토리에 인증 콜백과 초기화 ID를 남기지 않는다. */ () => { googleCredentialHandler = null; initializedGoogleClientId = null; });`;
          },
        },
      ],
      resolve: {
        ...config.resolve,
        alias: [
          { find: /^next\/script(?:\.js)?$/, replacement: mockPath("next-script.tsx") },
          ...(Array.isArray(config.resolve?.alias) ? config.resolve.alias : Object.entries(config.resolve?.alias ?? {}).map(([find, replacement]) => ({ find, replacement }))),
        ],
      },
      // 스토리의 지연 import가 테스트 도중 재최적화와 새로고침을 일으키지 않게 한다.
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          "lucide-react",
          "next/link",
          "react-markdown",
          "remark-gfm",
        ],
      },
      envDir: false,
      envPrefix: [],
      define: { ...config.define, ...getStorybookDefines() },
    };
  },
};

export default config;
