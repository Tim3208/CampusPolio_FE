import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, within } from "storybook/test";
import { mypageMenu, mypageNow } from "./mypage.story-fixtures";

export const cardRoleLimitation = "aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다.";
export const projectTagLimitation = "color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다.";
export const portfolioThumbnailLimitation = "color-contrast: '썸네일 없음'의 #62748e/#e2e8f0 대비 3.86:1이 4.5:1에 미달합니다.";

/** 실제 error 실행에서 발견한 상태만 todo로 공개하고, 동작 PASS와 접근성 미완료를 구분한다. */
export function mypageA11yTodo(reason: string, description = "") {
  return {
    a11y: { test: "todo" as const },
    docs: { description: { story: description + "\n\n접근성 미완료(todo): " + reason + " DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다." } },
  };
}

/** 현재 시각만 고정하고 브라우저 타이머는 유지하며, 종료 시 원래 Date와 스크롤을 복원한다. */
export function prepareMypageStory() {
  const originalDate = globalThis.Date;
  const now = originalDate.parse(mypageNow);
  const scroll = { x: window.scrollX, y: window.scrollY };
  const router = getRouter();
  router.push.mockClear();
  router.replace.mockClear();
  router.refresh.mockClear();
  globalThis.Date = new Proxy(originalDate, {
    /** 인자가 없는 생성만 고정하여 fixture 날짜 파싱과 원래 날짜 포맷을 유지한다. */
    construct(target, args) { return Reflect.construct(target, args.length ? args : [now]); },
    /** Date.now 호출에도 동일한 기준 시각을 제공한다. */
    get(target, key, receiver) {
      return key === "now" ? /** 고정된 현재 시각을 반환한다. */ () => now : Reflect.get(target, key, receiver);
    },
  });
  window.scrollTo(0, 0);
  return /** 스토리 간 시계·라우터 호출·스크롤 누출을 정리한다. */ () => {
    globalThis.Date = originalDate;
    router.push.mockClear();
    router.replace.mockClear();
    router.refresh.mockClear();
    window.scrollTo(scroll.x, scroll.y);
  };
}

/** 보이는 메뉴의 링크·활성 표시와 실제 Tab 순서를 검사한다. */
export async function checkMypageNav(canvasElement: HTMLElement, pathname: string) {
  const canvas = within(canvasElement);
  const nav = canvas.getByRole("navigation", { name: "마이페이지 메뉴" });
  const menu = within(nav);
  for (const item of mypageMenu) {
    const link = menu.getByRole("link", { name: item.label });
    await expect(link).toHaveAttribute("href", item.href);
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      await expect(link).toHaveAttribute("aria-current", "page");
    } else {
      await expect(link).not.toHaveAttribute("aria-current");
    }
  }
  const register = canvas.getByRole("link", { name: "프로젝트 등록" });
  await expect(register).toHaveAttribute("href", "/projects/new");
  const first = menu.getByRole("link", { name: "프로젝트 모음" });
  first.focus();
  await expect(first).toHaveFocus();
  await userEvent.tab();
  await expect(menu.getByRole("link", { name: "포트폴리오 모음" })).toHaveFocus();
  await userEvent.tab();
  await expect(menu.getByRole("link", { name: "설정" })).toHaveFocus();
  await userEvent.tab();
  await expect(menu.getByRole("link", { name: "지원" })).toHaveFocus();
  await userEvent.tab();
  await expect(register).toHaveFocus();
  for (const item of mypageMenu) {
    await checkMypageCreate(menu.getByRole("link", { name: item.label }), item.href);
  }
  await checkMypageCreate(register, "/projects/new");
}

/** 카드 클릭·Enter·Space가 각각 정확히 한 번 같은 mock 경로를 요청하는지 검사한다. */
export async function checkMypageCard(card: HTMLElement, href: string) {
  const push = getRouter().push;
  push.mockClear();
  await userEvent.click(card);
  await expect(push).toHaveBeenCalledTimes(1);
  await expect(push).toHaveBeenCalledWith(href);
  for (const key of ["{Enter}", " "]) {
    push.mockClear();
    card.focus();
    await expect(card).toHaveFocus();
    await userEvent.keyboard(key);
    await expect(push).toHaveBeenCalledTimes(1);
    await expect(push).toHaveBeenCalledWith(href);
  }
  push.mockClear();
  card.focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect(push).not.toHaveBeenCalled();
}

/** Next Link mock의 실제 click·Enter 활성화와 href를 검사한다. 이 mock은 router.push를 호출하지 않는다. */
export async function checkMypageCreate(link: HTMLElement, href: string) {
  await expect(link).toHaveAttribute("href", href);
  const activations: (string | null)[] = [];
  /** 실제 링크 활성 이벤트의 현재 목적지를 기록하며 기본 처리는 바꾸지 않는다. */
  const recordActivation = () => { activations.push(link.getAttribute("href")); };
  link.addEventListener("click", recordActivation);
  try {
    await userEvent.click(link);
    await expect(activations).toEqual([href]);
    activations.length = 0;
    link.focus();
    await expect(link).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(activations).toEqual([href]);
  } finally {
    link.removeEventListener("click", recordActivation);
  }
}
