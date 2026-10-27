import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, fn, userEvent, within } from "storybook/test";
import { ProjectCollectionPage } from "./project-collection-page";
import { collectionHrefs, emptyPage, filteredPage, filteredQuery, firstGridPage, firstListPage } from "./project-collection-page.story-fixtures";
import { expectCollectionFilterClosed, expectCollectionLayout, expectCollectionPush, openCollectionFilter, resetCollectionStory } from "./project-collection-page.story-helpers";

const meta = {
  title: "Widgets/ProjectCollection/ProjectCollectionPage",
  component: ProjectCollectionPage,
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "실제 탐색 UI에 projectsPage/query/viewMode/errorMessage fixture를 전달합니다. 고정 play는 URL 요청·href·표시·키보드를 검사합니다. 라우터 mock은 query props와 결과를 갱신하지 않으며 app/page 서버 조회·SSR·실제 API 성공을 뜻하지 않습니다. Playground에서는 자동 조작 없이 props를 바꿉니다. viewport toolbar와 자동 검사의 실제 viewport는 독립 설정입니다. api.md의 정렬 설명은 POPULAR지만 enum과 현재 제품은 VIEW_COUNT이며 이 스토리는 계약을 변경하지 않습니다." } },
  },
  args: { projectsPage: firstGridPage, query: { page: 0, size: 6, filterType: "LATEST" }, viewMode: "grid" },
  argTypes: {
    projectsPage: { control: "object", description: "이미 조회된 결과 fixture. page는 0부터, 화면 번호는 1부터 표시합니다." },
    query: { control: "object", description: "현재 적용된 검색 조건. 라우터 호출만으로 바뀌지 않습니다." },
    viewMode: { control: "inline-radio", options: ["grid", "list"], description: "결과의 grid/list 표시 방식" },
    errorMessage: { control: "text", description: "값이 있으면 결과 대신 제품의 고정 조회 오류 안내를 표시합니다." },
  },
  /** 각 스토리의 페이지 상태와 라우터 기록을 독립적으로 준비한다. */
  beforeEach() {
    resetCollectionStory();
    return resetCollectionStory;
  },
  /** 스토리 이동 때만 새 UI 인스턴스를 만들어 이전 입력을 남기지 않는다. */
  render(args, context) {
    return <ProjectCollectionPage key={context.id} {...args} />;
  },
} satisfies Meta<typeof ProjectCollectionPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: { docs: { description: { story: "자유 조작 전용입니다. 검색·태그·정렬은 라우터 Actions를 만들고 결과는 전달한 fixture를 유지합니다. Controls의 Reset으로 props를 복원할 수 있습니다." } } },
};

