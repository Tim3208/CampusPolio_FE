import type { Profile, ProfileCreateResponse, ProfileUpdateResponse } from "@/entities/profile";

export const existingProfile: Profile = {
  profileId: 7301, userId: 7101, name: "김캠퍼스", nickname: "캠퍼스개발자",
  bio: "접근하기 쉬운 교내 프로젝트를 만듭니다.", major: "컴퓨터공학과", grade: 3, profileImage: "",
};
export const createdProfile: ProfileCreateResponse = { profileId: 7301, message: "프로필 생성 완료" };
export const updatedProfile: ProfileUpdateResponse = {
  userId: 7101, updatedAt: "2026-10-26T09:00:00+09:00", message: "프로필 수정 완료",
};
export const initialProfiles = ["undefined", "null", "existing"] as const;
export type InitialProfile = typeof initialProfiles[number];
export const profileScenarios = [
  "success", "pending", "fallback", "create-message-fallback", "error400", "error401", "error404", "error409", "error503", "retry", "patch-failure",
] as const;
export type ProfileScenario = typeof profileScenarios[number];
export const profileErrors = {
  error400: "요청을 처리하지 못했습니다.",
  error401: "로그인이 필요합니다. 다시 로그인한 뒤 시도해주세요.",
  error404: "프로필을 찾지 못했습니다. 새로고침 후 다시 시도해주세요.",
  error409: "이미 프로필이 있습니다. 화면을 새로고침한 뒤 수정해주세요.",
  error503: "요청을 처리하지 못했습니다.",
};

/** 선택한 fixture를 실제 공개 프로필 타입 또는 신규 값으로 돌려준다. */
export function getInitialProfile(initial: InitialProfile): Profile | null | undefined {
  return initial === "existing" ? { ...existingProfile } : initial === "null" ? null : undefined;
}
