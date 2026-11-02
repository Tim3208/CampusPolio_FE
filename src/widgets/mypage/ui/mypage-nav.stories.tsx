import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MypageNav } from "./mypage-nav";
import { checkMypageNav, prepareMypageStory } from "./mypage.story-helpers";

const meta = {
  title: "Widgets/Mypage/MypageNav",
  component: MypageNav,
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/mypage/projects" } },
    docs: {
      story: { inline: false, height: 320 },
      description: { component: "같은 메뉴를 모바일 상단과 데스크톱 사이드바에 표시합니다. desktop은 배치만 바꾸며 활성 메뉴는 Next pathname mock으로 정합니다. 인증 gate·서버 layout·실제 페이지 이동은 연결하지 않습니다." },
    },
  },
  args: { desktop: false },
  argTypes: { desktop: { control: "boolean", description: "true이면 세로 사이드바 메뉴를 표시합니다." } },
  beforeEach: prepareMypageStory,
  /** 현재 pathname에 맞는 링크 및 키보드 순서를 확인한다. */
  play: async ({ canvasElement, parameters }) => {
    await checkMypageNav(canvasElement, parameters.nextjs.navigation.pathname);
  },
} satisfies Meta<typeof MypageNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Projects: Story = {};
export const Portfolios: Story = { parameters: { nextjs: { navigation: { pathname: "/mypage/portfolios" } } } };
export const Settings: Story = { parameters: { nextjs: { navigation: { pathname: "/mypage/settings" } } } };
export const Support: Story = { parameters: { nextjs: { navigation: { pathname: "/mypage/support" } } } };
export const NestedProject: Story = { parameters: { nextjs: { navigation: { pathname: "/mypage/projects/6101" } } } };
export const NoActiveMenu: Story = { parameters: { nextjs: { navigation: { pathname: "/mypage/projects-other" } } } };
export const Desktop: Story = { args: { desktop: true } };
export const Playground: Story = {
  /** 자유 조작 상태에서는 meta의 자동 키보드·클릭 검사를 실행하지 않는다. */
  play: async () => {},
  parameters: { docs: { description: { story: "자동 클릭 없이 desktop Control과 링크를 자유롭게 조작합니다. 링크의 요청은 mock이며 서버 조회 결과가 갱신되지는 않습니다." } } },
};
