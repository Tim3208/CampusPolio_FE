import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { userFlowCatalog } from "../model/user-flow-data";
import { UserFlowPage } from "./user-flow-page";
import { storyCatalog } from "./user-flow-page.story-fixtures";

/** 스토리 간 해시와 스크롤을 격리하고 기존 주소를 복원한다. */
function resetLocation() {
  const original = window.location.href;
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  window.scrollTo(0, 0);
  return () => window.history.replaceState(null, "", original);
}

const meta = {
  title: "Widgets/UserFlows/UserFlowPage",
  component: UserFlowPage,
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, height: 900 }, description: { component: "기획·코드 근거를 확인하는 정적 플로우 목록입니다. Playground는 전체 실제 목록, 고정 스토리는 작은 동일 타입 fixture로 검색·필터·상태·탭·조건 링크·주소 복원을 검증합니다. API나 로그인 성공 검증은 포함하지 않습니다." } },
  },
  args: { catalog: storyCatalog },
  argTypes: { catalog: { control: false } },
  beforeEach: resetLocation,
  /** 스토리 전환 시 조회 상태를 새로운 화면 인스턴스에 격리한다. */
  render(args, context) { return <UserFlowPage key={context.id} {...args} />; },
} satisfies Meta<typeof UserFlowPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { catalog: userFlowCatalog },
};

