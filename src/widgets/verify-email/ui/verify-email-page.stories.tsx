import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StrictMode, useLayoutEffect } from "react";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ScenarioControls, useScenarioReset } from "../../../../.storybook/scenario-controls";
import { VerifyEmailPage } from "./verify-email-page";
import { emailScenarios, schoolEmail, verificationCode, type EmailStoryArgs } from "./verify-email-page.story-fixtures";
import { expectEmailAccessibility, expectEmailDigits, repeatEmailAction, advanceEmailSeconds, cleanupEmailScenario, emailHandlers, emailLoginPath, emailRequests, expectEmailRequest, installEmailClock, pasteEmailCode, releaseEmailResponse, resetEmailScenario, sendEmailFromCanvas } from "./verify-email-page.story-helpers";

/** 수동 입력과 제어된 countdown·응답·초기화만 제공하며 자동으로 발송하지 않는다. */
function EmailPlayground(args: EmailStoryArgs) {
  const { instanceKey, reset } = useScenarioReset();
  useLayoutEffect(() => { resetEmailScenario(args.scenario); }, [args.scenario]);
  /** 입력 중에는 유지하고 명시적인 초기화에서만 제품 인스턴스를 바꾼다. */
  function handleReset() { resetEmailScenario(args.scenario); reset(); }
  return <div>
    <ScenarioControls onReset={handleReset}>
      <button type="button" onClick={() => void advanceEmailSeconds(179)}>179초 진행</button>
      <button type="button" onClick={() => void advanceEmailSeconds(1)}>1초 진행</button>
      <button type="button" onClick={releaseEmailResponse}>대기 응답 완료</button>
    </ScenarioControls>
    <VerifyEmailPage key={instanceKey} nextPath={args.nextPath} />
  </div>;
}

const meta = {
  title: "Widgets/VerifyEmail/VerifyEmailPage",
  component: VerifyEmailPage,
  args: { nextPath: "/projects/new", scenario: "ready" },
  argTypes: {
    nextPath: { control: "text", description: "인증 후 이동할 안전한 앱 경로. 실제 이동 대신 router mock을 검사합니다." },
    scenario: { control: "select", options: emailScenarios, description: "GET 사용자 및 이메일 API의 로컬 응답 시나리오" },
  },
  parameters: {
    layout: "fullscreen",
    msw: { handlers: emailHandlers },
    docs: { story: { inline: false, height: 820 }, description: { component: "실제 인증 화면과 fetch→MSW 요청을 사용합니다. 제품 180초 countdown의 1초 interval만 수동 tick으로 제어하고 다른 브라우저/React/MSW 타이머는 유지합니다. Playground는 발송/검증을 자동 실행하지 않습니다. 시나리오 Controls 변경과 reset은 새 상태로 시작합니다. Docs는 iframe별 수동 예제이며 자동 play를 실행하지 않습니다. 발송·인증·타이머 확인은 Playground를 수동 조작하고 고정 자동 검증은 Canvas/Vitest에서 실행합니다. GET /api/users/me 명세에는 required userId가 있지만 현 client는 생략합니다. 이 차이를 유지하며 실제 서버 수용·메일·세션 성공을 주장하지 않습니다." } },
  },
  /** 각 스토리에서 요청·대기 응답·countdown을 독립적으로 준비한다. */
  beforeEach({ args }) { resetEmailScenario(args.scenario); installEmailClock(); return cleanupEmailScenario; },
  /** 제품 UI만 렌더링하고 테스트용 props를 추가하지 않는다. */
  render: (args) => <VerifyEmailPage nextPath={args.nextPath} />,
} satisfies Meta<EmailStoryArgs>;
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


/** 실제 발송 뒤 03:00과 정확한 POST 계약을 확인한다. */
async function enterCodeStep(canvasElement: HTMLElement) {
  await sendEmailFromCanvas(canvasElement);
  expect(await within(canvasElement).findByText("03:00")).toBeVisible();
  await expectEmailRequest("send", { email: schoolEmail });
}

