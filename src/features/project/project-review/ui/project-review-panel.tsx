"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Code2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { reviewProject, type ProjectReview } from "@/entities/project"

type ProjectReviewPanelProps = {
  projectId: number
}

type ReviewListSectionProps<TItem> = {
  title: string
  emptyMessage: string
  items: TItem[]
  renderItem: (item: TItem, index: number) => ReactNode
}

/**
 * 리뷰 점수를 0-100 범위로 보정한다.
 * @param score API에서 받은 점수
 * @returns 표시 가능한 점수
 */
function clampScore(score: number) {
  if (!Number.isFinite(score)) {
    return 0
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * AI 리뷰 결과의 반복 섹션을 렌더링한다.
 * @param props 섹션 제목, 빈 상태 문구, 항목 렌더러
 * @returns 리뷰 결과 목록 UI
 */
function ReviewListSection<TItem>({
  emptyMessage,
  items,
  renderItem,
  title,
}: ReviewListSectionProps<TItem>) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <h3 className="text-[11px] font-black uppercase tracking-wide text-slate-800">
        {title}
      </h3>
      {items.length > 0 ? (
        <div className="mt-3 space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-sm border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600"
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-500">{emptyMessage}</p>
      )}
    </div>
  )
}

/**
 * 프로젝트 상세 페이지에서 AI 코드 리뷰 요청과 결과 표시를 담당한다.
 * @param props 리뷰할 프로젝트 ID
 * @returns AI 코드 리뷰 버튼과 결과 패널
 */
export function ProjectReviewPanel({ projectId }: ProjectReviewPanelProps) {
  const [review, setReview] = useState<ProjectReview | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleReviewClick = async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      const result = await reviewProject(projectId)
      setReview(result)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "AI 코드 리뷰를 생성하지 못했습니다."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const score = review ? clampScore(review.totalScore) : 0

  return (
    <section className="rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCEBFF] text-[#005E9C]">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-wide text-[#151B23]">
            AI 코드 리뷰
          </h2>
          <p className="text-xs text-slate-500">프로젝트 품질 분석</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleReviewClick}
        disabled={isLoading}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-main-10 px-3 text-sm font-bold text-white transition hover:bg-[#005E9C] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            리뷰 생성 중
          </>
        ) : review ? (
          <>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            다시 생성
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            AI 코드 리뷰
          </>
        )}
      </button>

      {errorMessage ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={handleReviewClick}
            disabled={isLoading}
            className="mt-3 inline-flex h-8 items-center justify-center rounded-sm border border-red-200 bg-white px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            재시도
          </button>
        </div>
      ) : null}

      {review ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-md border border-[#B7D8FF] bg-[#F3F8FF] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#005E9C]">총점</span>
              <strong className="text-2xl font-black text-[#151B23]">
                {score}
              </strong>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-main-10"
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-700">
              {review.summary || "요약이 없습니다."}
            </p>
          </div>

          <ReviewListSection
            title="카테고리별 점수"
            emptyMessage="카테고리 점수 없음"
            items={review.categories}
            renderItem={(category) => {
              const categoryScore = clampScore(category.score)

              return (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-slate-900">
                      {category.category}
                    </strong>
                    <span className="font-black text-[#005E9C]">
                      {categoryScore}
                    </span>
                  </div>
                  <p className="mt-1">{category.comment}</p>
                </>
              )
            }}
          />

          <ReviewListSection
            title="치명 이슈"
            emptyMessage="치명 이슈 없음"
            items={review.criticalIssues}
            renderItem={(issue) => (
              <>
                <strong className="flex items-center gap-1 text-red-700">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  {issue.title}
                </strong>
                <p className="mt-1">{issue.description}</p>
                <p className="mt-2 font-semibold text-slate-800">
                  해결: {issue.solution}
                </p>
              </>
            )}
          />

          <ReviewListSection
            title="경고"
            emptyMessage="경고 없음"
            items={review.warnings}
            renderItem={(issue) => (
              <>
                <strong className="text-amber-700">{issue.title}</strong>
                <p className="mt-1">{issue.description}</p>
                <p className="mt-2 font-semibold text-slate-800">
                  해결: {issue.solution}
                </p>
              </>
            )}
          />

          <ReviewListSection
            title="강점"
            emptyMessage="강점 정보 없음"
            items={review.strengths}
            renderItem={(strength) => (
              <>
                <strong className="flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {strength.title}
                </strong>
                <p className="mt-1">{strength.description}</p>
              </>
            )}
          />

          <ReviewListSection
            title="면접 질문"
            emptyMessage="면접 질문 없음"
            items={review.interviewQuestions}
            renderItem={(question, index) => (
              <p>
                <span className="font-black text-[#005E9C]">Q{index + 1}. </span>
                {question}
              </p>
            )}
          />

          <ReviewListSection
            title="리팩토링 제안"
            emptyMessage="리팩토링 제안 없음"
            items={review.refactoringSuggestions}
            renderItem={(suggestion) => (
              <>
                <strong className="flex items-center gap-1 text-slate-900">
                  <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {suggestion.title}
                </strong>
                <p className="mt-1">{suggestion.description}</p>
                {suggestion.exampleCode ? (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-sm bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">
                    <code>{suggestion.exampleCode}</code>
                  </pre>
                ) : null}
              </>
            )}
          />
        </div>
      ) : null}
    </section>
  )
}