export const GridFirstPage: Story = {
  /** 첫 페이지의 결과·기본값 생략·이전 비활성·실제 반응형 열을 검사한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "프로젝트 모음" })).toBeVisible();
    await expect(canvasElement.querySelectorAll("[data-project-card]")).toHaveLength(6);
    await expect(canvasElement.querySelectorAll("[data-project-list-item]")).toHaveLength(0);
    await expect(canvas.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
    await expect(canvas.getByRole("link", { name: "1페이지" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "다음 페이지" })).toHaveAttribute("href", "/projects?page=1");
    await expect(canvas.getByRole("link", { name: "리스트 보기" })).toHaveAttribute("href", "/projects?view=list");
    await expect(canvasElement.querySelector("[data-project-card]")).toHaveAttribute("href", "/projects/9401");
    await expectCollectionLayout(canvasElement);
  },
};

export const ListFirstPage: Story = {
  args: { projectsPage: firstListPage, query: { page: 0, size: 9 }, viewMode: "list" },
  /** 목록 아홉 개와 목록 보기를 보존하는 페이지 링크를 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll("[data-project-list-item]")).toHaveLength(9);
    await expect(canvasElement.querySelectorAll("[data-project-card]")).toHaveLength(0);
    await expect(canvas.getByRole("link", { name: "다음 페이지" })).toHaveAttribute("href", "/projects?page=1&view=list");
    await expect(canvas.getByRole("link", { name: "그리드 보기" })).toHaveAttribute("href", "/projects");
    await expectCollectionLayout(canvasElement);
  },
};

export const MiddlePage: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  /** 페이지 이동·보기 변경·chip 제거·전체 초기화의 정확한 href를 대조한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "3페이지" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "이전 페이지" })).toHaveAttribute("href", collectionHrefs.previous);
    await expect(canvas.getByRole("link", { name: "다음 페이지" })).toHaveAttribute("href", collectionHrefs.next);
    await expect(canvas.getByRole("link", { name: "그리드 보기" })).toHaveAttribute("href", collectionHrefs.grid);
    await expect(canvas.getByRole("link", { name: "검색어: story book 해제" })).toHaveAttribute("href", collectionHrefs.keywordRemoved);
    await expect(canvas.getByRole("link", { name: "공학 해제" })).toHaveAttribute("href", collectionHrefs.engineeringRemoved);
    await expect(canvas.getByRole("link", { name: "전체 조건 초기화" })).toHaveAttribute("href", "/projects?view=list");
    await expectCollectionLayout(canvasElement);
  },
};

export const LastPage: Story = {
  args: { projectsPage: { ...firstGridPage, page: 4 }, query: { page: 4 } },
  /** 마지막 페이지의 다음 버튼과 마지막 번호를 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "다음 페이지" })).toBeDisabled();
    await expect(canvas.getByRole("link", { name: "5페이지" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("link", { name: "이전 페이지" })).toHaveAttribute("href", "/projects?page=3");
  },
};

export const LinkActions: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  parameters: { docs: { description: { story: "next/link는 framework의 별도 Link action으로 처리됩니다. Enter로 발생한 실제 click과 href를 확인하며 useRouter.push 호출이나 실제 페이지 이동으로 해석하지 않습니다." } } },
  /** 실제 링크의 Enter 클릭과 href를 대조하고 fixture 유지 경계를 확인한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    const actions = [
      ["다음 페이지", collectionHrefs.next],
      ["그리드 보기", collectionHrefs.grid],
      ["리스트 보기", collectionHrefs.filtered],
      ["공학 해제", collectionHrefs.engineeringRemoved],
      ["검색어: story book 해제", collectionHrefs.keywordRemoved],
      ["전체 조건 초기화", "/projects?view=list"],
    ];
    for (const [name, href] of actions) {
      const link = canvas.getByRole("link", { name });
      const click = fn();
      link.addEventListener("click", click);
      try {
        link.focus();
        await userEvent.keyboard("{Enter}");
        await expect(click).toHaveBeenCalledTimes(1);
        await expect(link).toHaveAttribute("href", href);
      } finally {
        link.removeEventListener("click", click);
      }
    }
    await expect(getRouter().push).not.toHaveBeenCalled();
    await expect(canvas.getByRole("link", { name: "3페이지" })).toHaveAttribute("aria-current", "page");
    await expect(canvasElement.querySelectorAll("[data-project-list-item]")).toHaveLength(9);
  },
};

export const ManyPages: Story = {
  args: { projectsPage: { ...firstGridPage, page: 9, totalPages: 20, totalElements: 120 }, query: { page: 9 } },
  /** 많은 페이지는 양 끝과 현재 주변 번호 및 두 생략 기호만 표시한다. */
  async play({ canvasElement }) {
    const nav = within(within(canvasElement).getByRole("navigation", { name: "프로젝트 페이지" }));
    for (const label of ["1페이지", "9페이지", "10페이지", "11페이지", "20페이지"]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(nav.getAllByText("…")).toHaveLength(2);
    await expect(nav.queryByRole("link", { name: "2페이지" })).not.toBeInTheDocument();
    await expect(nav.getByRole("link", { name: "10페이지" })).toHaveAttribute("aria-current", "page");
  },
};

export const EmptyGrid: Story = {
  args: { projectsPage: { ...emptyPage, size: 6 }, query: { keyword: "없는 결과" } },
  /** 빈 결과는 결과 카드나 페이지 없이 grid 초기화 링크를 제공한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "조건에 맞는 프로젝트가 없어요" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "전체 조건 초기화" })).toHaveAttribute("href", "/projects");
    await expect(canvas.queryByRole("navigation", { name: "프로젝트 페이지" })).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-project-card], [data-project-list-item]")).toBeNull();
    await expectCollectionLayout(canvasElement);
  },
};

export const EmptyList: Story = {
  args: { projectsPage: emptyPage, query: { ...filteredQuery, page: 0 }, viewMode: "list" },
  /** 빈 목록에서도 전체 초기화가 list를 보존하고 오류 안내와 섞이지 않는다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "조건에 맞는 프로젝트가 없어요" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "전체 조건 초기화" })).toHaveAttribute("href", "/projects?view=list");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-project-card], [data-project-list-item]")).toBeNull();
  },
};

export const QueryError: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list", errorMessage: "가상 조회 실패" },
  /** 오류가 남은 결과와 조건 chip을 숨기며 재시도는 refresh 한 번만 요청한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("프로젝트 목록을 불러오지 못했어요");
    await expect(canvas.queryByText("조건에 맞는 프로젝트가 없어요")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("link", { name: "공학 해제" })).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-project-card], [data-project-list-item]")).toBeNull();
    const retry = canvas.getByRole("button", { name: "다시 시도" });
    retry.focus();
    await userEvent.keyboard("{Enter}");
    await expect(getRouter().refresh).toHaveBeenCalledTimes(1);
    await expect(getRouter().push).not.toHaveBeenCalled();
    await expect(canvas.getByRole("alert")).toBeVisible();
  },
};

export const SearchTrim: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  /** 연속 입력의 포커스와 trim·반복 태그·첫 페이지 생략을 Enter로 검증한다. */
  async play({ canvasElement }) {
    const input = within(canvasElement).getByRole("textbox", { name: "프로젝트 검색" });
    await userEvent.clear(input);
    await userEvent.type(input, "  story book  ");
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue("  story book  ");
    await userEvent.keyboard("{Enter}");
    await expectCollectionPush(collectionHrefs.filtered);
    await expect(within(canvasElement).getByRole("link", { name: "3페이지" })).toHaveAttribute("aria-current", "page");
  },
};

export const BlankSearch: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  /** 공백 검색은 keyword를 생략하고 나머지 조건은 보존한다. */
  async play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByRole("textbox", { name: "프로젝트 검색" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "프로젝트 검색" }), "   ");
    await userEvent.click(canvas.getByRole("button", { name: "검색" }));
    await expectCollectionPush(collectionHrefs.keywordRemoved);
  },
};

