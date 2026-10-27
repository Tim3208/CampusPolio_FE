import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { HomePage } from "./home-page";
import { emptyHomeData, homeCtaImageHandlers, homePageProjects, normalHomeData } from "./home-page.story-fixtures";

const meta = {
  title: "Widgets/Home/HomePage",
  component: HomePage,
  parameters: {
    layout: "fullscreen",
    msw: { handlers: homeCtaImageHandlers },
  },
  args: { data: normalHomeData },
  /** 재방문 시 선택 분야·사진 오류·실제 슬라이더 DOM을 새로 마운트한다. */
  render(args, context) { return <HomePage key={context.id} {...args} />; },
  /** 스토리 시작 시 문서 스크롤과 라우터 관찰 기록을 초기화한다. */
  beforeEach() {
    window.scrollTo(0, 0);
    getRouter().refresh.mockClear();
  },
} satisfies Meta<typeof HomePage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  /** 분야와 전체 복귀, 빈 분야 및 브라우저의 실제 가로 스크롤을 검증한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("heading", { name: "분야별 프로젝트" }).closest("section")!;
    const categories = within(section);
    await expect(categories.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    await userEvent.click(categories.getByRole("button", { name: "시각 디자인" }));
    await expect(categories.getByRole("button", { name: "시각 디자인" })).toHaveAttribute("aria-pressed", "true");
    await expect(categories.getByRole("heading", { name: homePageProjects.design.title })).toBeVisible();
    await expect(categories.queryByRole("heading", { name: homePageProjects.engineering.title })).not.toBeInTheDocument();
    await expect(categories.getByRole("link", { name: "시각 디자인 프로젝트 더 보기" })).toHaveAttribute("href", "/projects?tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8");
    await userEvent.click(categories.getByRole("button", { name: "공학" }));
    await expect(categories.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    await userEvent.click(categories.getByRole("button", { name: "건축학" }));
    await expect(categories.getByRole("heading", { name: "건축학 프로젝트가 아직 없어요" })).toBeVisible();
    await userEvent.click(categories.getByRole("button", { name: "전체 분야 보기" }));
    await expect(categories.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
    await expect(categories.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    const track = canvasElement.querySelector<HTMLElement>("[data-featured-track]")!;
    await waitFor(() => expect(canvas.getByRole("button", { name: "다음 프로젝트" })).toBeEnabled());
    await userEvent.click(canvas.getByRole("button", { name: "다음 프로젝트" }));
    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(1));
    await userEvent.click(canvas.getByRole("button", { name: "이전 프로젝트" }));
    await waitFor(() => expect(track.scrollLeft).toBeLessThanOrEqual(1));
    window.scrollTo(0, 0);
    await expect(getRouter().refresh).not.toHaveBeenCalled();
  },
};

export const Empty: Story = {
  args: { data: emptyHomeData },
  /** 인기·분야가 모두 빈 실제 홈 안내와 전체 분야 기본값을 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("heading", { name: "아직 소개할 프로젝트가 없어요" })).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: "전체" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvasElement.querySelector("[data-featured-track]")).toBeNull();
  },
};

export const QueryError: Story = {
  args: { data: undefined, errorMessage: "가상 홈 조회 실패" },
  /** 다시 시도 클릭이 새 서버 조회 없이 refresh mock만 한 번 호출하는지 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("프로젝트를 불러오지 못했어요");
    await expect(getRouter().refresh).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "다시 시도" }));
    await expect(getRouter().refresh).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole("heading", { name: "분야별 프로젝트" })).not.toBeInTheDocument();
  },
};

