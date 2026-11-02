import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { useEffect, useState } from "react";
import { publicEnv } from "@/shared/config";
import { ScenarioControls, useScenarioReset } from "../../../../../.storybook/scenario-controls";
import { GoogleSignInButton } from "./google-sign-in-button";
import { fakeCredential, googleScenarios, type GoogleStoryArgs } from "./google-sign-in-button.story-fixtures";
import { cleanupGoogleStory, googleHandlers, googleRequests, releaseGoogleResponse, sdkObservations, setupGoogleStory } from "./google-sign-in-button.story-helpers";

/** 가상 SDK와 제품 인스턴스를 명시적인 초기화에만 다시 만든다. */
function GooglePlayground(args: GoogleStoryArgs) {
  const { instanceKey, reset } = useScenarioReset();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setupGoogleStory(args.scenario);
    let active = true;
    // 외부 SDK 준비가 끝난 microtask에서만 제품을 마운트한다.
    queueMicrotask(() => { if (active) setMounted(true); });
    return () => { active = false; cleanupGoogleStory(); };
  }, [args.scenario, instanceKey]);
  /** 이전 제품을 내린 뒤 공통 singleton과 응답을 초기화한다. */
  function handleReset() { setMounted(false); reset(); }
  return <section className="mx-auto max-w-md p-6" aria-label="Google 로그인 로컬 시나리오">
    <ScenarioControls onReset={handleReset}>
      <button type="button" onClick={releaseGoogleResponse}>대기 응답 완료</button>
    </ScenarioControls>
    <p className="mb-4 text-sm text-slate-700">로컬 SDK double입니다. 실제 Google 로그인과 세션을 만들지 않습니다.</p>
    {mounted && <GoogleSignInButton key={instanceKey} nextPath={args.nextPath} />}
  </section>;
}

const meta = {
  title: "Features/Auth/GoogleSignInButton",
  component: GoogleSignInButton,
  args: { nextPath: "/projects/new", scenario: "ready" },
  argTypes: {
    nextPath: { control: "text", description: "제품이 받는 안전한 내부 이동 경로. 라우터 mock 호출만 관찰합니다." },
    scenario: { control: "select", options: googleScenarios, description: "가상 client ID와 로컬 SDK/응답. 외부 요청은 하지 않습니다." },
  },
  parameters: {
    layout: "padded",
    msw: { handlers: googleHandlers },
    docs: { story: { inline: false, height: 320 }, description: { component: "실제 GoogleSignInButton을 승인된 Storybook 전용 설정/Script mock으로 렌더링합니다. Playground는 자동 클릭하지 않습니다. 고정 스토리의 play는 Canvas/Vitest에서 클릭/라우터 호출을 검사합니다. Docs에서는 포커스 간섭을 막기 위해 자동 play를 생략하며 각 iframe의 수동 버튼 조작으로 응답을 확인합니다. Docs는 전역 SDK와 MSW가 섞이지 않도록 iframe별로 격리합니다. 실제 OAuth·메일·backend·세션은 검증하지 않습니다." } },
  },
  /** 전역 SDK, callback, 요청 횟수와 모듈 singleton을 매 스토리마다 초기화한다. */
  beforeEach({ args }) { setupGoogleStory(args.scenario); return cleanupGoogleStory; },
  /** 실제 제품 버튼을 정해진 폭 안에서 보여준다. */
  render(args) { return <div className="mx-auto max-w-md p-6"><GoogleSignInButton nextPath={args.nextPath} /></div>; },
} satisfies Meta<GoogleStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 실제 Docs 부모 iframe에서만 자동 조작을 생략하고 수동 예제로 제공한다. */
function isDocsExample() {
  if (window.parent === window) return false;
  try {
    const query = new URLSearchParams(window.parent.location.search);
    return query.get("viewMode") === "docs" || (query.get("path")?.startsWith("/docs/") ?? false);
  } catch { return false; }
}


/** 로컬 버튼을 누르고 wire payload를 확인한다. */
async function submitGoogle(canvasElement: HTMLElement) {
  await userEvent.click(await within(canvasElement).findByRole("button", { name: "가상 Google 계정으로 계속" }));
  await waitFor(() => expect(googleRequests).toEqual([{ method: "POST", path: "/api/auth/login", query: "", body: { idToken: fakeCredential } }]));
  expect(sdkObservations.initialized).toBe(1);
  expect(sdkObservations.clientId).toBe("storybook-only.invalid.apps.googleusercontent.com");
}

