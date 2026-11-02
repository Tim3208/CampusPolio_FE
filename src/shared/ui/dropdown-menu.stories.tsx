import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { useState } from "react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { longMenuLabel } from "./dropdown-menu.story-fixtures";

type MenuArgs = { disabled: boolean; longLabel: boolean; onSelect: (value: string) => void };

/** 실제 Radix 메뉴의 정상·비활성 항목과 그룹 이름을 조합한다. */
function MenuExample(args: MenuArgs) {
  const [open, setOpen] = useState(false);
  /** 정상 첫 항목의 선택을 Actions에 전달한다. */
  function handleOpen() { args.onSelect("open"); }
  /** 비활성 항목이 잘못 실행되는지 관찰할 콜백이다. */
  function handleDisabled() { args.onSelect("disabled"); }
  /** 마지막 항목의 선택을 Actions에 전달한다. */
  function handleCopy() { args.onSelect("copy"); }
  return <DropdownMenu open={open} onOpenChange={setOpen}><DropdownMenuTrigger asChild disabled={args.disabled}><Button disabled={args.disabled}>프로젝트 메뉴</Button></DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>프로젝트 작업</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuItem onSelect={handleOpen}>{args.longLabel ? longMenuLabel : "프로젝트 열기"}</DropdownMenuItem>
        <DropdownMenuItem disabled onSelect={handleDisabled}>삭제 준비 중</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleCopy}>링크 복사</DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  </DropdownMenu>;
}
const meta = {
  title: "Shared/DropdownMenu",
  /** story ID가 바뀔 때만 실제 메뉴 인스턴스를 새로 만든다. */
  render: (args, context) => <MenuExample key={context.id} {...args} />,
  args: { disabled: false, longLabel: false, onSelect: fn() },
  argTypes: {
    disabled: { control: "boolean", description: "메뉴 트리거 비활성화" },
    longLabel: { control: "boolean", description: "화면 경계 안에서 긴 항목 표시" },
    onSelect: { control: false, description: "실행한 항목의 Actions 기록. 실제 이동이나 복사를 실행하지 않습니다." },
  },
  parameters: { layout: "padded", docs: { description: { component: "실제 Radix DropdownMenu입니다. 고정 play는 body portal과 키보드 선택·disabled 건너뛰기·Escape·외부 닫기·포커스 복귀를 확인합니다. Playground는 자동 선택 없이 수동 조작합니다." } } },
} satisfies Meta<MenuArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** 키보드 선택과 disabled 미실행, 닫기 및 재열기를 실제 portal에서 검증한다. */
async function verifyMenu({ canvasElement, args }: Parameters<NonNullable<Story["play"]>>[0]) {
  const canvas = within(canvasElement), body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole("button", { name: "프로젝트 메뉴" });
  await userEvent.tab();
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  const menu = await body.findByRole("menu");
  await expect(canvasElement.contains(menu)).toBe(false);
  const first = body.getByRole("menuitem", { name: args.longLabel ? longMenuLabel : "프로젝트 열기" });
  const disabled = body.getByRole("menuitem", { name: "삭제 준비 중" });
  await expect(disabled).toHaveAttribute("data-disabled");
  await waitFor(() => expect(first).toHaveFocus());
  await userEvent.keyboard("{ArrowDown}");
  await expect(body.getByRole("menuitem", { name: "링크 복사" })).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect(args.onSelect).toHaveBeenCalledTimes(1);
  await expect(args.onSelect).toHaveBeenCalledWith("copy");
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard(" ");
  await body.findByRole("menu");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await body.findByRole("menu");
  const currentDisabled = body.getByRole("menuitem", { name: "삭제 준비 중" });
  await expect(currentDisabled).toHaveAttribute("data-disabled");
  await userEvent.click(currentDisabled, { pointerEventsCheck: 0 });
  await expect(args.onSelect).not.toHaveBeenCalledWith("disabled");
  await expect(body.getByRole("menu")).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard("{ArrowDown}");
  await body.findByRole("menu");
  const reopenedFirst = body.getByRole("menuitem", { name: args.longLabel ? longMenuLabel : "프로젝트 열기" });
  await waitFor(() => expect(reopenedFirst).toHaveFocus());
  await userEvent.keyboard(" ");
  await expect(args.onSelect).toHaveBeenCalledWith("open");
  await expect(args.onSelect).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await body.findByRole("menu");
  await userEvent.click(canvasElement, { pointerEventsCheck: 0 });
  await waitFor(() => expect(body.queryByRole("menu")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await expect(await body.findByRole("menu")).toBeVisible();
  await waitFor(() => expect(body.getByRole("menu")).toHaveFocus());
}
const openMenuA11y = {
  a11y: { test: "todo" },
  docs: { description: { story: "접근성 미완료(todo): aria-hidden-focus. 기본 modal 메뉴가 열린 동안 Radix가 숨긴 #storybook-root(독립 iframe) 또는 렌더 div[data-aria-hidden=true][aria-hidden=true](Vitest)에 focusable trigger가 남습니다. 실제 Enter/Space/방향키·Escape·외부 닫기와 focus 복귀는 play로 별도 확인합니다. 안정된 열린 상태에서도 재현한 DEV-02 menu-diagnostic.json/PNG 및 stories-02 원문 근거이며 접근성 PASS가 아닙니다. modal 동작이나 axe rule은 변경하지 않습니다." } },
};
export const Normal: Story = { parameters: openMenuA11y, play: verifyMenu };
export const LongItem: Story = { args: { longLabel: true }, parameters: openMenuA11y, play: verifyMenu };
export const DisabledTrigger: Story = {
  args: { disabled: true },
  /** 비활성 트리거가 메뉴와 선택 콜백을 만들지 않는지 확인한다. */
  async play({ canvasElement, args }) {
    const trigger = within(canvasElement).getByRole("button");
    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger, { pointerEventsCheck: 0 });
    await expect(within(canvasElement.ownerDocument.body).queryByRole("menu")).not.toBeInTheDocument();
    await expect(args.onSelect).not.toHaveBeenCalled();
  },
};
export const Playground: Story = {};

