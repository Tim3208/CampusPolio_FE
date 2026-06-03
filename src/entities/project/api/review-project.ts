import { apiRequest } from "@/shared/api"

import type { ProjectReview } from "../model/types"

/**
 * 프로젝트에 대한 AI 코드 리뷰를 요청한다.
 * @param projectId 리뷰할 프로젝트 ID
 * @returns AI 코드 리뷰 결과
 */
export async function reviewProject(projectId: number) {
  const response = await apiRequest<ProjectReview>(
    `/api/projects/${projectId}/review` as `/${string}`,
    {
      method: "POST",
    }
  )

  if (!response.data) {
    throw new Error("AI 코드 리뷰 응답이 비어 있습니다.")
  }

  return {
    totalScore: response.data.totalScore ?? 0,
    summary: response.data.summary ?? "",
    categories: Array.isArray(response.data.categories)
      ? response.data.categories
      : [],
    criticalIssues: Array.isArray(response.data.criticalIssues)
      ? response.data.criticalIssues
      : [],
    warnings: Array.isArray(response.data.warnings)
      ? response.data.warnings
      : [],
    strengths: Array.isArray(response.data.strengths)
      ? response.data.strengths
      : [],
    interviewQuestions: Array.isArray(response.data.interviewQuestions)
      ? response.data.interviewQuestions
      : [],
    refactoringSuggestions: Array.isArray(
      response.data.refactoringSuggestions
    )
      ? response.data.refactoringSuggestions
      : [],
  }
}
