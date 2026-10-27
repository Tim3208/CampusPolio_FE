import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { MypageShell } from "./mypage-shell";
import { MypageProjectsPage } from "./mypage-projects-page";
import { MypagePortfoliosPage } from "./mypage-portfolios-page";
import { mypageProjects, mypagePortfolios } from "./mypage.story-fixtures";
import { cardRoleLimitation, projectTagLimitation, portfolioThumbnailLimitation, mypageA11yTodo, checkMypageNav, prepareMypageStory } from "./mypage.story-helpers";

const meta = {
  title: "Widgets/Mypage/MypageShell",
  component: MypageShell,
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/mypage/projects" } },
    docs: { story: { inline: false, height: 800 }, description: { component: "실제 Shell과 목록 widget을 조합합니다. 1024px 미만에는 상단 메뉴, 1024~1279px에는 220px 사이드바, 1280px 이상에는 240px 사이드바입니다. 서버 layout과 인증 gate는 실행하지 않습니다. 날짜는 2026-10-26T12:00:00+09:00에 고정합니다." } },
  },
  argTypes: { children: { control: false, description: "서버 조회 대신 fixture를 전달한 실제 본문 widget입니다." } },
  args: { children: <MypageProjectsPage projects={mypageProjects} /> },
  beforeEach: prepareMypageStory,
  /** 현재 폭에서 보이는 메뉴와 본문, 전체 가로 넘침을 확인한다. */
  play: async ({ canvasElement, parameters }) => {
    await checkMypageNav(canvasElement, parameters.nextjs.navigation.pathname);
    await expect(within(canvasElement).getByRole("main")).toBeVisible();
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
} satisfies Meta<typeof MypageShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Projects: Story = { parameters: mypageA11yTodo(cardRoleLimitation + " " + projectTagLimitation) };
export const Portfolios: Story = {
  args: { children: <MypagePortfoliosPage portfolios={mypagePortfolios} /> },
  parameters: { ...mypageA11yTodo(cardRoleLimitation + " " + portfolioThumbnailLimitation), nextjs: { navigation: { pathname: "/mypage/portfolios" } } },
};
export const EmptyProjects: Story = { args: { children: <MypageProjectsPage /> } };
export const ErrorProjects: Story = { args: { children: <MypageProjectsPage errorMessage="잠시 후 다시 시도해주세요." /> } };
