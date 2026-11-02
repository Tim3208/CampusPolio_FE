import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { ArrowRight, Plus } from "lucide-react";
import { mockConfig, publicEnv } from "@/shared/config";
import { Button } from "./button";
import { useArgs } from "storybook/preview-api";
import { useState, type ComponentProps } from "react";
import { ScenarioControls } from "../../../.storybook/scenario-controls";

type ButtonStoryArgs = ComponentProps<typeof Button> & { label?: string; showIcon?: boolean };
const buttonClick = fn();

/** Controls와 버튼 내용을 연결하고 초기화할 때만 클릭 기록을 지운다. */
function ButtonPlayground() {
  const [args, , resetArgs] = useArgs<ButtonStoryArgs>();
  return <InteractiveButton args={args} onResetArgs={resetArgs} />;
}

/** React 상태를 Storybook 훅 호출과 분리해 클릭 후에도 안정적으로 렌더링한다. */
function InteractiveButton({ args, onResetArgs }: { args: ButtonStoryArgs; onResetArgs: () => void }) {
  const [clicks, setClicks] = useState(0);
  /** 실제 사용자 클릭을 Actions와 화면의 횟수로 전달한다. */
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    args.onClick?.(event);
    setClicks(/** 누적 클릭 수를 하나 늘린다. */ (count) => count + 1);
  }
  /** 초기 args와 수동 조작 기록을 복원한다. */
  function handleReset() {
    onResetArgs();
    setClicks(0);
    buttonClick.mockClear();
  }
  const iconOnly = args.size?.startsWith("icon");
  return <div className="max-w-full">
    <ScenarioControls onReset={handleReset} />
    <Button variant={args.variant} size={args.size} disabled={args.disabled} onClick={handleClick} aria-label={iconOnly ? args.label : undefined}>
      {args.showIcon && <Plus aria-hidden="true" />}
      <span className={iconOnly ? "sr-only" : undefined}>{args.label}</span>
    </Button>
    <p role="status" className="mt-4 text-sm">클릭 횟수: {clicks}</p>
  </div>;
}

const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
const sizes = ["default", "xs", "sm", "lg", "md", "xl", "icon-md", "icon-xl", "icon", "icon-xs", "icon-sm", "icon-lg"] as const;
const meta = {
  title: "Shared/Button",
  component: Button,
  args: { children: "프로젝트 살펴보기", onClick: buttonClick },
  argTypes: {
    label: { control: "text", description: "Playground의 문구와 아이콘 전용 버튼의 접근 가능한 이름" },
    showIcon: { control: "boolean", description: "Playground의 추가 아이콘 표시" },
    variant: { control: "select", options: variants, description: "제품의 6가지 시각 변형" },
    size: { control: "select", options: sizes, description: "제품의 12가지 크기" },
    disabled: { control: "boolean", description: "포커스와 클릭을 막는 비활성 상태" },
    children: { control: false }, onClick: { control: false },
  },
  parameters: { layout: "centered", docs: { description: { component: "실제 공통 Button입니다. 고정 상태의 play는 자동 실행되고 Playground는 사용자가 직접 클릭합니다. Controls는 미리보기만 바꾸며 제품 기본값을 저장하지 않습니다." } } },
} satisfies Meta<ButtonStoryArgs>;
export default meta;
type Story = StoryObj<ButtonStoryArgs>;

export const Default: Story = {
  /** 실제 Button과 안전한 환경·라우터 mock을 확인한다. */
  async play({ canvasElement, args }) {
    const button = within(canvasElement).getByRole("button", { name: "프로젝트 살펴보기" });
    await expect(button).toBeVisible();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(publicEnv).toEqual({ apiBaseUrl: "", googleClientId: "" });
    await expect(mockConfig).toEqual({ useMockApi: false, authState: "unverified" });
    await expect(getRouter().push).toBeDefined();
  },
};
export const Variants: Story = {
  /** 제품의 여섯 variant를 함께 표시한다. */
  render: (args) => <div className="flex max-w-full flex-wrap gap-3">{variants.map((variant) => <Button {...args} key={variant} variant={variant}>{variant}</Button>)}</div>,
  /** 모든 variant가 제품 속성과 라벨을 유지하는지 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    for (const variant of variants) await expect(canvas.getByRole("button", { name: variant })).toHaveAttribute("data-variant", variant);
  },
};
export const Sizes: Story = {
  /** 제품의 열두 size와 아이콘 전용 라벨을 표시한다. */
  render: (args) => <div className="flex max-w-full flex-wrap items-center gap-3">{sizes.map((size) => <Button {...args} key={size} size={size} aria-label={size.startsWith("icon") ? size + " 추가" : undefined}>{size.startsWith("icon") ? <Plus aria-hidden="true" /> : size}</Button>)}</div>,
  /** 각 크기 버튼의 실제 size 속성을 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    for (const size of sizes) await expect(canvas.getByRole("button", { name: size.startsWith("icon") ? size + " 추가" : size })).toHaveAttribute("data-size", size);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  /** 비활성 버튼 조작이 콜백을 호출하지 않는지 확인한다. */
  async play({ canvasElement, args }) {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const WithIcon: Story = { args: { children: <><ArrowRight aria-hidden="true" data-icon="inline-start" />프로젝트 열기</> } };
export const IconOnly: Story = { args: { size: "icon-md", "aria-label": "프로젝트 추가", children: <Plus aria-hidden="true" /> } };
export const KeyboardFocus: Story = {
  /** Tab 포커스와 Enter·Space 각각의 단일 호출을 확인한다. */
  async play({ canvasElement, args }) {
    const button = within(canvasElement).getByRole("button");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button.matches(":focus-visible")).toBe(true);
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Playground: Story = {
  args: { variant: "default", size: "md", disabled: false, label: "프로젝트 살펴보기", showIcon: false },
  render: ButtonPlayground,
  parameters: { docs: { description: { story: "문구·6 variants·12 sizes·disabled·아이콘을 Controls로 조작합니다. 자동 클릭 없이 Actions와 클릭 횟수를 확인하고 시나리오 초기화로 복원합니다. destructive 변형의 대비 부족은 기존 Variants에 기록된 제품 접근성 제한이며 이 Playground의 기본값 검사 통과가 모든 수동 조합의 접근성 통과를 뜻하지 않습니다." } } },
};
