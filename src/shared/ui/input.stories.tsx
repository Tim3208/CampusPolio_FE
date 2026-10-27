import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { useArgs } from "storybook/preview-api";
import { Fragment, useId, useRef, useState, type ChangeEvent } from "react";
import { ScenarioControls } from "../../../.storybook/scenario-controls";
import { Input } from "./input";
import { Label } from "./label";
import { inputText, longInputText } from "./input.story-fixtures";

type InputArgs = { label: string; value: string; placeholder: string; disabled: boolean; invalid: boolean; errorMessage: string; onChange: (value: string) => void };
const inputChange = fn();

/** 같은 input 인스턴스에서 Controls 값과 타이핑을 양방향으로 동기화한다. */
function InputExample() {
  const [args, updateArgs, resetArgs] = useArgs<InputArgs>();
  return <ControlledInput args={args} onUpdate={updateArgs} onResetArgs={resetArgs} />;
}

/** React의 입력 상태를 별도 컴포넌트에 두어 Storybook 훅 컨텍스트와 포커스를 보존한다. */
function ControlledInput({ args, onUpdate, onResetArgs }: { args: InputArgs; onUpdate: (args: Partial<InputArgs>) => void; onResetArgs: () => void }) {
  const id = useId();
  const initialValue = useRef(args.value);
  const [inputState, setInputState] = useState({
    source: args.value, value: args.value, pending: [] as string[],
  });
  // 이미 발행한 입력의 늦은 echo는 확인만 하고 더 최신 로컬 입력을 되돌리지 않는다.
  if (inputState.source !== args.value) {
    const echoIndex = inputState.pending.indexOf(args.value);
    setInputState({
      source: args.value,
      value: echoIndex < 0 ? args.value : inputState.value,
      pending: echoIndex < 0 ? [] : inputState.pending.slice(echoIndex + 1),
    });
  }
  /** 사용자 입력을 Controls와 Actions에 반영한다. */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    setInputState((current) => ({ ...current, value, pending: [...current.pending, value] }));
    onUpdate({ value });
    args.onChange(value);
  }
  /** 최초 args를 복원하며 input을 불필요하게 remount하지 않는다. */
  function handleReset() {
    onResetArgs();
    setInputState({ source: args.value, value: initialValue.current, pending: [initialValue.current] });
    inputChange.mockClear();
  }
  return <div className="w-full max-w-md space-y-3">
    <ScenarioControls onReset={handleReset} />
    <Label htmlFor={id}>{args.label}</Label>
    <Input id={id} value={inputState.value} placeholder={args.placeholder} disabled={args.disabled}
      aria-invalid={args.invalid || undefined} aria-describedby={args.invalid ? id + "-error" : undefined} onChange={handleChange} />
    {args.invalid && <p id={id + "-error"} className="text-sm text-destructive">{args.errorMessage}</p>}
  </div>;
}

const meta = {
  title: "Shared/Input", render: InputExample,
  decorators: [
    /** 스토리 전환에서만 입력 상태를 새로 만들고 Controls 편집에서는 유지한다. */
    (Story, context) => <Fragment key={context.id}><Story /></Fragment>,
  ],
  args: { label: "프로젝트 이름", value: inputText, placeholder: "이름을 입력하세요", disabled: false, invalid: false, errorMessage: "프로젝트 이름을 확인해 주세요.", onChange: inputChange },
  argTypes: {
    label: { control: "text", description: "input과 연결되는 표시 이름" },
    value: { control: "text", description: "입력과 양방향 동기화되는 현재 값" },
    placeholder: { control: "text", description: "빈 값의 입력 안내" },
    disabled: { control: "boolean", description: "입력 및 포커스 차단" },
    invalid: { control: "boolean", description: "aria-invalid 및 연결된 오류 설명 표시" },
    errorMessage: { control: "text", description: "오류 상태의 접근 가능한 설명" },
    onChange: { control: false },
  },
  parameters: { layout: "padded", docs: { description: { component: "공통 Input에 label과 오류 설명을 연결한 실제 사용 예입니다. 고정 스토리는 자동 검증하고 Playground는 자동 입력 없이 조작합니다. 제품 기본값은 변경하지 않습니다." } } },
} satisfies Meta<InputArgs>;
export default meta;
type Story = StoryObj<InputArgs>;

export const Normal: Story = {
  /** 기존 값과 label 연결 및 키보드 입력의 연속 포커스를 검증한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "프로젝트 이름" });
    await expect(input).toHaveValue(inputText);
    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, "연속 입력 ABC");
    await expect(input).toHaveValue("연속 입력 ABC");
    await expect(input).toHaveFocus();
    await expect(canvas.getByRole("textbox")).toBe(input);
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    await expect(input).toHaveValue(inputText);
  },
};
export const Empty: Story = {
  args: { value: "" },
  /** 빈 값과 placeholder, Tab 순서를 확인한다. */
  async play({ canvasElement }) {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveValue("");
    await expect(input).toHaveAttribute("placeholder", "이름을 입력하세요");
    await userEvent.tab();
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  /** disabled input은 Tab 대상에서 제외되고 변경 callback을 호출하지 않는다. */
  async play({ canvasElement, args }) {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toBeDisabled();
    await userEvent.tab();
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(input).toHaveValue(inputText);
  },
};
export const Invalid: Story = {
  args: { value: "", invalid: true },
  /** aria-invalid와 실제 연결된 오류 설명을 확인한다. */
  async play({ canvasElement, args }) {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAccessibleDescription(args.errorMessage);
  },
};
export const LongValue: Story = {
  args: { value: longInputText },
  /** 긴 값이 유지되며 input 자체의 가로 스크롤로 표시되는지 확인한다. */
  async play({ canvasElement }) {
    const input = within(canvasElement).getByRole("textbox");
    await expect(input).toHaveValue(longInputText);
    await expect(input.scrollWidth).toBeGreaterThan(input.clientWidth);
  },
};
export const Playground: Story = {
  parameters: { docs: { description: { story: "Controls의 label/value/disabled/invalid를 바꾸거나 직접 입력합니다. 입력 중 포커스를 유지하며 시나리오 초기화는 최초 값과 오류 상태를 복원합니다." } } },
};

