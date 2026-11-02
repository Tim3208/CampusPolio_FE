import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { MypagePortfoliosPage } from "./mypage-portfolios-page";
import { longMypagePortfolios, mypagePortfolios, mypageTimeCases } from "./mypage.story-fixtures";
import { cardRoleLimitation, portfolioThumbnailLimitation, mypageA11yTodo, checkMypageCard, checkMypageCreate, prepareMypageStory } from "./mypage.story-helpers";

const meta = {
  title: "Widgets/Mypage/MypagePortfoliosPage",
  component: MypagePortfoliosPage,
  parameters: {
    layout: "fullscreen",
    nextjs: { navigation: { pathname: "/mypage/portfolios" } },
    docs: { story: { inline: false, height: 850 }, description: { component: "MyPortfolio[]의 공개/비공개·설명·프로젝트 수를 표시합니다. 기준 시각 2026-10-26T12:00:00+09:00을 사용하며 실제 형식을 보존합니다. 가상 slug로 router.push를 검증하고 실제 서버 조회·세션·권한·공개 저장은 실행하지 않습니다." } },
  },
  args: { portfolios: mypagePortfolios, errorMessage: "" },
  argTypes: {
    portfolios: { control: "object", description: "공개 도메인 MyPortfolio 타입의 가상 목록입니다." },
    errorMessage: { control: "text", description: "오류 문구가 있으면 정상/빈 목록보다 우선합니다." },
  },
  beforeEach: prepareMypageStory,
} satisfies Meta<typeof MypagePortfoliosPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation + " " + portfolioThumbnailLimitation),
  /** 공개·비공개·설명 대체·수량·날짜와 생성/slug click·Enter·Space 경로를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const text of ["공개", "비공개", "프로젝트 3개", "프로젝트 0개", "포트폴리오 설명이 없습니다.", "업데이트: 2시간 전", "업데이트: 일주일 전"]) {
      await expect(canvas.getByText(text, { exact: true })).toBeVisible();
    }
    await checkMypageCreate(canvas.getByRole("link", { name: /포트폴리오 제작/ }), "/portfolios/new");
    await checkMypageCard(canvas.getByRole("link", { name: "프론트엔드 포트폴리오 상세 보기" }), "/portfolios/campus-frontend");
    await checkMypageCard(canvas.getByRole("link", { name: "나의 비공개 포트폴리오 상세 보기" }), "/portfolios/private-draft");
  },
};
export const Public: Story = { args: { portfolios: [mypagePortfolios[0]] }, parameters: mypageA11yTodo(cardRoleLimitation) };
export const Private: Story = { args: { portfolios: [mypagePortfolios[1]] }, parameters: mypageA11yTodo(cardRoleLimitation + " " + portfolioThumbnailLimitation) };
export const Empty: Story = {
  args: { portfolios: [] },
  /** 빈 목록과 생성 링크를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("아직 포트폴리오가 없습니다")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /상세 보기/ })).not.toBeInTheDocument();
    await checkMypageCreate(canvas.getByRole("link", { name: /포트폴리오 제작/ }), "/portfolios/new");
  },
};
export const Error: Story = {
  args: { errorMessage: "포트폴리오 조회 오류 예시입니다. 잠시 후 다시 시도해주세요." },
  /** 오류가 정상 목록과 빈 안내에 섞이지 않는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("포트폴리오 목록을 불러오지 못했습니다")).toBeVisible();
    await expect(canvas.getByText("포트폴리오 조회 오류 예시입니다. 잠시 후 다시 시도해주세요.")).toBeVisible();
    await expect(canvas.queryByRole("link", { name: /상세 보기/ })).not.toBeInTheDocument();
    await expect(canvas.queryByText("아직 포트폴리오가 없습니다")).not.toBeInTheDocument();
  },
};
export const LongContent: Story = { args: { portfolios: longMypagePortfolios }, parameters: mypageA11yTodo(cardRoleLimitation + " " + portfolioThumbnailLimitation) };
export const RelativeTimes: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation + " " + portfolioThumbnailLimitation),
  args: { portfolios: mypageTimeCases.map(
    /** 제품 날짜 경계에 대응하는 고유 포트폴리오를 만든다. */
    (item, index) => ({ ...mypagePortfolios[1], portfolioId: 6210 + index, slug: "time-" + index, title: "날짜 경계 " + (index + 1), updatedAt: item.updatedAt }),
  ) },
  /** 현재 제품의 상대/절대 날짜 문구를 확인한다. */
  play: async ({ canvasElement }) => {
    for (const item of mypageTimeCases) await expect(within(canvasElement).getByText(item.label)).toBeVisible();
  },
};
export const Playground: Story = {
  parameters: mypageA11yTodo(cardRoleLimitation + " " + portfolioThumbnailLimitation, "자동 play 없이 portfolios와 errorMessage를 바꾸고 카드를 조작합니다. Controls 변경은 미리보기 props만 바꾸며 서버 데이터나 제품 기본값을 저장하지 않습니다."),
};
