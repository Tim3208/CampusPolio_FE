/** 툴바 미리보기 폭이며 자동 테스트의 실제 browser viewport와는 별개다. */
export const campusViewports = Object.fromEntries(
  [360, 375, 768, 1024, 1280, 1440].map((width) => [
    `campus${width}`,
    { name: `CampusPolio ${width}px`, styles: { width: `${width}px`, height: "900px" }, type: width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop" },
  ]),
);
