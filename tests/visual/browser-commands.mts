import type { BrowserCommandContext } from "vitest/node";
export type FontUsage = { familyName: string; postScriptName: string; isCustomFont: boolean; glyphCount: number };
export type RenderedFont = { probe: string; fonts: FontUsage[] };
declare module "vitest/browser" { interface BrowserCommands { inspectVisualFonts: () => Promise<RenderedFont[]>; } }
/** Chromium이 실제 글리프에 사용한 폰트를 읽기 전용 CDP로 관찰한다. */
export async function inspectVisualFonts(context: BrowserCommandContext): Promise<RenderedFont[]> {
  const session = await context.context.newCDPSession(context.page);
  try {
    await session.send("DOM.enable");
    await session.send("CSS.enable");
    const result = await session.send("DOM.getFlattenedDocument", { depth: -1, pierce: true });
    const observations: RenderedFont[] = [];
    for (const node of result.nodes) {
      const index = node.attributes?.indexOf("data-visual-font-probe") ?? -1;
      if (index < 0) continue;
      const usage = await session.send("CSS.getPlatformFontsForNode", { nodeId: node.nodeId });
      observations.push({ probe: node.attributes![index + 1], fonts: usage.fonts });
    }
    return observations;
  } finally { await session.detach(); }
}

