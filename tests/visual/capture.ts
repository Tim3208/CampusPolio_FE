import { expect } from "vitest";
import { page, commands } from "vitest/browser";
import type {} from "./browser-commands.mts";
import manifest from "./manifest.json";
/** 실제 자동 실행 폭을 Storybook addon viewport 계약으로 지정한다. */
export function viewport(width: number, height = 900) {
  return { globals: { viewport: { value: "visual", isRotated: false } },
    parameters: { viewport: { options: { visual: { name: `Visual ${width}`, styles: { width: `${width}px`, height: `${height}px` }, type: width < 768 ? "mobile" : "desktop" } } } } };
}
export const visualViewport = viewport(1280);
/** 실제 글꼴과 이미지가 준비된 제품 body 및 portal을 비교한다. */
export async function capture(id: string) {
  const scenario = manifest.cases.find((entry) => entry.storyId === id);
  expect(scenario, "manifest에 등록된 상태만 비교한다").toBeDefined();
  expect([innerWidth, innerHeight]).toEqual([scenario!.viewport.width, scenario!.viewport.height]);
  expect(devicePixelRatio).toBe(1);
  const iframeScale = window.frameElement?.parentElement?.getAttribute("data-scale");
  expect(iframeScale, "바깥 Vitest 페이지가 제품 iframe을 축소하면 안 된다").toBe("1");
  expect(navigator.language).toBe("ko-KR");
  expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("Asia/Seoul");
  expect(navigator.userAgent).toContain("HeadlessChrome/156.0.8078.4");
  for (let weight = 100; weight <= 900; weight += 100) {
    const faces = await document.fonts.load(`${weight} 16px Pretendard`, "캠퍼스 프로젝트 가나다 ABC 0123");
    expect(faces.length).toBeGreaterThan(0);
    expect(faces.every((face) => face.status === "loaded" && face.family.replaceAll('"', "").replaceAll("'", "") === "Pretendard")).toBe(true);
  }
  await document.fonts.ready;
  const productText = [...document.querySelectorAll<HTMLElement>("h1,h2,h3,p,button,a,span")]
    .filter((element) => /[가-힣]/.test([...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join("")) && element.getBoundingClientRect().width > 0 && !element.closest("pre,code"))
    .slice(0, 12);
  const productTypography = productText.map((element, index) => {
    element.setAttribute("data-visual-font-probe", `product-${index}`);
    const style = getComputedStyle(element);
    return { probe: `product-${index}`, text: element.textContent, fontFamily: style.fontFamily, fontWeight: style.fontWeight };
  });
  const renderedFonts = await commands.inspectVisualFonts();
  await commands.writeFile(`build/visual/current/${id}-font-probe.json`, JSON.stringify({ productTypography, renderedFonts }, null, 2));
  expect(renderedFonts.length).toBeGreaterThan(0);
  expect(renderedFonts.every((entry) => entry.fonts.some((font) => font.isCustomFont && font.postScriptName.startsWith("Pretendard-") && font.glyphCount > 0))).toBe(true);
  await Promise.all([...document.images].map(/** 현재 이미지의 로드 또는 실패 완료를 기다린다. */ (img) => img.complete ? Promise.resolve() : new Promise<void>((resolve) => { img.addEventListener("load", () => resolve(), { once: true }); img.addEventListener("error", () => resolve(), { once: true }); })));
  window.scrollTo(0, 0);
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  expect(document.documentElement.scrollHeight, "iframe 아래로 잘리는 콘텐츠가 없어야 한다").toBeLessThanOrEqual(innerHeight + 1);
  await page.screenshot({ path: `../../../build/visual/current/${id}.png`, save: true });
  await commands.writeFile(`build/visual/current/${id}.json`, JSON.stringify({
    id, width: innerWidth, height: innerHeight, deviceScaleFactor: devicePixelRatio,
    iframeScale, outerViewport: [parent.innerWidth, parent.innerHeight],
    language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    userAgent: navigator.userAgent, fixtureDate: new Date().toISOString(),
    fontFamily: getComputedStyle(document.body).fontFamily,
    fontFaces: [...document.fonts].map((face) => ({ family: face.family, weight: face.weight, status: face.status })),
    scrollWidth: document.documentElement.scrollWidth,
    bodyHeight: document.body.getBoundingClientRect().height,
    scrollHeight: document.documentElement.scrollHeight,
    resources: performance.getEntriesByType("resource").map((entry) => entry.name),
    capture: "body including portals",
    productTypography, renderedFonts,
  }, null, 2));
  // Locator 경로는 Vitest의 screenshot 단일 assertion을 사용해 실패를 재시도로 숨기지 않는다.
  await expect.element(page.elementLocator(document.body)).toMatchScreenshot(id);
  if (id === "widgets-home-projectcard--normal") await captureFontSpecimen();
}

/** 제품 기준과 별개로 각 실제 폰트의 한국어·숫자·문장부호 렌더 증거를 남긴다. */
async function captureFontSpecimen() {
  const specimen = document.createElement("section");
  specimen.style.cssText = "width:1000px;padding:24px;background:white;color:#111;position:relative;font-family:Pretendard";
  document.body.append(specimen);
  const observations = [];
  try {
    for (let weight = 100; weight <= 900; weight += 100) {
      const line = document.createElement("div");
      line.style.cssText = `font-family:Pretendard;font-weight:${weight};font-size:28px;line-height:1.6`;
      line.textContent = `${weight} 캠퍼스 프로젝트 가상 제작팀 · 가나다 ABC 0123456789 !?()`;
      specimen.append(line);
      line.setAttribute("data-visual-font-probe", `specimen-${weight}`);
      const face = [...document.fonts].find((item) => item.family === "Pretendard" && item.weight === String(weight));
      expect(face?.status).toBe("loaded");
      observations.push({ weight, fontFamily: getComputedStyle(line).fontFamily, fontFaceStatus: face?.status, text: line.textContent });
    }
    await page.elementLocator(specimen).screenshot({ path: "../../../build/visual/current/font-specimen.png", save: true });
    const renderedFonts = (await commands.inspectVisualFonts()).filter((entry) => entry.probe.startsWith("specimen-"));
    await commands.writeFile("build/visual/current/font-specimen.json", JSON.stringify({ observations, renderedFonts }, null, 2));
    expect(renderedFonts).toHaveLength(9);
    expect(renderedFonts.every((entry) => entry.fonts.some((font) => font.isCustomFont && font.postScriptName.startsWith("Pretendard-") && font.glyphCount > 0))).toBe(true);
  } finally { specimen.remove(); }
}

