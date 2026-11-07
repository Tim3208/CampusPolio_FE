import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { usePathname } from "@storybook/nextjs-vite/navigation.mock";
import { StrictMode as ReactStrictMode, useState, type ComponentProps, type ReactNode } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import {
  getAnalyticsScriptSources,
  resetAnalyticsScriptSources,
} from "../../../../.storybook/mocks/analytics-scenario";
import { GoogleAnalytics } from "./google-analytics";

type AnalyticsProps = ComponentProps<typeof GoogleAnalytics>;
const measurementId = "G-STORYBOOK42";
const initialLocation = "/projects?utm_source=campus_newsletter&keyword=student%40example.invalid#private-token";

/** 실제 Google 태그 대신 브라우저 큐에 쌓인 명령을 읽는다. */
function getCommands() {
  return (window.dataLayer ?? []).map(
    /** Google 태그의 Arguments 형식을 검사하기 쉬운 배열로 읽는다. */
    (command) => Array.from(command as ArrayLike<unknown>),
  );
}

/** 현재 큐에 기록된 페이지 조회 명령만 반환한다. */
function getPageViews() {
  return getCommands().filter(
    /** 다른 초기화 명령과 페이지 조회를 구분한다. */
    (command) => command[0] === "event" && command[1] === "page_view",
  );
}

/** 스토리의 전역 속성을 기존 descriptor로 돌리거나 새 속성을 제거한다. */
function restoreProperty(target: object, key: PropertyKey, previous: PropertyDescriptor | undefined) {
  if (previous) Object.defineProperty(target, key, previous);
  else Reflect.deleteProperty(target, key);
}

/** 수동 기록 확인과 경로 변경을 제공하며 실제 제품 분석 컴포넌트를 렌더링한다. */
function AnalyticsPreview({ args, strict = false, navigation = false }: { args: AnalyticsProps; strict?: boolean; navigation?: boolean }) {
  const [commands, setCommands] = useState<unknown[][]>([]);
  const [, setRouteVersion] = useState(0);

  /** 전송 없이 현재 브라우저 큐만 화면에 표시한다. */
  function refreshCommands() {
    setCommands(getCommands());
  }

  /** 라우터 mock과 브라우저 주소를 함께 바꾸어 제품 effect를 다시 실행한다. */
  function navigate(pathname: string) {
    window.history.replaceState(null, "", pathname);
    usePathname.mockReturnValue(pathname);
    setRouteVersion(/** 변경한 경로를 제품 컴포넌트에 다시 반영한다. */ (value) => value + 1);
  }

  const analytics = <GoogleAnalytics {...args} />;
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6 text-slate-950">
      <h1 className="text-2xl font-bold">방문 분석 미리보기</h1>
      <p>실제 분석 컴포넌트의 브라우저 큐를 확인합니다. Google로 전송하지 않습니다.</p>
      {strict ? <ReactStrictMode>{analytics}</ReactStrictMode> : analytics}
      <div className="flex flex-wrap gap-3">
        <PreviewButton onClick={refreshCommands}>수집 기록 확인</PreviewButton>
        {navigation ? <>
          <PreviewButton onClick={() => navigate("/projects/42")}>프로젝트 상세로 이동</PreviewButton>
          <PreviewButton onClick={() => navigate("/user-flows")}>개발 검토 화면으로 이동</PreviewButton>
          <PreviewButton onClick={() => navigate("/projects")}>탐색 화면으로 돌아가기</PreviewButton>
        </> : null}
      </div>
      <pre role="region" aria-label="수집 기록" tabIndex={0} className="max-h-96 overflow-auto rounded-lg bg-slate-100 p-4 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
        {JSON.stringify(commands, null, 2)}
      </pre>
    </main>
  );
}

/** 미리보기 전용 조작 버튼을 같은 스타일로 표시한다. */
function PreviewButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="rounded-md border border-slate-400 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">{children}</button>;
}

