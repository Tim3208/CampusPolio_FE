export type User = {
  id: number
  email: string
  isVerified: boolean
}

export type UserApiResponse = {
  id: number
  email: string
  universityVerified: boolean
}

/**
 * 백엔드 사용자 응답을 프론트 내부 사용자 모델로 변환한다.
 * @param user API에서 받은 사용자 응답
 * @returns 앱 내부에서 사용하는 사용자 정보
 */
export function mapUserApiResponse(user: UserApiResponse): User {
  return {
    id: user.id,
    email: user.email,
    isVerified: user.universityVerified,
  }
}
