import type { Preview } from "@storybook/nextjs-vite";
import { mswLoader } from "msw-storybook-addon/csf3";
import "../src/app/globals.css";
import { assertNoUnhandledApiRequests, createMockWorker, resetStoryState, storyA11yLimitations } from "./test-support";
import { campusViewports } from "./viewports";
import { resetGoogleScenario } from "./mocks/google-scenario";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    nextjs: { appDirectory: true },
    viewport: { options: campusViewports },
    a11y: { test: "error" },
    docs: { toc: true },
  },
  loaders: [mswLoader(createMockWorker)],
  /** 앱과 같은 한국어, 글꼴 및 antialiasing 환경을 준비한다. */
  beforeEach(context) {
    document.documentElement.lang = "ko";
    document.documentElement.classList.add("h-full", "antialiased");
    document.body.classList.add("min-h-screen");
    resetStoryState();
    resetGoogleScenario();
    const limitation = storyA11yLimitations[context.id];
    if (limitation) {
      context.parameters.a11y = { ...context.parameters.a11y, test: "todo" };
      context.parameters.docs = {
        ...context.parameters.docs,
        description: {
          ...context.parameters.docs?.description,
          story: `${context.parameters.docs?.description?.story ?? ""}\n\n접근성 미완료(todo): ${limitation}`,
        },
      };
    }
    return resetGoogleScenario;
  },
  afterEach: assertNoUnhandledApiRequests,
};

export default preview;
