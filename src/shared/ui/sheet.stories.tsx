import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Fragment } from "react";
import { Button } from "./button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { longSheetParagraphs, sheetDescription } from "./sheet.story-fixtures";

type SheetArgs = { side: "top" | "bottom" | "left" | "right"; title: string; description: string; longContent: boolean; disabled: boolean };

/** 제품의 실제 trigger/title/description/close와 body portal을 조합한다. */
function SheetExample(args: SheetArgs) {
  return <Sheet><SheetTrigger asChild><Button disabled={args.disabled}>안내 열기</Button></SheetTrigger>
    <SheetContent side={args.side}>
      <SheetHeader><SheetTitle>{args.title}</SheetTitle><SheetDescription>{args.description}</SheetDescription></SheetHeader>
      {args.longContent ? longSheetParagraphs.map(renderParagraph) : <p>가상 프로젝트의 자료를 확인해 주세요.</p>}
      <SheetFooter><SheetClose asChild><Button>확인하고 닫기</Button></SheetClose></SheetFooter>
    </SheetContent>
  </Sheet>;
}
/** 긴 본문의 각 문단을 안정적인 키로 표시한다. */
function renderParagraph(text: string) { return <p key={text}>{text}</p>; }

const meta = {
  title: "Shared/Sheet", render: SheetExample,
  decorators: [
    /** 스토리 전환에서만 시트 인스턴스를 교체해 열림과 스크롤 잠금을 정리한다. */
    (Story, context) => <Fragment key={context.id}><Story /></Fragment>,
  ],
  args: { side: "bottom", title: "프로젝트 안내", description: sheetDescription, longContent: false, disabled: false },
  argTypes: {
    side: { control: "select", options: ["top", "bottom", "left", "right"], description: "시트가 배치되는 네 방향" },
    title: { control: "text", description: "Dialog의 접근 가능한 제목" },
    description: { control: "text", description: "Dialog의 접근 가능한 설명" },
    longContent: { control: "boolean", description: "시트 내부 스크롤을 확인할 긴 본문" },
    disabled: { control: "boolean", description: "트리거 비활성화" },
  },
  parameters: { layout: "padded", docs: { description: { component: "실제 Radix Sheet 조합입니다. portal은 iframe document.body에 표시됩니다. 고정 play는 키보드와 닫기·포커스 복귀를 검사한 뒤 열린 상태를 남깁니다. Playground는 수동으로 열고 닫습니다." } } },
} satisfies Meta<SheetArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Tab/Enter, 닫기, Escape, 외부 클릭과 재열기 뒤 body portal을 검증한다. */
async function verifySheet({ canvasElement, args }: Parameters<NonNullable<Story["play"]>>[0]) {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const trigger = canvas.getByRole("button", { name: "안내 열기" });
  await userEvent.tab();
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  let dialog = await body.findByRole("dialog", { name: args.title });
  await expect(canvasElement.contains(dialog)).toBe(false);
  await expect(dialog).toHaveAccessibleDescription(args.description);
  await userEvent.tab();
  await expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true);
  await userEvent.tab({ shift: true });
  await expect(dialog.contains(canvasElement.ownerDocument.activeElement)).toBe(true);
  await userEvent.click(body.getByRole("button", { name: /^닫기$/ }));
  await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard(" ");
  await body.findByRole("dialog");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  await body.findByRole("dialog");
  const overlay = canvasElement.ownerDocument.querySelector<HTMLElement>('[data-slot="sheet-overlay"]');
  if (!overlay) throw new Error("Sheet overlay가 없습니다.");
  await userEvent.click(overlay);
  await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.click(trigger);
  dialog = await body.findByRole("dialog");
  await userEvent.click(body.getByRole("button", { name: "확인하고 닫기" }));
  await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
  await expect(trigger).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  dialog = await body.findByRole("dialog");
  await expect(dialog).toBeVisible();
}
export const Bottom: Story = { play: verifySheet };
export const Top: Story = { args: { side: "top" }, play: verifySheet };
export const Left: Story = { args: { side: "left" }, play: verifySheet };
export const Right: Story = { args: { side: "right" }, play: verifySheet };
export const LongContent: Story = {
  args: { longContent: true },
  /** 긴 본문의 실제 내부 세로 스크롤과 마지막 문단 도달을 확인한다. */
  async play(context) {
    await verifySheet(context);
    const dialog = within(context.canvasElement.ownerDocument.body).getByRole("dialog");
    await expect(dialog.scrollHeight).toBeGreaterThan(dialog.clientHeight);
    dialog.scrollTop = dialog.scrollHeight;
    await expect(dialog.scrollTop).toBeGreaterThan(0);
    await expect(within(dialog).getByText(longSheetParagraphs[17])).toBeVisible();
  },
};
export const DisabledTrigger: Story = {
  args: { disabled: true },
  /** 비활성 트리거에서 portal이 열리지 않는지 확인한다. */
  async play({ canvasElement }) {
    const button = within(canvasElement).getByRole("button");
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};
export const Playground: Story = {
  parameters: { docs: { description: { story: "Controls에서 방향·제목·설명·긴 본문·disabled를 바꾸고 직접 열어 닫습니다. 자동 play가 없습니다." } } },
};