export const Playground: Story = {
  parameters: { a11y: { test: "error" } },
  /** 시나리오 선택만 새 인스턴스로 만들고 일반 입력에는 focus를 유지한다. */
  render: (args) => <EmailPlayground key={args.scenario} {...args} />,
};
export const EmailValidation: Story = {
  parameters: { a11y: { test: "error" } },
  /** 무효/유효 도메인·공백 trim·연속 입력 focus·발송 JSON을 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    const email = canvas.getByLabelText("UNIVERSITY EMAIL");
    const send = canvas.getByRole("button", { name: "코드 전송" });
    await waitFor(() => expect(email).toBeEnabled());
    expect(send).toBeDisabled();
    await userEvent.type(email, "person@example.invalid");
    expect(email).toHaveFocus();
    expect(send).toBeDisabled();
    await userEvent.clear(email);
    await userEvent.type(email, "  " + schoolEmail + "  ");
    expect(email).toHaveFocus();
    expect(send).toBeEnabled();
    await userEvent.click(send);
    await expectEmailRequest("send", { email: schoolEmail });
    expect(await canvas.findByText("03:00")).toBeVisible();
    expect(email).toHaveValue(schoolEmail);
  },
};
export const UserLoading: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-pending" },
  /** 사용자 조회 중 기존 disabled 화면을 표시한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await waitFor(() => expect(emailRequests).toHaveLength(1));
    expect(within(canvasElement).getByLabelText("UNIVERSITY EMAIL")).toBeDisabled();
    expect(emailRequests[0]).toEqual({ method: "GET", path: "/api/users/me", query: "", body: null });
  },
};
export const SignedOut: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "signed-out" },
  /** 401 응답은 인증 화면을 next로 감싼 로그인 경로를 사용한다. */
  async play({ args }) {
    if (isDocsExample()) return; await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1)); await waitFor(() => expect(getRouter().replace).toHaveBeenCalledWith(emailLoginPath(args.nextPath))); },
};
export const AlreadyVerified: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "already-verified" },
  /** 이미 인증된 사용자 응답은 원래 next로 이동한다. */
  async play({ args }) {
    if (isDocsExample()) return; await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1)); await waitFor(() => expect(getRouter().replace).toHaveBeenCalledWith(args.nextPath)); },
};
export const UserFailure: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-error" },
  /** 사용자 조회 오류 표시와 요청 불가능 상태를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    expect(await within(canvasElement).findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    expect(within(canvasElement).getByRole("button", { name: "코드 전송" })).toBeDisabled();
  },
};
export const SendPending: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "send-pending" },
  /** 발송 지연 동안 입력·submit을 잠그는 현재 UI를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await sendEmailFromCanvas(canvasElement);
    await expectEmailRequest("send", { email: schoolEmail });
    expect(within(canvasElement).getByLabelText("UNIVERSITY EMAIL")).toBeDisabled();
    const send = within(canvasElement).getByRole("button", { name: "코드 전송" });
    expect(send).toBeDisabled();
    expect(send).toHaveAttribute("aria-busy", "true");
    expect(send.querySelector("svg")).not.toBeNull();
    repeatEmailAction(canvasElement, send);
    await userEvent.keyboard("{Enter}{Enter}");
    await expectEmailRequest("send", { email: schoolEmail });
    expect(emailRequests.filter((item) => item.method === "POST")).toHaveLength(1);
    await expectEmailAccessibility(canvasElement);
  },
};
export const SendFailure: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "send-error" },
  /** 발송 실패 이후 입력 보존과 재시도를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await sendEmailFromCanvas(canvasElement);
    expect(await within(canvasElement).findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    expect(within(canvasElement).getByLabelText("UNIVERSITY EMAIL")).toHaveValue(schoolEmail);
    const email = within(canvasElement).getByLabelText("UNIVERSITY EMAIL");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(/요청을 처리하지 못했습니다/);
    await expectEmailAccessibility(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "코드 전송" }));
    await expectEmailRequest("send", { email: schoolEmail }, 2);
    expect(await within(canvasElement).findByText("03:00")).toBeVisible();
  },
};
export const SendUnauthorized: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "send-unauthorized" },
  /** 발송 401도 현재 next를 보존하여 로그인으로 이동한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return; await sendEmailFromCanvas(canvasElement); await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1)); await waitFor(() => expect(getRouter().replace).toHaveBeenCalledWith(emailLoginPath(args.nextPath))); },
};
export const CodeKeyboard: Story = {
  parameters: { a11y: { test: "error" } },
  /** 숫자 입력·비숫자 제거·Backspace·좌우 이동·붙여넣기와 6자리 활성화를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    await enterCodeStep(canvasElement);
    const first = canvas.getByLabelText("1번째 인증번호");
    const second = canvas.getByLabelText("2번째 인증번호");
    await userEvent.click(first);
    await userEvent.keyboard("a");
    expect(first).toHaveValue("");
    await userEvent.keyboard("1");
    expect(first).toHaveValue("1");
    expect(second).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(second).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    expect(first).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    expect(first).toHaveValue("");
    expect(canvas.getByRole("button", { name: "인증 확인" })).toBeDisabled();
    await pasteEmailCode(canvasElement);
    for (let index = 0; index < 6; index++) expect(canvas.getByLabelText(`${index + 1}번째 인증번호`)).toHaveValue(verificationCode[index]);
    expect(canvas.getByLabelText("6번째 인증번호")).toHaveFocus();
    expect(canvas.getByRole("button", { name: "인증 확인" })).toBeEnabled();
    await userEvent.tab();
    expect(canvas.getByRole("button", { name: "인증 확인" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(canvas.getByLabelText("6번째 인증번호")).toHaveFocus();
    const third = canvas.getByLabelText("3번째 인증번호");
    const data = new DataTransfer();
    data.setData("text", "98a7654");
    third.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }));
    await waitFor(() => expectEmailDigits(canvasElement, "129876"));
    expect(canvas.getByLabelText("6번째 인증번호")).toHaveFocus();
  },
};
export const TimerAndResend: Story = {
  parameters: { a11y: { test: "error" } },
  /** 180→1→0 경계·만료 검증 차단·재전송 후 코드와 03:00 초기화를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    const resend = canvas.getByRole("button", { name: "이메일이 오지 않았나요?" });
    expect(resend).toBeDisabled();
    const statusBefore = canvas.getByRole("status").textContent;
    await advanceEmailSeconds(1);
    expect(canvas.getByRole("status")).toHaveTextContent(statusBefore ?? "");
    await advanceEmailSeconds(1);
    expect(canvas.getByRole("status")).toHaveTextContent(statusBefore ?? "");
    await advanceEmailSeconds(177);
    expect(await canvas.findByText("00:01")).toBeVisible();
    expect(resend).toBeDisabled();
    await advanceEmailSeconds(1);
    expect(await canvas.findByText("00:00")).toBeVisible();
    expect(canvas.getByRole("button", { name: "인증 확인" })).toBeDisabled();
    expect(canvas.getByLabelText("1번째 인증번호")).toHaveAttribute("aria-invalid", "true");
    expect(canvas.getByLabelText("1번째 인증번호")).toHaveAccessibleDescription(/만료되었습니다/);
    expect(canvas.getByText("00:00").closest('[role="status"], [aria-live]')).toBeNull();
    await expectEmailAccessibility(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "인증 확인" }));
    expect(emailRequests.filter((item) => item.path.endsWith("/verify"))).toHaveLength(0);
    await userEvent.click(resend);
    await expectEmailRequest("resend", { email: schoolEmail });
    expect(await canvas.findByText("03:00")).toBeVisible();
    for (let index = 0; index < 6; index++) expect(canvas.getByLabelText(`${index + 1}번째 인증번호`)).toHaveValue("");
    expect(resend).toBeDisabled();
    await waitFor(() => expect(canvas.getByLabelText("1번째 인증번호")).toHaveFocus());
  },
};
export const ResendFailure: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "resend-error" },
  /** 만료 후 재전송 오류는 00:00과 재시도 가능 상태를 유지한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    await advanceEmailSeconds(180);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "이메일이 오지 않았나요?" }));
    await expectEmailRequest("resend", { email: schoolEmail });
    expect(await within(canvasElement).findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    expect(within(canvasElement).getByText("00:00")).toBeVisible();
    expectEmailDigits(canvasElement, verificationCode);
    expect(within(canvasElement).getByLabelText("UNIVERSITY EMAIL")).toHaveValue(schoolEmail);
    await expectEmailAccessibility(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "이메일이 오지 않았나요?" }));
    await expectEmailRequest("resend", { email: schoolEmail }, 2);
    expect(await within(canvasElement).findByText("03:00")).toBeVisible();
    expectEmailDigits(canvasElement, "");
    await waitFor(() => expect(within(canvasElement).getByLabelText("1번째 인증번호")).toHaveFocus());
  },
};
export const VerifyPending: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "verify-pending" },
  /** 인증 응답 대기의 코드 입력 잠금과 정확한 body를 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "인증 확인" }));
    await expectEmailRequest("verify", { code: verificationCode, email: schoolEmail });
    expect(within(canvasElement).getByLabelText("1번째 인증번호")).toBeDisabled();
    const verify = within(canvasElement).getByRole("button", { name: "인증 확인" });
    expect(verify).toHaveAttribute("aria-busy", "true");
    expect(verify.querySelector("svg")).not.toBeNull();
    repeatEmailAction(canvasElement, verify);
    await userEvent.keyboard("{Enter}{Enter}");
    await expectEmailRequest("verify", { code: verificationCode, email: schoolEmail });
    expect(emailRequests.filter((item) => item.method === "POST")).toHaveLength(2);
    expect(getRouter().replace).not.toHaveBeenCalled();
    await expectEmailAccessibility(canvasElement);
  },
};
export const VerifyFailure: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "verify-error" },
  /** 인증 오류 뒤 코드가 남고 다시 시도할 수 있는지 확인한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "인증 확인" }));
    await expectEmailRequest("verify", { code: verificationCode, email: schoolEmail });
    expect(await within(canvasElement).findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    expect(within(canvasElement).getByRole("button", { name: "인증 확인" })).toBeEnabled();
    expectEmailDigits(canvasElement, verificationCode);
    expect(within(canvasElement).getByLabelText("1번째 인증번호")).toHaveAttribute("aria-invalid", "true");
    expect(within(canvasElement).getByLabelText("1번째 인증번호")).toHaveAccessibleDescription(/요청을 처리하지 못했습니다/);
    expect(within(canvasElement).getByText("03:00")).toBeVisible();
    expect(getRouter().replace).not.toHaveBeenCalled();
    await expectEmailAccessibility(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "인증 확인" }));
    await expectEmailRequest("verify", { code: verificationCode, email: schoolEmail }, 2);
    await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1));
  },
};
export const VerifyUnauthorized: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "verify-unauthorized" },
  /** 인증 401의 로그인 next를 확인한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return;
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "인증 확인" }));
    await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1)); await waitFor(() => expect(getRouter().replace).toHaveBeenCalledWith(emailLoginPath(args.nextPath)));
  },
};
export const VerifySuccess: Story = {
  parameters: { a11y: { test: "error" } },
  /** 가상 인증 성공 메시지·wire body와 next 이동을 확인한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return;
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    await userEvent.click(within(canvasElement).getByRole("button", { name: "인증 확인" }));
    await expectEmailRequest("verify", { code: verificationCode, email: schoolEmail });
    expect(await within(canvasElement).findByText("학교 이메일 인증이 완료되었습니다.")).toBeVisible();
    await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1)); await waitFor(() => expect(getRouter().replace).toHaveBeenCalledWith(args.nextPath));
  },
};


export const ResendPending: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "resend-pending" },
  /** 재발송 대기에는 재발송만 진행 표시를 갖고 모든 다른 POST를 차단한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    await advanceEmailSeconds(180);
    const resend = canvas.getByRole("button", { name: "이메일이 오지 않았나요?" });
    repeatEmailAction(canvasElement, resend);
    await expectEmailRequest("resend", { email: schoolEmail });
    await userEvent.keyboard("{Enter}{Enter}");
    expect(resend).toHaveAttribute("aria-busy", "true");
    expect(resend.querySelector("svg")).not.toBeNull();
    const verify = canvas.getByRole("button", { name: "인증 확인" });
    expect(verify).toBeDisabled();
    expect(verify).toHaveAttribute("aria-busy", "false");
    expect(verify.querySelector("svg")).toBeNull();
    repeatEmailAction(canvasElement, verify);
    await expectEmailRequest("send", { email: schoolEmail });
    await expectEmailRequest("resend", { email: schoolEmail });
    expect(emailRequests.filter((item) => item.path.endsWith("/verify"))).toHaveLength(0);
    expectEmailDigits(canvasElement, verificationCode);
    await expectEmailAccessibility(canvasElement);
  },
};

export const ResendCompletion: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "resend-pending" },
  /** 지연 응답을 해제한 뒤에만 코드·180초·첫 칸 focus가 초기화된다. */
  async play(context) {
    if (isDocsExample()) return;
    await ResendPending.play?.(context);
    releaseEmailResponse();
    const canvas = within(context.canvasElement);
    expect(await canvas.findByText("03:00")).toBeVisible();
    expectEmailDigits(context.canvasElement, "");
    await waitFor(() => expect(canvas.getByLabelText("1번째 인증번호")).toHaveFocus());
    expect(canvas.getByRole("button", { name: "이메일이 오지 않았나요?" })).toBeDisabled();
  },
};

