import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, within } from "storybook/test";
import { MypageProjectsPage } from "./mypage-projects-page";
import { failedMypageImage, longMypageProjects, mypageProjects, mypageTimeCases } from "./mypage.story-fixtures";
import { cardRoleLimitation, projectTagLimitation, mypageA11yTodo, checkMypageCard, checkMypageCreate, prepareMypageStory } from "./mypage.story-helpers";

const meta = {
  title: "Widgets/Mypage/MypageProjectsPage",
  component: MypageProjectsPage,
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/mypage/projects" } },
    docs: { story: { inline: false, height: 760 }, description: { component: "서버가 전달한 MyProject[]와 오류 문구를 표시하는 실제 목록입니다. PUBLISHED는 공개, DRAFT는 비공개로 표시합니다. 기준 시각은 2026-10-26T12:00:00+09:00이며 타이머를 멈추지 않습니다. href·router.push mock 확인은 실제 세션/조회/권한/이동 성공을 뜻하지 않습니다." } },
  },
  args: { projects: mypageProjects, errorMessage: "" },
  argTypes: {
    projects: { control: "object", description: "공개 도메인 MyProject 타입의 가상 목록. 빈 배열은 빈 상태입니다." },
    errorMessage: { control: "text", description: "값이 있으면 목록보다 오류 표시가 우선합니다." },
  },
  beforeEach: prepareMypageStory,
} satisfies Meta<typeof MypageProjectsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation + " " + projectTagLimitation),
  /** 공개·임시 표시, 고정 시간, 생성 및 상세 click/Enter/Space 경로를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("공개", { exact: true })).toBeVisible();
    await expect(canvas.getByText("비공개", { exact: true })).toBeVisible();
    await expect(canvas.getByText("업데이트: 25분 전")).toBeVisible();
    await expect(canvas.getByText("업데이트: 어제")).toBeVisible();
    await expect(canvas.getByText("태그 없음")).toBeVisible();
    await expect(canvas.getByText("썸네일 없음")).toBeVisible();
    await checkMypageCreate(canvas.getByRole("link", { name: "프로젝트 생성" }), "/projects/new");
    await checkMypageCard(canvas.getByRole("link", { name: "캠퍼스 길찾기 상세 보기" }), "/projects/6101");
    await checkMypageCard(canvas.getByRole("link", { name: "졸업 작품 초안 상세 보기" }), "/projects/6102");
  },
};
export const SettingsIsolation: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation + " " + projectTagLimitation),
  /** 중첩 설정 버튼의 click·Enter·Space가 수정 경로만 한 번 요청하는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("link", { name: "캠퍼스 길찾기 상세 보기" });
    const settings = within(card).getByRole("button", { name: "캠퍼스 길찾기 설정" });
    const push = getRouter().push;
    push.mockClear();
    await userEvent.click(settings);
    await expect(push).toHaveBeenCalledTimes(1);
    await expect(push).toHaveBeenCalledWith("/projects/6101/edit");
    for (const key of ["{Enter}", " "]) {
      push.mockClear();
      card.focus();
      await userEvent.tab();
      await expect(settings).toHaveFocus();
      await userEvent.keyboard(key);
      await expect(push).toHaveBeenCalledTimes(1);
      await expect(push).toHaveBeenCalledWith("/projects/6101/edit");
      await expect(push).not.toHaveBeenCalledWith("/projects/6101");
    }
  },
};
export const Published: Story = { args: { projects: [mypageProjects[0]] }, parameters: mypageA11yTodo(cardRoleLimitation) };
export const Draft: Story = { args: { projects: [mypageProjects[1]] }, parameters: mypageA11yTodo(cardRoleLimitation + " " + projectTagLimitation) };
export const Empty: Story = {
  args: { projects: [] },
  /** 빈 목록에서도 생성 경로가 유지되고 프로젝트 카드는 없는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("아직 프로젝트가 없습니다")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /상세 보기/ })).not.toBeInTheDocument();
    await checkMypageCreate(canvas.getByRole("link", { name: "프로젝트 생성" }), "/projects/new");
  },
};
export const Error: Story = {
  args: { errorMessage: "프로젝트 조회 오류 예시입니다. 잠시 후 다시 시도해주세요." },
  /** 오류가 전달되면 기존 목록과 빈 상태를 함께 표시하지 않는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("프로젝트 목록을 불러오지 못했습니다")).toBeVisible();
    await expect(canvas.getByText("프로젝트 조회 오류 예시입니다. 잠시 후 다시 시도해주세요.")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /상세 보기/ })).not.toBeInTheDocument();
    await expect(canvas.queryByText("아직 프로젝트가 없습니다")).not.toBeInTheDocument();
  },
};
export const FailedImage: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation),
  args: { projects: [{ ...mypageProjects[0], thumbnailUrl: failedMypageImage }] },
  /** 실제 로컬 이미지 404 뒤 제품의 대체 표시가 렌더되는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("썸네일 없음")).toBeVisible();
    await expect(canvas.queryByRole("img")).not.toBeInTheDocument();
  },
};
export const LongContent: Story = { args: { projects: longMypageProjects }, parameters: mypageA11yTodo(cardRoleLimitation + " " + projectTagLimitation) };
export const RelativeTimes: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation + " " + projectTagLimitation),
  args: { projects: mypageTimeCases.map(
    /** 각 상대 날짜 경계에 고유한 가상 프로젝트를 만든다. */
    (item, index) => ({ ...mypageProjects[1], projectId: 6110 + index, title: "날짜 경계 " + (index + 1), updatedAt: item.updatedAt }),
  ) },
  /** 분·시간·어제·일·주·절대 날짜 경계의 제품 문구를 확인한다. */
  play: async ({ canvasElement }) => {
    for (const item of mypageTimeCases) await expect(within(canvasElement).getByText(item.label)).toBeVisible();
  },
};
export const Playground: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation + " " + projectTagLimitation, "자동 play 없이 projects/errorMessage Controls로 표시를 바꿉니다. 상세·수정 요청은 Actions에서 확인할 수 있으며 목록은 전달한 props 그대로 유지됩니다."),
};
