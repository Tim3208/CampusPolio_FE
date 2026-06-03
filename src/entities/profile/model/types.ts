export type Profile = {
  profileId: number
  userId: number
  name: string
  nickname: string
  bio: string
  major: string
  grade: number | null
  profileImage: string
}

export type ProfileFormValues = {
  name: string
  nickname: string
  bio: string
  major: string
  grade: number | null
  profileImage: string
}

export type ProfileCreatePayload = {
  nickname: string
  bio?: string
}

export type ProfileUpdatePayload = Partial<ProfileFormValues>

export type ProfileCreateResponse = {
  profileId: number
  message?: string
}

export type ProfileUpdateResponse = {
  userId: number
  updatedAt: string
  message?: string
}

export type ProfileApiResponse = {
  profileId: number
  userId: number
  name?: string | null
  nickname?: string | null
  bio?: string | null
  major?: string | null
  grade?: number | null
  profileImage?: string | null
}

/**
 * API 프로필 응답의 선택 필드를 폼에서 쓰기 쉬운 기본값으로 정규화한다.
 * @param profile API에서 받은 프로필 응답
 * @returns 앱 내부 프로필 모델
 */
export function mapProfileApiResponse(profile: ProfileApiResponse): Profile {
  return {
    bio: profile.bio ?? "",
    grade: profile.grade ?? null,
    major: profile.major ?? "",
    name: profile.name ?? "",
    nickname: profile.nickname ?? "",
    profileId: profile.profileId,
    profileImage: profile.profileImage ?? "",
    userId: profile.userId,
  }
}

/**
 * 프로필 모델을 설정 폼 초기값으로 변환한다.
 * @param profile 조회된 프로필. 없으면 빈 프로필 폼 값
 * @returns 프로필 설정 폼 값
 */
export function createProfileFormValues(
  profile?: Profile | null
): ProfileFormValues {
  return {
    bio: profile?.bio ?? "",
    grade: profile?.grade ?? null,
    major: profile?.major ?? "",
    name: profile?.name ?? "",
    nickname: profile?.nickname ?? "",
    profileImage: profile?.profileImage ?? "",
  }
}