export const SortLatest: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  /** 최신 정렬로 바꾸면 기본 정렬과 page0이 URL에서 생략된다. */
  async play({ canvasElement }) {
    await userEvent.selectOptions(within(canvasElement).getByRole("combobox", { name: "정렬 방식" }), "LATEST");
    await expectCollectionPush(collectionHrefs.latest);
  },
};

export const SortViewCount: Story = {
  args: { projectsPage: { ...firstGridPage, page: 2 }, query: { page: 2, filterType: "LATEST" } },
  /** 조회순의 실제 enum은 VIEW_COUNT이며 조건 변경 시 현재 page를 버린다. */
  async play({ canvasElement }) {
    await userEvent.selectOptions(within(canvasElement).getByRole("combobox", { name: "정렬 방식" }), "VIEW_COUNT");
    await expectCollectionPush("/projects?filterType=VIEW_COUNT");
  },
};

export const FiltersAtCurrentWidth: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  parameters: { docs: { description: { story: "실제 viewport가 1024 미만이면 초안 reset·닫기·Escape·외부 클릭 취소와 재열기를 확인하고 마지막에 적용합니다. 1024 이상이면 데스크톱 태그의 즉시 적용을 검사합니다. 자동 검증은 각 실제 폭으로 별도 실행합니다." } } },
  /** 현재 실제 폭에서 즉시 적용 또는 세 가지 취소·초안 복원·한 번 적용을 검증한다. */
  async play({ canvasElement }) {
    if (window.innerWidth >= 1024) {
      await userEvent.click(within(canvasElement).getByRole("checkbox", { name: "공학" }));
      await expectCollectionPush(collectionHrefs.engineeringRemoved);
      return;
    }
    for (const closeMode of ["button", "escape", "outside"]) {
      const sheet = await openCollectionFilter(canvasElement);
      await userEvent.click(sheet.getByRole("checkbox", { name: "건축학" }));
      await expect(sheet.getByRole("checkbox", { name: "건축학" })).toHaveFocus();
      await userEvent.click(sheet.getByRole("button", { name: "선택 초기화" }));
      await expect(sheet.getByRole("checkbox", { name: "공학" })).not.toBeChecked();
      await expect(getRouter().push).not.toHaveBeenCalled();
      if (closeMode === "button") await userEvent.click(sheet.getByRole("button", { name: "닫기" }));
      else if (closeMode === "escape") await userEvent.keyboard("{Escape}");
      else {
        const overlay = canvasElement.ownerDocument.querySelector<HTMLElement>('[data-slot="sheet-overlay"]');
        if (!overlay) throw new Error("실제 Sheet overlay가 없습니다.");
        await userEvent.click(overlay);
      }
      await expectCollectionFilterClosed(canvasElement);
      await expect(getRouter().push).not.toHaveBeenCalled();
    }
    const sheet = await openCollectionFilter(canvasElement);
    await userEvent.click(sheet.getByRole("checkbox", { name: "공학" }));
    await userEvent.click(sheet.getByRole("button", { name: "적용하기 (1)" }));
    await expectCollectionPush(collectionHrefs.engineeringRemoved);
    await expectCollectionFilterClosed(canvasElement);
    // mock 요청은 fixture를 갱신하지 않으므로 다시 열면 원래 두 태그가 남는다.
    await openCollectionFilter(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expectCollectionFilterClosed(canvasElement);
  },
};

