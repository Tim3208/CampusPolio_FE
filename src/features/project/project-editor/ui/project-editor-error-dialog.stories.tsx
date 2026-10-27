import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { ProjectEditorErrorDialog, type ProjectEditorDialogError } from "./project-editor-error-dialog";

type DialogProps = ComponentProps<typeof ProjectEditorErrorDialog>;
type DialogArgs = DialogProps & { action: ProjectEditorDialogError["action"]; title: string; description: string; actionLabel: string };
const dialogCallbacks = { onClose: fn(), onLogin: fn(), onVerifyEmail: fn() };
const errors = {
  close: { title: "저장하지 못했습니다", description: "가상의 저장 오류입니다. 안내를 닫고 다시 확인하세요.", action: "close", actionLabel: "확인" },
  login: { title: "로그인이 필요합니다", description: "가상의 로그인 안내이며 인증 요청은 실행하지 않습니다.", action: "login", actionLabel: "로그인하기" },
  verifyEmail: { title: "이메일 인증이 필요합니다", description: "가상의 인증 안내이며 메일을 보내지 않습니다.", action: "verify-email", actionLabel: "이메일 인증하기" },
} satisfies Record<string, ProjectEditorDialogError>;

/** 문구를 편집해도 인스턴스를 유지하고 같은 action을 반복해서 열 수 있다. */
function DialogPlayground(args: DialogArgs & { onResetArgs: () => void }) {
  const [open, setOpen] = useState(false);
  /** 실제 표시를 열되 외부 인증·저장 요청은 만들지 않는다. */
  function show() { setOpen(true); }
  /** 기존 닫기 콜백을 관찰한다. */
  function close() { args.onClose(); setOpen(false); }
  /** 기존 로그인 콜백을 관찰한다. */
  function login() { args.onLogin(); setOpen(false); }
  /** 기존 이메일 인증 콜백을 관찰한다. */
  function verify() { args.onVerifyEmail(); setOpen(false); }
  /** Controls와 열린 상태, 콜백 기록을 명시적으로 초기화한다. */
  function reset() { args.onResetArgs(); setOpen(false); dialogCallbacks.onClose.mockClear(); dialogCallbacks.onLogin.mockClear(); dialogCallbacks.onVerifyEmail.mockClear(); }
  const error: ProjectEditorDialogError = { action: args.action, title: args.title, description: args.description, actionLabel: args.actionLabel };
  return <div className="min-h-screen p-4"><div className="flex flex-wrap gap-3"><button type="button" className="rounded border px-3 py-2" onClick={show}>오류 안내 열기</button><button type="button" className="rounded border px-3 py-2" onClick={reset}>시나리오 초기화</button></div><p className="mt-3 text-sm">Controls로 action·제목·본문·버튼 문구를 변경하세요. 콜백은 Actions에서 확인하며 실제 인증 요청은 하지 않습니다.</p><ProjectEditorErrorDialog error={open ? error : null} onClose={close} onLogin={login} onVerifyEmail={verify} /></div>;
}

