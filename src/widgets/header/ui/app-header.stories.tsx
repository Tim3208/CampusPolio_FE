import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppHeader } from "./app-header";
import { headerRequests, headerUserHandlers, releaseHeaderUser, resetHeaderRequests } from "./app-header.story-helpers";

const meta = {
  title: "Widgets/Header/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/projects/4205" } },
    msw: { handlers: headerUserHandlers("verified") },
    docs: { story: { inline: false, height: "360px" }, description: { component: "props가 없는 실제 공통 헤더입니다. pathname은 Next 라우터 mock, 로그인 여부는 실제 GET /api/users/me와 universityVerified 응답을 MSW로 재현합니다. 지연/401/일반 실패 동안 기존 제품은 로그인 UI를 보여줍니다. 스토리의 가상 성공은 실제 세션·권한·OAuth 성공이 아닙니다. OpenAPI는 userId query를 required로 표시하지만 현재 client는 세션 기반 경로에서 생략합니다. 이 차이를 숨기거나 API 계약을 변경하지 않습니다. Docs의 예제는 iframe으로 격리합니다." } },
  },
  beforeEach: resetHeaderRequests,
} satisfies Meta<typeof AppHeader>;
export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
  /** 조회 응답과 데스크톱 계정 경로를 검증한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.innerWidth < 768) await expect(await canvas.findByRole("button", { name: "계정 메뉴" })).toBeVisible();
    else await expect(await canvas.findByRole("link", { name: "마이페이지" })).toHaveAttribute("href", "/mypage");
    await expect(headerRequests).toEqual([{ method: "GET", pathname: "/api/users/me", query: "", body: "", credentials: "include" }]);
  },
};
export const Unverified: Story = {
  parameters: { msw: { handlers: headerUserHandlers("unverified") } },
  /** 미인증도 로그인 계정으로 표시하는 기존 계약을 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole(window.innerWidth < 768 ? "button" : "link", { name: window.innerWidth < 768 ? "계정 메뉴" : "마이페이지" })).toBeVisible();
  },
};
export const LoggedOut: Story = {
  parameters: { msw: { handlers: headerUserHandlers("anonymous") } },
  /** 비로그인 상태의 로그인·가입 경로를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(/** 사용자 조회가 발생했는지 확인한다. */ () => expect(headerRequests).toHaveLength(1));
    if (window.innerWidth >= 768) await expect(canvas.getByRole("link", { name: "회원가입" })).toHaveAttribute("href", "/login");
    await expect(canvas.getAllByRole("link", { name: "로그인" })[0]).toHaveAttribute("href", "/login");
  },
};
export const Unauthorized: Story = { ...LoggedOut, parameters: { msw: { handlers: headerUserHandlers("unauthorized") } } };
export const QueryFailure: Story = { ...LoggedOut, parameters: { msw: { handlers: headerUserHandlers("failure") } } };
export const Pending: Story = {
  parameters: { msw: { handlers: headerUserHandlers("pending") } },
  /** 조회 지연과 응답 완료를 직접 조작하는 예제를 제공한다. */
  render: () => <><AppHeader /><button type="button" onClick={releaseHeaderUser}>사용자 응답 완료</button></>,
  /** 지연 중 기존 로그인 UI가 유지되는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(/** 실제 요청이 대기 상태에 도달했는지 확인한다. */ () => expect(headerRequests).toHaveLength(1));
    await expect(canvas.getAllByRole("link", { name: "로그인" })[0]).toBeVisible();
    await expect(canvas.queryByRole("link", { name: "마이페이지" })).not.toBeInTheDocument();
  },
};
export const Search: Story = {
  /** 연속 검색 입력의 focus, trim URL과 빈 검색 URL을 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.innerWidth < 768) {
      await expect(canvas.getByRole("link", { name: "프로젝트 검색" })).toHaveAttribute("href", "/projects");
      return;
    }
    const input = canvas.getByRole("textbox", { name: "프로젝트 검색" });
    await userEvent.type(input, "  캠퍼스 검색  ");
    await expect(input).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(getRouter().push).toHaveBeenLastCalledWith("/projects?keyword=" + encodeURIComponent("캠퍼스 검색").replace(/%20/g, "+"));
    await userEvent.clear(input);
    await userEvent.type(input, "   ");
    await userEvent.keyboard("{Enter}");
    await expect(getRouter().push).toHaveBeenLastCalledWith("/projects");
    await expect(getRouter().push).toHaveBeenCalledTimes(2);
  },
};
export const MobileMenu: Story = {
  globals: { viewport: { value: "campus375", isRotated: false } },
  parameters: { docs: { description: { story: "375px에서 계정 메뉴를 수동으로 여는 예제입니다. 실제 별도 headless 검사에서 767/768 전환·Escape·focus·scroll lock 해제를 확인했습니다. 현재 Vite Next Link mock은 preventDefault를 Radix onClick보다 먼저 호출하여 링크 선택 뒤 메뉴가 남습니다. href와 click 활성화는 확인되지만 실제 경로 이동·선택 후 자동 닫힘은 검증되지 않았습니다. 제품 성공으로 해석하지 않습니다. 열린 portal 메뉴의 별도 axe 검사에서는 aria-hidden-focus가 보고되어 접근성 미완료입니다. 이 스토리의 기본 닫힌 상태 error 검사와 열린 상태의 제한을 구분합니다. toolbar 설정만으로 자동 검사 폭이 바뀌었다고 판단하지 않습니다." } } },
};
export const AlternatePath: Story = {
  parameters: { nextjs: { navigation: { pathname: "/mypage/projects" } } },
  /** 다른 pathname에서도 조회와 계정 표시가 동작하는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    if (window.innerWidth < 768) await expect(await canvas.findByRole("button", { name: "계정 메뉴" })).toBeVisible();
    else await expect(await canvas.findByRole("link", { name: "마이페이지" })).toHaveAttribute("href", "/mypage");
    await expect(headerRequests).toHaveLength(1);
  },
};




