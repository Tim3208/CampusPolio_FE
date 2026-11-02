import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { build } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = resolve(root, "src/app/globals.css");
const outputPath = resolve(root, "docs/ai/user-flow-standalone.html");
const componentPath = resolve(root, "src/widgets/user-flows/ui/user-flow-page.tsx");
const entryId = "virtual:campuspolio-user-flow-entry";
const resolvedEntryId = `\0${entryId}`;

/** 실제 검토 화면과 데이터를 단일 브라우저 스크립트로 묶는다. */
async function buildJavascript() {
  const result = await build({
    root,
    configFile: false,
    envDir: false,
    logLevel: "silent",
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    resolve: { alias: { "@": resolve(root, "src") }, dedupe: ["react", "react-dom"] },
    plugins: [{
      name: "campuspolio-user-flow-standalone-entry",
      /** 독립 화면을 구동하는 가상 진입점만 연결한다. */
      resolveId(id) {
        return id === entryId ? resolvedEntryId : null;
      },
      /** 실제 제품 컴포넌트를 독립 페이지의 루트에 렌더링한다. */
      load(id) {
        if (id !== resolvedEntryId) return null;
        return `import React from "react";
import { createRoot } from "react-dom/client";
import { UserFlowPage } from ${JSON.stringify(componentPath.replaceAll("\\", "/"))};
createRoot(document.getElementById("user-flow-root")).render(React.createElement(UserFlowPage));`;
      },
    }],
    build: {
      write: false,
      target: "es2020",
      rollupOptions: {
        input: entryId,
        output: { format: "iife", name: "CampusPolioUserFlow" },
      },
    },
  });

  if (Array.isArray(result)) throw new Error("독립형 화면에 예상하지 않은 빌드 결과가 생성되었습니다.");
  const chunks = result.output.filter((entry) => entry.type === "chunk");
  if (chunks.length !== 1 || result.output.some((entry) => entry.type === "asset")) {
    throw new Error("독립형 화면은 외부 파일이 없는 단일 스크립트여야 합니다.");
  }
  return { code: chunks[0].code, modules: chunks[0].modules };
}

