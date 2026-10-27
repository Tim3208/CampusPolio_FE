import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";

/** 실제 document의 portal을 찾아 현재 선택과 첫 입력 포커스를 확인한다. */
export async function openFilterSheet(canvasElement: HTMLElement, tags = ["공학"]) {
  const trigger = within(canvasElement).getByRole("button", { name: /필터/ });
  await userEvent.click(trigger);
  const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog", { name: "태그 필터" });
  await expect(canvasElement.contains(dialog)).toBe(false);
  await expectSelectedTags(dialog, tags);
  await waitFor(() => expect(within(dialog).getByRole("checkbox", { name: "시각 디자인" })).toHaveFocus());
  return dialog;
}

/** 모든 체크박스의 실제 선택 상태를 기대 태그와 대조한다. */
export async function expectSelectedTags(dialog: HTMLElement, tags: string[]) {
  for (const checkbox of within(dialog).getAllByRole("checkbox")) {
    const label = checkbox.closest("label")?.textContent?.trim();
    if (tags.includes(label ?? "")) await expect(checkbox).toBeChecked();
    else await expect(checkbox).not.toBeChecked();
  }
  await expect(within(dialog).getByRole("button", { name: `적용하기 (${tags.length})` })).toBeVisible();
}

/** 숨겨진 입력을 감싸는 실제 라벨을 눌러 초안을 변경한다. */
export async function selectFilterTag(dialog: HTMLElement, tag: string) {
  const checkbox = within(dialog).getByRole("checkbox", { name: tag });
  await userEvent.click(checkbox.closest("label")!);
}

/** 닫힌 portal과 트리거 포커스 복귀 및 이동 요청 부재를 확인한다. */
export async function expectFilterClosed(canvasElement: HTMLElement, pushCount = 0) {
  await waitFor(() => expect(within(canvasElement.ownerDocument.body).queryByRole("dialog")).not.toBeInTheDocument());
  await waitFor(() => expect(within(canvasElement).getByRole("button", { name: /필터/ })).toHaveFocus());
  await expect(getRouter().push).toHaveBeenCalledTimes(pushCount);
}

/** 각 취소 방식이 초안을 폐기하고 재열기 때 원조건을 복원하는지 검증한다. */
export async function verifyFilterCancellation(canvasElement: HTMLElement, mode: "close" | "escape" | "outside") {
  const dialog = await openFilterSheet(canvasElement);
  await selectFilterTag(dialog, "시각 디자인");
  await expectSelectedTags(dialog, ["공학", "시각 디자인"]);
  await userEvent.click(within(dialog).getByRole("button", { name: "선택 초기화" }));
  await expectSelectedTags(dialog, []);
  await selectFilterTag(dialog, "건축학");
  await expect(getRouter().push).not.toHaveBeenCalled();
  if (mode === "close") await userEvent.click(within(dialog).getByRole("button", { name: "닫기" }));
  else if (mode === "escape") await userEvent.keyboard("{Escape}");
  else {
    const overlay = canvasElement.ownerDocument.querySelector<HTMLElement>('[data-slot="sheet-overlay"]')!;
    await userEvent.click(overlay);
  }
  await expectFilterClosed(canvasElement);
  const restored = await openFilterSheet(canvasElement);
  await userEvent.click(within(restored).getByRole("button", { name: "닫기" }));
  await expectFilterClosed(canvasElement);
}
