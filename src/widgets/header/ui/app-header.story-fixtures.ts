import type { UserApiResponse } from "@/entities/user";

export const verifiedHeaderUser = {
  id: 51, email: "storybook@example.invalid", universityVerified: true,
} satisfies UserApiResponse;
export const unverifiedHeaderUser: UserApiResponse = { ...verifiedHeaderUser, universityVerified: false };
export const headerAccountLinks = [
  { name: "내 프로젝트", href: "/mypage/projects" },
  { name: "내 포트폴리오", href: "/mypage/portfolios" },
  { name: "프로필 설정", href: "/mypage/settings" },
  { name: "프로젝트 등록", href: "/projects/new" },
];