/** 실제 콜백을 관찰하면서 오류 안내의 닫힘만 스토리 안에서 관리한다. */
function DialogState({ error, onClose, onLogin, onVerifyEmail }: DialogProps) {
  const [open, setOpen] = useState(error !== null);
  /** 닫기 콜백과 스토리 상태를 함께 갱신한다. */
  function close() { onClose(); setOpen(false); }
  /** 로그인 콜백만 관찰하고 외부 이동 없이 닫는다. */
  function login() { onLogin(); setOpen(false); }
  /** 이메일 콜백만 관찰하고 외부 이동 없이 닫는다. */
  function verify() { onVerifyEmail(); setOpen(false); }
  return <><ProjectEditorErrorDialog error={open ? error : null} onClose={close} onLogin={login} onVerifyEmail={verify} />{!open && <p role="status">안내가 닫혔습니다.</p>}</>;
}
const meta = {
  title: "Features/ProjectEditor/ErrorDialog",
  component: ProjectEditorErrorDialog,
  args: { error: null, ...dialogCallbacks, action: "close", title: errors.close.title, description: errors.close.description, actionLabel: "확인" },
  argTypes: {
    error: { control: false, description: "고정 회귀용 오류 fixture" },
    action: { control: "select", options: ["close", "login", "verify-email"] },
    title: { control: "text" }, description: { control: "text" }, actionLabel: { control: "text" },
    onClose: { control: false }, onLogin: { control: false }, onVerifyEmail: { control: false },
  },
  // Docs의 여러 열린 모달이 같은 document의 포커스를 경쟁하지 않도록 격리한다.
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 420 }, description: { component: "오류 안내와 기존 후속 콜백을 보여줍니다. 고정 상태는 자동 play로 콜백을 검증하고 Playground는 수동 열기·닫기·같은 action 재열기·초기화를 제공합니다. Escape, Tab 순환, 포커스 복귀를 지원합니다. Docs는 모달별 iframe으로 포커스를 격리하며 Controls 자유 조작은 Playground Canvas에서 확인합니다." } } },
  /** 스토리별 초기 오류에서 독립 상태 wrapper를 렌더한다. */
  render: (args) => <DialogState key={args.error?.action ?? "none"} {...args} />,
} satisfies Meta<DialogArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 선택한 버튼이 정확한 콜백만 한 번 호출하고 안내를 닫는지 검증한다. */
async function checkAction(canvasElement: HTMLElement, args: DialogProps, dismiss = false, keyboard = false) {
  if (!args.error) throw new Error("검증할 오류가 필요합니다.");
  const canvas = within(canvasElement);
  const dialog = canvas.getByRole("dialog");
  const button = within(dialog).getByRole("button", { name: dismiss ? "닫기" : args.error.actionLabel });
  if (keyboard) {
    await userEvent.tab();
    if (!dismiss && args.error.action !== "close") await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard(args.error.action === "verify-email" ? " " : "{Enter}");
  } else {
    await userEvent.click(button);
  }
  const action = dismiss ? "close" : args.error.action;
  await expect(args.onClose).toHaveBeenCalledTimes(action === "close" ? 1 : 0);
  await expect(args.onLogin).toHaveBeenCalledTimes(action === "login" ? 1 : 0);
  await expect(args.onVerifyEmail).toHaveBeenCalledTimes(action === "verify-email" ? 1 : 0);
  await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  await expect(canvas.getByRole("status")).toHaveTextContent("안내가 닫혔습니다.");
}
export const Null: Story = {
  /** 오류가 없으면 대화상자를 만들지 않는다. */
  async play({ canvasElement, args }) {
    await expect(within(canvasElement).queryByRole("dialog")).not.toBeInTheDocument();
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(args.onLogin).not.toHaveBeenCalled();
    await expect(args.onVerifyEmail).not.toHaveBeenCalled();
  },
};
export const Close: Story = { args: { error: errors.close } };
export const ClosePrimary: Story = { args: { error: errors.close },
  /** 확인 버튼의 닫기 호출을 검증한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args),
};
export const Login: Story = { args: { error: errors.login } };
export const LoginPrimary: Story = { args: { error: errors.login },
  /** 로그인 primary 호출을 검증한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args),
};
export const VerifyEmail: Story = { args: { error: errors.verifyEmail } };
export const VerifyEmailPrimary: Story = { args: { error: errors.verifyEmail },
  /** 이메일 primary 호출을 검증한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args),
};
export const LoginDismiss: Story = { args: { error: errors.login },
  /** 로그인 안내의 보조 닫기를 검증한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args, true),
};
export const VerifyEmailDismiss: Story = { args: { error: errors.verifyEmail },
  /** 이메일 안내의 보조 닫기를 검증한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args, true),
};
export const CloseKeyboard: Story = { args: { error: errors.close },
  /** Tab과 Enter로 확인 버튼을 조작한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args, false, true),
};
export const LoginKeyboard: Story = { args: { error: errors.login },
  /** Tab과 Enter로 로그인 primary를 조작한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args, false, true),
};
export const VerifyEmailKeyboard: Story = { args: { error: errors.verifyEmail },
  /** Tab과 Space로 이메일 primary를 조작한다. */
  play: ({ canvasElement, args }) => checkAction(canvasElement, args, false, true),
};

export const Playground: Story = {
  /** 문구 변경과 모달 열림 상태를 독립적으로 유지한다. */
  render: function RenderPlayground(args) { const [, , resetArgs] = useArgs<DialogArgs>(); return <DialogPlayground {...args} onResetArgs={resetArgs} />; },
};

export const FocusAndReopen: Story = {
  ...Playground,
  args: { action: "login", actionLabel: "로그인하기" },
  /** 모달 순환·Escape·원위치 복귀·동일 action 재열기와 reset을 검증한다. */
  async play({ canvasElement, args }) {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "오류 안내 열기" });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog");
    await waitFor(() => expect(dialog).toHaveFocus());
    await userEvent.tab();
    await expect(within(dialog).getByRole("button", { name: "닫기" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(within(dialog).getByRole("button", { name: "로그인하기" })).toHaveFocus();
    await userEvent.tab();
    await expect(within(dialog).getByRole("button", { name: "닫기" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await userEvent.keyboard("{Enter}");
    await userEvent.click(within(canvas.getByRole("dialog")).getByRole("button", { name: "로그인하기" }));
    await expect(args.onLogin).toHaveBeenCalledTimes(1);
    await expect(args.onVerifyEmail).not.toHaveBeenCalled();
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
