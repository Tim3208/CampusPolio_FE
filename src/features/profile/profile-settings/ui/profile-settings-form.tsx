"use client"

import { type FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, Save, UserRound } from "lucide-react"

import {
  createProfile,
  createProfileFormValues,
  updateProfile,
  type Profile,
  type ProfileFormValues,
} from "@/entities/profile"
import { ApiError } from "@/shared/api"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

const BIO_MAX_LENGTH = 500
const MIN_GRADE = 1
const MAX_GRADE = 6

type ProfileSettingsFormProps = {
  profile?: Profile | null
}

type FormStatus = {
  message: string
  tone: "error" | "success"
} | null

/**
 * API 오류를 프로필 설정 화면에 표시할 문구로 변환한다.
 * @param error API 또는 일반 오류
 * @returns 사용자 안내 문구
 */
function getProfileSaveErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "로그인이 필요합니다. 다시 로그인한 뒤 시도해주세요."
    }

    if (error.status === 400) {
      return error.message || "입력한 프로필 정보를 다시 확인해주세요."
    }

    if (error.status === 404) {
      return "프로필을 찾지 못했습니다. 새로고침 후 다시 시도해주세요."
    }

    if (error.status === 409) {
      return "이미 프로필이 있습니다. 화면을 새로고침한 뒤 수정해주세요."
    }

    return error.message || "프로필 저장에 실패했습니다."
  }

  return error instanceof Error
    ? error.message
    : "프로필 저장에 실패했습니다."
}

/**
 * 폼 값을 API에 보내기 전에 공백과 빈 값을 정리한다.
 * @param values 현재 폼 값
 * @returns 정규화된 프로필 폼 값
 */
function normalizeProfileValues(values: ProfileFormValues): ProfileFormValues {
  return {
    bio: values.bio.trim(),
    grade: values.grade,
    major: values.major.trim(),
    name: values.name.trim(),
    nickname: values.nickname.trim(),
    profileImage: values.profileImage.trim(),
  }
}

/**
 * 프로필 생성 API에 없는 필드가 입력되었는지 확인한다.
 * @param values 정규화된 프로필 폼 값
 * @returns 생성 후 추가 PATCH 호출 필요 여부
 */
function hasUpdateOnlyValues(values: ProfileFormValues) {
  return Boolean(
    values.name || values.major || values.profileImage || values.grade !== null
  )
}

/**
 * 프로필 폼 값을 검증하고 오류 문구를 반환한다.
 * @param values 정규화된 프로필 폼 값
 * @returns 오류 문구. 유효하면 null
 */
function getProfileValidationError(values: ProfileFormValues) {
  if (!values.nickname) {
    return "닉네임을 입력해주세요."
  }

  if (values.nickname.length > 30) {
    return "닉네임은 30자 이하로 입력해주세요."
  }

  if (values.name.length > 30) {
    return "이름은 30자 이하로 입력해주세요."
  }

  if (values.major.length > 50) {
    return "전공은 50자 이하로 입력해주세요."
  }

  if (values.bio.length > BIO_MAX_LENGTH) {
    return "자기소개는 500자 이하로 입력해주세요."
  }

  if (
    values.grade !== null &&
    (values.grade < MIN_GRADE || values.grade > MAX_GRADE)
  ) {
    return "학년은 1학년부터 6학년까지 선택할 수 있습니다."
  }

  return null
}

/**
 * 마이페이지 설정 탭의 프로필 생성/수정 폼을 렌더링한다.
 * @param props 기존 프로필 정보
 * @returns 프로필 설정 폼 UI
 */