/** 기본 초기화와 단일 페이지 조회, 정리된 URL 및 광고 설정을 확인한다. */
async function assertInitialPageView(debugMode = false) {
  await waitFor(() => expect(getPageViews()).toHaveLength(1));
  const commands = getCommands();
  const configs = commands.filter((command) => command[0] === "config");
  await expect(configs).toHaveLength(1);
  await expect(configs[0]).toEqual([
    "config",
    measurementId,
    {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...(debugMode ? { debug_mode: true } : {}),
    },
  ]);
  const context = {
    page_location: `${window.location.origin}/projects?utm_source=campus_newsletter`,
    page_title: "프로젝트 탐색 | CampusPolio",
    page_referrer: "https://search.example.invalid/",
  };
  await expect(commands[1]).toEqual(["set", context]);
  await expect(getPageViews()[0]).toEqual(["event", "page_view", { ...context, send_to: measurementId }]);
  await expect(JSON.stringify(commands)).not.toMatch(/student|private-token|keyword/);
  await expect(Object.prototype.toString.call(window.dataLayer?.[0])).toBe("[object Arguments]");
  await expect(getAnalyticsScriptSources().length).toBeGreaterThan(0);
  await expect(getAnalyticsScriptSources().every((source) => source === `https://www.googletagmanager.com/gtag/js?id=${measurementId}`)).toBe(true);
  await expect(document.querySelector('script[src^="https://www.googletagmanager.com/"]')).toBeNull();
}

/** 수집이 꺼진 경우 Google 태그 로딩과 큐 초기화가 모두 없는지 확인한다. */
async function assertNoCollection() {
  await expect(getCommands()).toHaveLength(0);
  await expect(getAnalyticsScriptSources()).toHaveLength(0);
  await expect(window.gtag).toBeUndefined();
  await expect(document.querySelector('script[src^="https://www.googletagmanager.com/"]')).toBeNull();
}

const meta = {
  title: "Shared/Analytics/GoogleAnalytics",
  component: GoogleAnalytics,
  args: { measurementId, enabled: true, debugMode: false },
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/projects" } },
    analyticsLocation: initialLocation,
    docs: {
      story: { inline: false, height: 600 },
      description: { component: "실제 GoogleAnalytics의 조건부 초기화·정리된 페이지 조회·경로 이동을 검증합니다. 가상 측정 ID와 로컬 next/script 대체물을 사용하여 Google SDK를 다운로드하거나 데이터를 전송하지 않습니다. 브라우저 큐 검증이며 실제 GA 실시간 보고서 수신 성공을 뜻하지 않습니다." },
    },
  },
  /** 주소·분석 전역·referrer를 격리하고 스토리 종료 시 모두 복원한다. */
  beforeEach({ args, parameters }) {
    const originalLocation = window.location.href;
    const originalHistoryState = window.history.state;
    const dataLayer = Object.getOwnPropertyDescriptor(window, "dataLayer");
    const gtag = Object.getOwnPropertyDescriptor(window, "gtag");
    const referrer = Object.getOwnPropertyDescriptor(document, "referrer");
    const disableKey = `ga-disable-${args.measurementId}`;
    const disabled = Object.getOwnPropertyDescriptor(window, disableKey);
    delete window.dataLayer;
    delete window.gtag;
    Reflect.deleteProperty(window, disableKey);
    resetAnalyticsScriptSources();
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://search.example.invalid/profile/student?email=student%40example.invalid#private",
    });
    window.history.replaceState(null, "", parameters.analyticsLocation);
    // 첫 렌더부터 같은 구현을 사용해 경로 변경 시 React 훅 순서가 바뀌지 않게 한다.
    usePathname.mockReturnValue(parameters.nextjs.navigation.pathname);
    /** 다른 스토리에 가상 방문 주소·태그 상태·라우터 구현을 남기지 않는다. */
    return () => {
      window.history.replaceState(originalHistoryState, "", originalLocation);
      restoreProperty(window, "dataLayer", dataLayer);
      restoreProperty(window, "gtag", gtag);
      restoreProperty(document, "referrer", referrer);
      restoreProperty(window, disableKey, disabled);
      usePathname.mockRestore();
      resetAnalyticsScriptSources();
    };
  },
  /** 눈에 보이지 않는 제품 컴포넌트의 큐를 수동으로 확인할 화면을 제공한다. */
  render(args) { return <AnalyticsPreview args={args} />; },
} satisfies Meta<typeof GoogleAnalytics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** 정리된 첫 방문이 한 번 쌓이고 같은 경로의 재렌더로 중복되지 않는지 확인한다. */
  async play({ canvasElement }) {
    await assertInitialPageView();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "수집 기록 확인" }));
    await expect(getPageViews()).toHaveLength(1);
    await expect(within(canvasElement).getByLabelText("수집 기록")).toHaveTextContent("page_view");
    await userEvent.tab();
    await expect(within(canvasElement).getByRole("region", { name: "수집 기록" })).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { enabled: false },
  play: assertNoCollection,
};