export const OpenFilterAtCurrentWidth: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  parameters: { docs: { description: { story: "1024 미만에서 Sheet를 열어 둔 접근성·시각 확인 상태입니다. 큰 폭에서는 기존 데스크톱 필터를 표시합니다." } } },
  /** 작은 폭에서는 portal을 열어 둔 채 addon 접근성 검사를 받는다. */
  async play({ canvasElement }) {
    if (window.innerWidth < 1024) await openCollectionFilter(canvasElement);
    else await expectCollectionLayout(canvasElement);
  },
};

export const ClearAllTags: Story = {
  args: { projectsPage: filteredPage, query: filteredQuery, viewMode: "list" },
  /** 모바일 초안 전체 해제 적용과 데스크톱 선택 해제의 URL 경계를 확인한다. */
  async play({ canvasElement }) {
    if (window.innerWidth < 1024) {
      const sheet = await openCollectionFilter(canvasElement);
      await userEvent.click(sheet.getByRole("button", { name: "선택 초기화" }));
      await userEvent.click(sheet.getByRole("button", { name: "적용하기 (0)" }));
      await expectCollectionPush(collectionHrefs.tagsCleared);
      await expectCollectionFilterClosed(canvasElement);
    } else {
      await userEvent.click(within(canvasElement).getByRole("checkbox", { name: "건축학" }));
      await expectCollectionPush(collectionHrefs.architectureAdded);
    }
  },
};