export const Playground: Story = {
  /** 자동 클릭 없이 시나리오/경로 Controls와 명시적 reset을 제공한다. */
  render: (args) => <GooglePlayground key={args.scenario} {...args} />,
};
export const MissingConfiguration: Story = {
  parameters: { a11y: { test: "todo" }, docs: { description: { story: "color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다." } } },
  args: { scenario: "missing" },
  /** 설정 누락 안내와 실제 로그인 요청 부재를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    expect(await within(canvasElement).findByText("Google Client ID 환경변수가 설정되지 않았습니다.")).toBeVisible();
    expect(publicEnv.googleClientId).toBe("");
    expect(googleRequests).toHaveLength(0);
  },
};
export const SdkWaiting: Story = {
  args: { scenario: "waiting" },
  /** 설정은 있지만 SDK를 기다리는 기존 빈 버튼 영역을 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    expect(within(canvasElement).queryByRole("button")).toBeNull();
    expect(canvasElement.querySelector("[aria-busy]")).toHaveAttribute("aria-busy", "false");
    expect(publicEnv.googleClientId).toBe("storybook-only.invalid.apps.googleusercontent.com");
    expect(googleRequests).toHaveLength(0);
  },
};
export const ScriptFailure: Story = {
  parameters: { a11y: { test: "todo" }, docs: { description: { story: "color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다." } } },
  args: { scenario: "script-error" },
  /** 로컬 Script 오류 callback의 제품 안내를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    expect(await within(canvasElement).findByText("Google 로그인 스크립트를 불러오지 못했습니다.")).toBeVisible();
    expect(googleRequests).toHaveLength(0);
  },
};
export const MissingCredential: Story = {
  parameters: { a11y: { test: "todo" }, docs: { description: { story: "color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다." } } },
  args: { scenario: "no-credential" },
  /** credential 없는 callback은 API를 호출하지 않는지 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "가상 Google 계정으로 계속" }));
    expect(await canvas.findByText("Google 인증 정보를 받지 못했습니다.")).toBeVisible();
    expect(googleRequests).toHaveLength(0);
  },
};
export const Processing: Story = {
  args: { scenario: "pending" },
  /** 제어된 응답 대기 동안 실제 처리 UI를 남긴다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await submitGoogle(canvasElement);
    expect(await within(canvasElement).findByText("로그인 처리 중입니다.")).toBeVisible();
    expect(canvasElement.querySelector("[aria-busy]")).toHaveAttribute("aria-busy", "true");
    expect(getRouter().push).not.toHaveBeenCalled();
  },
};
export const BadRequest: Story = {
  parameters: { a11y: { test: "todo" }, docs: { description: { story: "color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다." } } },
  args: { scenario: "bad-request" },
  /** 400 오류의 기존 안내를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return; await submitGoogle(canvasElement); expect(await within(canvasElement).findByText("로그인 요청이 올바르지 않습니다. 다시 시도해 주세요.")).toBeVisible(); },
};
export const Unauthorized: Story = {
  parameters: { a11y: { test: "todo" }, docs: { description: { story: "color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다." } } },
  args: { scenario: "unauthorized" },
  /** 401 오류의 기존 안내를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return; await submitGoogle(canvasElement); expect(await within(canvasElement).findByText("Google 인증에 실패했습니다. 계정을 다시 선택해 주세요.")).toBeVisible(); },
};
export const ServerFailure: Story = {
  parameters: { a11y: { test: "todo" }, docs: { description: { story: "color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다." } } },
  args: { scenario: "server-error" },
  /** 서버 실패 뒤 재시도 버튼과 처리 상태 복귀를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await submitGoogle(canvasElement);
    expect(await within(canvasElement).findByText("서버 오류로 로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.")).toBeVisible();
    expect(canvasElement.querySelector("[aria-busy]")).toHaveAttribute("aria-busy", "false");
    expect(getRouter().push).not.toHaveBeenCalled();
  },
};
export const VerifiedSuccess: Story = {
  args: { scenario: "verified" },
  /** 인증된 가상 응답이 next 경로와 refresh를 한 번 호출하는지 확인한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return;
    await submitGoogle(canvasElement);
    await waitFor(() => expect(getRouter().push).toHaveBeenCalledWith(args.nextPath));
    expect(getRouter().push).toHaveBeenCalledTimes(1);
    expect(getRouter().refresh).toHaveBeenCalledTimes(1);
  },
};
export const NeedsSchoolVerification: Story = {
  args: { scenario: "unverified" },
  /** 미인증 사용자와 보호 경로 조합은 이메일 인증 경로로 이동한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return;
    await submitGoogle(canvasElement);
    await waitFor(() => expect(getRouter().push).toHaveBeenCalledWith("/verify-email?" + new URLSearchParams({ next: args.nextPath })));
    expect(getRouter().push).toHaveBeenCalledTimes(1);
    expect(getRouter().refresh).not.toHaveBeenCalled();
  },
};
export const UnverifiedPublicPath: Story = {
  args: { scenario: "unverified", nextPath: "/projects" },
  /** 인증이 필요 없는 경로는 미인증 응답에서도 원래 next로 이동한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return;
    await submitGoogle(canvasElement);
    await waitFor(() => expect(getRouter().push).toHaveBeenCalledWith(args.nextPath));
    expect(getRouter().push).toHaveBeenCalledTimes(1);
    expect(getRouter().refresh).toHaveBeenCalledTimes(1);
  },
};