export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<ProfileFormValues>(() =>
    createProfileFormValues(profile)
  )
  const [hasProfile, setHasProfile] = useState(Boolean(profile))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<FormStatus>(null)
  const bioLength = values.bio.length
  const profileInitial = useMemo(() => {
    const source = values.nickname || values.name || "?"

    return source.trim().charAt(0).toUpperCase()
  }, [values.name, values.nickname])

  /**
   * 문자열 입력 필드 값을 갱신한다.
   * @param field 변경할 프로필 필드
   * @param value 입력된 문자열 값
   */
  function updateTextValue(
    field: Exclude<keyof ProfileFormValues, "grade">,
    value: string
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  /**
   * 학년 입력 값을 숫자 또는 빈 값으로 갱신한다.
   * @param value 입력된 학년 문자열
   */
  function updateGradeValue(value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      grade: value ? Number(value) : null,
    }))
  }

  /**
   * 프로필 생성 또는 수정을 API에 요청한다.
   * @param event 폼 제출 이벤트
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedValues = normalizeProfileValues(values)
    const validationError = getProfileValidationError(normalizedValues)

    if (validationError) {
      setStatus({
        message: validationError,
        tone: "error",
      })
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      if (hasProfile) {
        const response = await updateProfile(normalizedValues)

        setStatus({
          message: response.message || "프로필이 저장되었습니다.",
          tone: "success",
        })
      } else {
        const createResponse = await createProfile({
          bio: normalizedValues.bio,
          nickname: normalizedValues.nickname,
        })

        if (hasUpdateOnlyValues(normalizedValues)) {
          const updateResponse = await updateProfile(normalizedValues)

          setStatus({
            message:
              updateResponse.message ||
              createResponse.message ||
              "프로필이 저장되었습니다.",
            tone: "success",
          })
        } else {
          setStatus({
            message: createResponse.message || "프로필이 생성되었습니다.",
            tone: "success",
          })
        }

        setHasProfile(true)
      }

      setValues(normalizedValues)
      router.refresh()
    } catch (error) {
      setStatus({
        message: getProfileSaveErrorMessage(error),
        tone: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#171f24]">
            프로필 정보
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            프로젝트와 포트폴리오에 표시될 기본 정보를 관리합니다.
          </p>
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-md bg-main-10 px-4 text-sm font-bold text-white hover:bg-main-11"
        >
          <Save className="size-4" aria-hidden="true" />
          {isSubmitting ? "저장 중" : "저장"}
        </Button>
      </div>

      {status ? (
        <div
          className={cn(
            "mt-6 flex items-start gap-2 rounded-md px-4 py-3 text-sm",
            status.tone === "success"
              ? "bg-main-22 text-main-02"
              : "bg-red-50 text-red-600"
          )}
          role={status.tone === "error" ? "alert" : "status"}
        >
          {status.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          )}
          <span>{status.message}</span>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name" className="font-bold text-main-10">
              이름
            </Label>
            <Input
              id="profile-name"
              value={values.name}
              maxLength={30}
              onChange={(event) => updateTextValue("name", event.target.value)}
              placeholder="홍길동"
              className="h-11 rounded-md bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-nickname" className="font-bold text-main-10">
              닉네임
            </Label>
            <Input
              id="profile-nickname"
              required
              value={values.nickname}
              maxLength={30}
              onChange={(event) =>
                updateTextValue("nickname", event.target.value)
              }
              placeholder="길동이"
              className="h-11 rounded-md bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-major" className="font-bold text-main-10">
              전공
            </Label>
            <Input
              id="profile-major"
              value={values.major}
              maxLength={50}
              onChange={(event) => updateTextValue("major", event.target.value)}
              placeholder="컴퓨터공학과"
              className="h-11 rounded-md bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-grade" className="font-bold text-main-10">
              학년
            </Label>
            <select
              id="profile-grade"
              value={values.grade ?? ""}
              onChange={(event) => updateGradeValue(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">선택 안 함</option>
              {Array.from({ length: MAX_GRADE }, (_, index) => index + 1).map(
                (grade) => (
                  <option key={grade} value={grade}>
                    {grade}학년
                  </option>
                )
              )}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="profile-image"
              className="font-bold text-main-10"
            >
              프로필 이미지 URL
            </Label>
            <Input
              id="profile-image"
              type="url"
              value={values.profileImage}
              onChange={(event) =>
                updateTextValue("profileImage", event.target.value)
              }
              placeholder="https://example.com/profile.png"
              className="h-11 rounded-md bg-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="profile-bio" className="font-bold text-main-10">
                자기소개
              </Label>
              <span
                className={cn(
                  "text-xs font-medium",
                  bioLength > BIO_MAX_LENGTH ? "text-red-600" : "text-slate-500"
                )}
              >
                {bioLength}/{BIO_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="profile-bio"
              value={values.bio}
              maxLength={BIO_MAX_LENGTH}
              onChange={(event) => updateTextValue("bio", event.target.value)}
              placeholder="진행 중인 프로젝트, 관심 분야, 협업 가능한 주제를 적어주세요."
              className="min-h-36 w-full resize-y rounded-md border border-input bg-white px-3 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="flex size-28 items-center justify-center overflow-hidden rounded-lg bg-main-22 text-3xl font-extrabold text-main-02">
            {values.profileImage ? (
              <div
                aria-label="프로필 이미지 미리보기"
                className="size-full bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${values.profileImage})` }}
              />
            ) : (
              <span>{profileInitial}</span>
            )}
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#171f24]">
              <UserRound className="size-4 text-main-10" aria-hidden="true" />
              {values.nickname || "닉네임 미입력"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {[values.major, values.grade ? `${values.grade}학년` : ""]
                .filter(Boolean)
                .join(" · ") || "전공과 학년을 입력하면 여기에 표시됩니다."}
            </p>
          </div>
        </aside>
      </div>
    </form>
  )
}
