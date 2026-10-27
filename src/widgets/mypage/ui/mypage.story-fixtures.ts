import type { MyProject } from "@/entities/project";
import type { MyPortfolio } from "@/entities/portfolio";

export const mypageNow = "2026-10-26T12:00:00+09:00";
export const mypageImage = "/storybook/project-fixture.svg";
export const failedMypageImage = "/storybook/mypage-missing-image.svg";

export const mypageProjects: MyProject[] = [
  { projectId: 6101, title: "캠퍼스 길찾기", thumbnailUrl: mypageImage, tags: ["웹", "접근성"], updatedAt: "2026-10-26T11:35:00+09:00", status: "PUBLISHED", role: "OWNER" },
  { projectId: 6102, title: "졸업 작품 초안", thumbnailUrl: null, tags: [], updatedAt: "2026-10-25T12:00:00+09:00", status: "DRAFT", role: "OWNER" },
];
export const longMypageProjects: MyProject[] = [
  { ...mypageProjects[0], title: "교내 구성원 모두가 함께 만드는 접근성 중심의 캠퍼스 정보 공유 프로젝트 ".repeat(5), tags: ["아주긴태그".repeat(20), "웹", "디자인"], thumbnailUrl: failedMypageImage },
  { ...mypageProjects[1], title: "띄어쓰기없는아주긴프로젝트제목".repeat(15) },
];
export const mypagePortfolios: MyPortfolio[] = [
  { portfolioId: 6201, title: "프론트엔드 포트폴리오", slug: "campus-frontend", description: "가상 프로젝트 세 개를 모은 공개 포트폴리오입니다.", thumbnailUrl: mypageImage, isPublic: true, projectCount: 3, createdAt: "2026-10-01T12:00:00+09:00", updatedAt: "2026-10-26T10:00:00+09:00" },
  { portfolioId: 6202, title: "나의 비공개 포트폴리오", slug: "private-draft", description: "", thumbnailUrl: null, isPublic: false, projectCount: 0, createdAt: "2026-10-01T12:00:00+09:00", updatedAt: "2026-10-18T12:00:00+09:00" },
];
export const longMypagePortfolios: MyPortfolio[] = [
  { ...mypagePortfolios[0], title: "캠퍼스 생활에서 발견한 문제와 해결 과정을 모은 포트폴리오 ".repeat(6), description: "프로젝트의 문제 정의와 팀 협업 과정, 구현 및 검증 결과를 소개합니다. ".repeat(20), projectCount: 123 },
  { ...mypagePortfolios[1], title: "띄어쓰기없는긴포트폴리오제목".repeat(15) },
];

export const mypageTimeCases = [
  { updatedAt: "2026-10-26T12:00:00+09:00", label: "업데이트: 1분 전" },
  { updatedAt: "2026-10-26T11:01:00+09:00", label: "업데이트: 59분 전" },
  { updatedAt: "2026-10-26T11:00:00+09:00", label: "업데이트: 1시간 전" },
  { updatedAt: "2026-10-25T12:00:00+09:00", label: "업데이트: 어제" },
  { updatedAt: "2026-10-23T12:00:00+09:00", label: "업데이트: 3일 전" },
  { updatedAt: "2026-10-19T12:00:00+09:00", label: "업데이트: 일주일 전" },
  { updatedAt: "2026-10-12T12:00:00+09:00", label: "업데이트: 2026년 10월 12일" },
];
export const mypageMenu = [
  { label: "프로젝트 모음", href: "/mypage/projects" },
  { label: "포트폴리오 모음", href: "/mypage/portfolios" },
  { label: "설정", href: "/mypage/settings" },
  { label: "지원", href: "/mypage/support" },
];