export const MissingMeasurementId: Story = {
  args: { measurementId: "" },
  play: assertNoCollection,
};

export const InvalidMeasurementId: Story = {
  args: { measurementId: 'G-INVALID"><script>' },
  play: assertNoCollection,
};

export const ExcludedRoute: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/user-flows" } },
    analyticsLocation: "/user-flows#actions/private",
  },
  play: assertNoCollection,
};

export const UnknownRoute: Story = {
  parameters: {
    nextjs: { navigation: { pathname: "/unknown/private-student" } },
    analyticsLocation: "/unknown/private-student",
  },
  play: assertNoCollection,
};

export const DebugMode: Story = {
  args: { debugMode: true },
  /** 개발 수신 확인용 debug 설정이 명시했을 때만 들어가는지 확인한다. */
  async play() { await assertInitialPageView(true); },
};

export const StrictMode: Story = {
  /** 개발 모드의 StrictMode에서도 같은 제품 컴포넌트를 렌더링한다. */
  render(args) { return <AnalyticsPreview args={args} strict />; },
  /** 엄격 모드와 같은 경로의 재렌더에서도 초기화·페이지 조회가 한 번인지 확인한다. */
  async play({ canvasElement }) {
    await assertInitialPageView();
    await userEvent.click(within(canvasElement).getByRole("button", { name: "수집 기록 확인" }));
    await expect(getPageViews()).toHaveLength(1);
    await expect(getCommands().filter((command) => command[0] === "config")).toHaveLength(1);
  },
};

export const RouteTransitions: Story = {
  /** 실제 분석 effect를 유지하면서 라우터 경로를 바꿀 수 있게 한다. */
  render(args) { return <AnalyticsPreview args={args} navigation />; },
  /** 화면 이동·제외 경로·복귀가 중복 없이 반영되고 이전 페이지 정보가 정리되는지 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await assertInitialPageView();
    await userEvent.click(canvas.getByRole("button", { name: "프로젝트 상세로 이동" }));
    await waitFor(() => expect(getPageViews()).toHaveLength(2));
    await expect(getPageViews()[1][2]).toMatchObject({
      page_location: `${window.location.origin}/projects/42`,
      page_referrer: `${window.location.origin}/projects`,
      send_to: measurementId,
    });
    await userEvent.click(canvas.getByRole("button", { name: "개발 검토 화면으로 이동" }));
    await waitFor(() => expect(window[`ga-disable-${measurementId}`]).toBe(true));
    await expect(getPageViews()).toHaveLength(2);
    await userEvent.click(canvas.getByRole("button", { name: "탐색 화면으로 돌아가기" }));
    await waitFor(() => expect(getPageViews()).toHaveLength(3));
    await expect(window[`ga-disable-${measurementId}`]).toBe(false);
    await expect(getPageViews()[2][2]).toMatchObject({
      page_location: `${window.location.origin}/projects`,
      page_referrer: `${window.location.origin}/projects/42`,
    });
    await expect(getCommands().filter((command) => command[0] === "config")).toHaveLength(1);
    await userEvent.click(canvas.getByRole("button", { name: "수집 기록 확인" }));
  },
};