/** 외부 웹폰트 요청을 빼고 기존 Tailwind 스타일을 단일 CSS로 만든다. */
async function buildStyles() {
  const source = await readFile(cssPath, "utf8");
  const withoutWebFont = source.replace(/^@import url\("https:\/\/cdn\.jsdelivr\.net\/gh\/orioncactus\/pretendard\/dist\/web\/static\/pretendard\.css"\);\s*/m, "");
  if (withoutWebFont === source) throw new Error("웹폰트 선언을 확인하지 못했습니다. 오프라인 스타일을 다시 점검하세요.");
  // 산출물 자체를 다시 스캔하지 않아야 동일한 소스에서 CSS가 계속 늘지 않는다.
  const restrictedSources = withoutWebFont.replace(
    '@import "tailwindcss";',
    '@import "tailwindcss" source(none);\n@source "../widgets/user-flows/ui/user-flow-page.tsx";\n@source "../shared/ui/button.tsx";\n@source inline("h-full antialiased min-h-screen");',
  );
  if (restrictedSources === withoutWebFont) throw new Error("Tailwind 진입점을 확인하지 못했습니다. 스타일 원본을 점검하세요.");
  const result = await postcss([tailwind({ base: root })]).process(restrictedSources, { from: cssPath });
  if (/@import\s+(?:url\()?\s*["']?https?:/i.test(result.css) || /url\(\s*["']?https?:/i.test(result.css)) {
    throw new Error("외부 스타일 리소스가 남아 있어 오프라인 파일을 만들 수 없습니다.");
  }
  return result.css;
}

/** 인라인 요소를 조기 종료할 수 있는 문자열을 안전하게 이스케이프한다. */
function escapeClosingTag(content, tag) {
  return content.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);
}

/** 번들에 포함된 npm 모듈 경로에서 실제 패키지 이름과 위치를 찾는다. */
function getPackageFromModule(moduleId) {
  const normalized = moduleId.replaceAll("\\", "/").split("?")[0];
  const marker = "/node_modules/";
  const index = normalized.lastIndexOf(marker);
  if (index < 0) return null;
  const parts = normalized.slice(index + marker.length).split("/");
  const packageName = parts[0].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  return { name: packageName, directory: `${normalized.slice(0, index + marker.length)}${packageName}`, sourcePath: normalized };
}

/** 포함된 패키지의 라이선스와 원본 파일의 저작권 고지를 HTML 안에 보존한다. */
async function buildLicenseNotices(modules) {
  const packages = new Map();
  for (const [id, info] of Object.entries(modules)) {
    if (typeof info.renderedLength !== "number") throw new Error("번들 모듈의 포함 여부를 확인하지 못했습니다.");
    if (!info.renderedLength) continue;
    const entry = getPackageFromModule(id);
    if (!entry) continue;
    const existing = packages.get(entry.directory) ?? { ...entry, sourcePaths: [] };
    existing.sourcePaths.push(entry.sourcePath);
    packages.set(entry.directory, existing);
  }
  if (!["react", "react-dom"].every((name) => [...packages.values()].some((entry) => entry.name === name))) {
    throw new Error("React 런타임 라이선스 대상을 확인하지 못했습니다.");
  }

  // 전역 CSS의 @import와 생성된 Rolldown 런타임도 결과물에 포함된다.
  for (const name of ["tailwindcss", "tw-animate-css", "shadcn", "rolldown"]) {
    const directory = resolve(root, "node_modules", name).replaceAll("\\", "/");
    if (!packages.has(directory)) packages.set(directory, { name, directory, sourcePaths: [] });
  }

  const notices = [];
  for (const entry of [...packages.values()].sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    const metadata = JSON.parse(await readFile(resolve(entry.directory, "package.json"), "utf8"));
    const filenames = (await readdir(entry.directory))
      .filter((filename) => /^(license|licence|copying|notice|third-party-license)(\.(md|txt))?$/i.test(filename))
      .sort();
    let fallback = "";
    if (filenames.length === 0 && entry.name === "@radix-ui/react-compose-refs") {
      // 해당 npm 패키지는 LICENSE가 빠져 있다. 같은 원본 저장소의 Slot 패키지에는 저장소 MIT 원문이 포함된다.
      const slotDirectory = resolve(root, "node_modules", "@radix-ui", "react-slot");
      const slotMetadata = JSON.parse(await readFile(resolve(slotDirectory, "package.json"), "utf8"));
      const slotLicense = await readFile(resolve(slotDirectory, "LICENSE"), "utf8");
      if (metadata.license !== "MIT" || metadata.repository?.url !== slotMetadata.repository?.url || !slotLicense.includes("Copyright (c) 2022 WorkOS")) {
        throw new Error("Radix 공통 라이선스의 출처를 확인하지 못했습니다.");
      }
      fallback = `저장소 공통 LICENSE (npm 패키지에 누락): ${metadata.repository.url}\n${slotLicense}`;
    }
    if (filenames.length === 0 && !fallback) throw new Error(`패키지 라이선스 파일을 찾을 수 없습니다: ${entry.name}`);

    const sections = await Promise.all(filenames.map(async (filename) => `${filename}\n${await readFile(resolve(entry.directory, filename), "utf8")}`));
    const headers = new Set();
    for (const sourcePath of entry.sourcePaths) {
      const source = await readFile(sourcePath, "utf8");
      const header = source.match(/^\s*\/\*[\s\S]*?\*\//)?.[0];
      if (header && /@license|copyright|licensed to you|spdx/i.test(header)) headers.add(header.trim());
    }
    notices.push(`## ${entry.name}@${metadata.version} (${metadata.license})\n\n${[...sections, fallback, ...headers].filter(Boolean).join("\n\n")}`);
  }
  return `이 파일에 포함된 제3자 소프트웨어의 라이선스와 저작권 고지입니다.\n\n${notices.join("\n\n---\n\n")}`;
}

/** 한 파일로 열 수 있도록 HTML, CSS, JavaScript를 저장한다. */
async function main() {
  const [javascript, styles] = await Promise.all([buildJavascript(), buildStyles()]);
  const notices = await buildLicenseNotices(javascript.modules);
  const html = `<!doctype html>
<html lang="ko" class="h-full antialiased">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>전체 유저 플로우 | CampusPolio</title>
<style>${escapeClosingTag(styles, "style")}</style>
</head>
<body class="min-h-screen">
<div id="user-flow-root"></div>
<noscript>유저 플로우를 보려면 브라우저에서 JavaScript를 허용해 주세요.</noscript>
<script type="text/plain" id="third-party-licenses">${escapeClosingTag(notices, "script")}</script>
<script>${escapeClosingTag(javascript.code, "script")}</script>
</body>
</html>
`;
  await writeFile(outputPath, html, "utf8");
  console.log(`서버 없이 열 수 있는 유저 플로우: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