export const SendCompletion: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "send-pending" },
  /** 지연 발송의 중복 차단과 완료 후 코드 입력 준비를 함께 확인한다. */
  async play(context) {
    if (isDocsExample()) return;
    await SendPending.play?.(context);
    releaseEmailResponse();
    const canvas = within(context.canvasElement);
    expect(await canvas.findByText("03:00")).toBeVisible();
    await waitFor(() => expect(canvas.getByLabelText("1번째 인증번호")).toHaveFocus());
  },
};

export const VerifyCompletion: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "verify-pending" },
  /** 지연 확인은 응답 이전에 이동하지 않고 해제 뒤 next로 한 번만 이동한다. */
  async play(context) {
    if (isDocsExample()) return;
    await VerifyPending.play?.(context);
    releaseEmailResponse();
    await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1));
    expect(getRouter().replace).toHaveBeenCalledWith(context.args.nextPath);
  },
};

export const UserRecovery: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-retry-pending" },
  /** 첫 404 뒤 화면 내 재시도는 단일 GET으로 복구하고 학교 이메일을 초기화한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    const email = canvas.getByLabelText("UNIVERSITY EMAIL");
    expect(email).not.toHaveAttribute("aria-invalid", "true");
    expect(email).not.toHaveAccessibleDescription(/요청을 처리하지 못했습니다/);
    await expectEmailAccessibility(canvasElement);
    const retry = canvas.getByRole("button", { name: "다시 불러오기" });
    repeatEmailAction(canvasElement, retry);
    await userEvent.keyboard("{Enter}{Enter}");
    await waitFor(() => expect(emailRequests).toHaveLength(2));
    expect(retry).toBeDisabled();
    expect(retry).toHaveAttribute("aria-busy", "true");
    expect(canvas.getByRole("alert")).toBeEmptyDOMElement();
    expect(canvas.getByRole("status")).toHaveTextContent("사용자 정보를 불러오는 중입니다.");
    expect(emailRequests).toEqual([
      { method: "GET", path: "/api/users/me", query: "", body: null },
      { method: "GET", path: "/api/users/me", query: "", body: null },
    ]);
    await expectEmailAccessibility(canvasElement);
    releaseEmailResponse();
    await waitFor(() => expect(email).toBeEnabled());
    expect(email).toHaveValue(schoolEmail);
    expect(canvas.getByRole("button", { name: "코드 전송" })).toBeEnabled();
    expect(canvas.queryByRole("button", { name: "다시 불러오기" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "코드 전송" }));
    await expectEmailRequest("send", { email: schoolEmail });
    expect(await canvas.findByText("03:00")).toBeVisible();
  },
};

export const UserRetryFailure: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-retry-error" },
  /** 재조회도 실패하면 오류와 다시 시도할 동작을 보존한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "다시 불러오기" }));
    await waitFor(() => expect(emailRequests).toHaveLength(2));
    expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    expect(canvas.getByRole("button", { name: "다시 불러오기" })).toBeEnabled();
    expect(canvas.getByRole("button", { name: "코드 전송" })).toBeDisabled();
  },
};

export const UserRetryUnauthorized: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-retry-unauthorized" },
  /** 재조회 401도 기존 로그인 URL의 중첩 next를 보존한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "다시 불러오기" }));
    await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1));
    expect(getRouter().replace).toHaveBeenCalledWith(emailLoginPath(args.nextPath));
  },
};

export const UserRetryAlreadyVerified: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-retry-verified" },
  /** 재조회에서 기인증 응답을 받으면 원래 next로 한 번 이동한다. */
  async play({ canvasElement, args }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "다시 불러오기" }));
    await waitFor(() => expect(getRouter().replace).toHaveBeenCalledTimes(1));
    expect(getRouter().replace).toHaveBeenCalledWith(args.nextPath);
  },
};

