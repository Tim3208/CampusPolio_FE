import type { HomeData, HomeProject } from "@/entities/project";
import { http, HttpResponse } from "msw";

const localImage = "/storybook/project-fixture.svg";

export const homePageProjects = {
  engineering: { projectId: 9301, title: "가상 캠퍼스 에너지 지도", thumbnailUrl: localImage, tag: "공학", authorName: "가상 에너지팀", viewCount: 1250, likeCount: 42 },
  engineeringSecond: { projectId: 9302, title: "가상 스마트 도서관", thumbnailUrl: localImage, tag: "공학", authorName: "가상 도서관팀", viewCount: 860, likeCount: 28 },
  design: { projectId: 9303, title: "가상 캠퍼스 안내 디자인", thumbnailUrl: localImage, tag: "시각 디자인", authorName: "가상 디자인팀", viewCount: 730, likeCount: 35 },
  featured: { projectId: 9304, title: "가상 학생 작품 아카이브", thumbnailUrl: localImage, tag: "졸업작품", authorName: "가상 아카이브팀", viewCount: 2450, likeCount: 93 },
} satisfies Record<string, HomeProject>;

export const normalHomeData = {
  popularProjects: [homePageProjects.featured, homePageProjects.engineering, homePageProjects.design, homePageProjects.engineeringSecond],
  categories: [
    { tag: "공학", projects: [homePageProjects.engineering, homePageProjects.engineeringSecond] },
    { tag: "시각 디자인", projects: [homePageProjects.design] },
    { tag: "건축학", projects: [] },
  ],
} satisfies HomeData;

export const emptyHomeData = { popularProjects: [], categories: [] } satisfies HomeData;

export const homeCtaImageUrls = [
  "https://picsum.photos/seed/campuspolio-studio-desk/720/405",
  "https://picsum.photos/seed/campuspolio-studio-desk/900/560",
] as const;

// 제품의 picture URL은 보존하고 이 스토리에서만 같은 출처의 고정 SVG 바이트로 응답한다.
export const homeCtaImageHandlers = homeCtaImageUrls.map(
  /** 두 반응형 CTA 사진 요청을 정확한 URL별로 가로챈다. */
  (url) => http.get(url,
    /** 외부 사진 대신 기존 Storybook 로컬 fixture를 반환한다. */
    async () => {
      const response = await fetch(localImage);
      if (!response.ok) return HttpResponse.error();
      return new HttpResponse(await response.arrayBuffer(), {
        headers: { "Content-Type": "image/svg+xml", "X-Storybook-Fixture": "home-cta-local" },
      });
    },
  ),
);