export const SuccessfulActions: Story = {
  /** 기본 성공 목록과 모든 구현 상태를 접힌 상태에서 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "유저 플로우", level: 1 })).toBeVisible();
    await expect(canvas.queryByText("CAMPUS POLIO · FLOW GUIDE")).not.toBeInTheDocument();
    await expect(canvas.queryByText("행동 → 기대 결과. 필요한 상태와 근거만 펼쳐보세요.")).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText("구현 상태 판단 기준")).not.toBeInTheDocument();
    await expect(canvas.queryByText("행동을 펼치면 상세 상태와 근거를 볼 수 있어요")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveClass("sr-only");
    await expect(canvas.getByRole("tab", { name: /사용자 행동/ })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("선택한 프로젝트 상세로 이동한다")).toBeVisible();
    await expect(canvas.getByRole("button", { name: /fixture-01/ })).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    await expect(canvas.getByText("확인 필요", { selector: "span" })).toBeVisible();
  },
};

export const EmptySearch: Story = {
  /** 검색 결과가 없을 때 안내와 전체 목록 복귀가 동작하는지 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "플로우 검색" }), "없는 플로우 98765");
    await expect(canvas.getByRole("heading", { name: "일치하는 플로우가 없어요" })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /fixture-01/ })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "전체 목록 보기" }));
    await expect(canvas.getByRole("textbox", { name: "플로우 검색" })).toHaveValue("");
    await expect(canvas.getByRole("button", { name: /fixture-01/ })).toBeVisible();
  },
};

export const StatusFilter: Story = {
  /** 미구현만 선택한 뒤 전체 상태로 복원하는 결과를 검사한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "구현 상태 필터" }), "미구현");
    await expect(canvas.getByRole("button", { name: /fixture-02/ })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /fixture-01/ })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: /fixture-03/ })).not.toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "구현 상태 필터" }), "all");
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  },
};

export const ConditionsRoundTrip: Story = {
  /** 조건 링크가 필터를 해제하고 초점을 이동하며 원래 행동으로 돌아오는지 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", { name: "플로우 검색" }), "프로젝트 카드");
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "구현 상태 필터" }), "구현됨");
    await userEvent.click(canvas.getByRole("link", { name: "조건: 로그인 상태" }));
    await expect(canvas.getByRole("tab", { name: /조건별 흐름/ })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("textbox", { name: "플로우 검색" })).toHaveValue("");
    await expect(canvas.getByRole("combobox", { name: "구현 상태 필터" })).toHaveValue("all");
    const condition = canvas.getByRole("button", { name: /로그인 상태 구현됨/ });
    await waitFor(async () => { await expect(condition).toHaveFocus(); });
    await expect(condition).toHaveAttribute("aria-expanded", "true");
    await expect(window.location.hash).toBe("#conditions/fixture-session");
    await userEvent.click(canvas.getByRole("link", { name: "프로젝트 카드를 선택한다" }));
    const action = canvas.getByRole("button", { name: /fixture-01/ });
    await waitFor(async () => { await expect(action).toHaveFocus(); });
    await expect(action).toHaveAttribute("aria-expanded", "true");
    await expect(window.location.hash).toBe("#actions/fixture-01");
  },
};

export const StatesAndEvidence: Story = {
  /** 오류·제안 상태와 기본·개별 커밋에 고정된 근거 링크를 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /fixture-01/ }));
    const flow = within(canvasElement.querySelector('[data-flow-id="fixture-01"]')! as HTMLElement);
    await expect(flow.getByText("오류", { exact: true })).toBeVisible();
    await expect(flow.getByText("기존", { exact: true })).toBeVisible();
    await expect(flow.getByText("제안", { exact: true })).toBeVisible();
    await expect(flow.getByText(/프로젝트가 삭제되었다면/)).toBeVisible();
    await expect(canvas.getByRole("link", { name: /화면 경로/ })).toHaveAttribute("href", `${storyCatalog.repositoryUrl}/blob/${storyCatalog.revision}/src/shared/config/routes.ts#L1`);
    await expect(canvas.getByRole("link", { name: /갱신 근거/ })).toHaveAttribute("href", `${storyCatalog.repositoryUrl}/blob/test-evidence-revision/src/features/profile/profile-settings/ui/profile-settings-form.tsx#L209`);
    await userEvent.click(canvas.getByRole("tab", { name: /새 아이디어/ }));
    await expect(canvas.getByRole("button", { name: /프로젝트 즐겨찾기/ })).toBeVisible();
    await expect(canvas.queryByRole("combobox", { name: "구현 상태 필터" })).not.toBeInTheDocument();
  },
};

export const KeyboardNavigation: Story = {
  /** 탭 방향키·Home·End 및 Enter로 아코디언을 조작한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: /사용자 행동/ }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: /조건별 흐름/ })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("tab", { name: /새 아이디어/ })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("tab", { name: /사용자 행동/ })).toHaveFocus();
    const action = canvas.getByRole("button", { name: /fixture-01/ });
    action.focus();
    await userEvent.keyboard("{Enter}");
    await expect(action).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Enter}");
    await expect(action).toHaveAttribute("aria-expanded", "false");
  },
};

export const DeepLink: Story = {
  /** 직접 연결한 주소를 첫 렌더에서 복원하고 종료 후 제거한다. */
  beforeEach() {
    const cleanup = resetLocation();
    window.history.replaceState(null, "", "#conditions/fixture-session");
    return cleanup;
  },
  /** 링크된 조건을 펼친 상태와 초점으로 보여주는지 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const condition = await canvas.findByRole("button", { name: /로그인 상태 구현됨/ });
    await expect(condition).toHaveAttribute("aria-expanded", "true");
    await waitFor(async () => { await expect(condition).toHaveFocus(); });
  },
};

export const EmptyCatalog: Story = {
  args: { catalog: { ...storyCatalog, flows: [], conditions: [], ideas: [] } },
  /** 데이터가 없는 경우에도 탭·검색과 빈 목록 안내를 표시한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "일치하는 플로우가 없어요" })).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: /조건별 흐름/ }));
    await expect(canvas.getByRole("heading", { name: "일치하는 플로우가 없어요" })).toBeVisible();
  },
};

export const NarrowLayout: Story = {
  parameters: { viewport: { value: "campus360" } },
  /** 실제 현재 폭에서 목록이 문서 밖으로 넘치지 않는지 확인한다. */
  async play({ canvasElement }) {
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /fixture-01/ }));
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth + 1);
  },
};