export const Expired: Story = {
  parameters: { a11y: { test: "error" } },
  /** 만료된 최종 화면의 설명 연결·버튼과 접근성을 검사한다. */
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    await enterCodeStep(canvasElement);
    await pasteEmailCode(canvasElement);
    await advanceEmailSeconds(180);
    const canvas = within(canvasElement);
    expect(await canvas.findByText("00:00")).toBeVisible();
    expect(canvas.getByRole("status")).toHaveTextContent("만료되었습니다.");
    expect(canvas.getByRole("button", { name: "인증 확인" })).toBeDisabled();
    expect(canvas.getByRole("button", { name: "이메일이 오지 않았나요?" })).toBeEnabled();
  },
};

export const PendingReset: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-retry-pending" },
  /** 재시도 지연 중 초기화해도 이전 응답이 새 화면이나 router를 변경하지 않는다. */
  render: (args) => <EmailPlayground key={args.scenario} {...args} />,
  async play({ canvasElement }) {
    if (isDocsExample()) return;
    const canvas = within(canvasElement);
    expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "다시 불러오기" }));
    await waitFor(() => expect(emailRequests).toHaveLength(2));
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    expect(await canvas.findByText("요청을 처리하지 못했습니다.")).toBeVisible();
    releaseEmailResponse();
    await waitFor(() => expect(emailRequests).toHaveLength(1));
    expect(canvas.getByLabelText("UNIVERSITY EMAIL")).toHaveValue("");
    expect(canvas.getByRole("button", { name: "코드 전송" })).toBeDisabled();
    expect(getRouter().replace).not.toHaveBeenCalled();
  },
};

