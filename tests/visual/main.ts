import type { StorybookConfig } from "@storybook/nextjs-vite";
import { fileURLToPath } from "node:url";
import original from "../../.storybook/main.ts";
const config: StorybookConfig = {
  ...original,
  stories: ["./stories/*.stories.tsx"],
  staticDirs: [
    fileURLToPath(new URL("../../public", import.meta.url)),
    { from: fileURLToPath(new URL("../../.storybook/public", import.meta.url)), to: "/" },
  ],
  /** 기존 Next/MSW 환경을 유지하고 시각 검사에서만 외부 폰트 import를 제거한다. */
  async viteFinal(config, options) {
    const inherited = await original.viteFinal!(config, options);
    return {
      ...inherited,
      root: fileURLToPath(new URL("../../", import.meta.url)),
      plugins: [...(inherited.plugins ?? []), {
        name: "campuspolio-visual-local-fonts",
        enforce: "pre" as const,
        /** 앱 원본은 바꾸지 않고 검증한 로컬 폰트만 사용한다. */
        transform(source: string, id: string) {
          if (!id.split("?")[0].replaceAll("\\", "/").endsWith("/src/app/globals.css")) return;
          const cdn = '@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");';
          if (!source.includes(cdn)) throw new Error("앱 폰트 계약이 바뀌었습니다. 로컬 바이트를 다시 확인하세요.");
          return source.replace(cdn, "");
        },
      }],
    };
  },
};
export default config;