export const StrictModeRecovery: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "user-retry-pending" },
  /** effect 재연결에서도 첫 GET과 재시도를 각각 한 번만 실행한다. */
  render: (args) => <StrictMode><VerifyEmailPage nextPath={args.nextPath} /></StrictMode>,
  async play(context) {
    if (isDocsExample()) return;
    await UserRecovery.play?.(context);
  },
};

export const ResendPendingReset: Story = {
  parameters: { a11y: { test: "error" } },
  args: { scenario: "resend-pending" },
  /** 재발송 대기 중 초기화하면 이전 코드·타이머·응답이 새 인스턴스로 넘어오지 않는다. */
  render: (args) => <EmailPlayground key={args.scenario} {...args} />,
  async play(context) {
    if (isDocsExample()) return;
    await ResendPending.play?.(context);
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    releaseEmailResponse();
    await waitFor(() => expect(canvas.getByLabelText("UNIVERSITY EMAIL")).toBeEnabled());
    expect(canvas.getByLabelText("UNIVERSITY EMAIL")).toHaveValue("");
    expectEmailDigits(context.canvasElement, "");
    await advanceEmailSeconds(180);
    expect(canvas.getByRole("status")).toBeEmptyDOMElement();
    expect(canvas.getByText("00:00")).toBeVisible();
    expect(emailRequests).toEqual([{ method: "GET", path: "/api/users/me", query: "", body: null }]);
    expect(getRouter().replace).not.toHaveBeenCalled();
  },
};
