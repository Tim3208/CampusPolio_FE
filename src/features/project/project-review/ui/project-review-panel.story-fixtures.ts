import type { ProjectReview } from "@/entities/project";

export const reviewProjectId = 4205;
export const reviewPath = "/api/projects/4205/review";
export const reviewFailureMessage = "가상 리뷰 서버가 잠시 응답하지 않습니다. 다시 시도해 주세요.";

export const normalProjectReview = {
  totalScore: 84,
  summary: "역할 분리가 명확한 캠퍼스 프로젝트입니다. 오류 처리와 중복 로직을 개선하면 유지보수가 쉬워집니다.",
  categories: [
    { category: "코드 구조", score: 91, comment: "기능별 책임을 나누어 변경 범위를 줄였습니다." },
    { category: "안정성", score: 77, comment: "네트워크 실패 뒤 복구 경로를 보강하세요." },
  ],
  criticalIssues: [{ title: "실패 응답 처리 누락", description: "일부 요청에서 실패 원인이 사용자에게 전달되지 않습니다.", solution: "오류 안내와 재시도 경로를 함께 제공하세요." }],
  warnings: [{ title: "중복된 목록 변환", description: "동일한 배열 변환이 두 화면에 반복됩니다.", solution: "도메인 안의 변환 함수를 재사용하세요." }],
  strengths: [{ title: "명확한 기능 경계", description: "사용자 행동과 도메인 타입이 분리되어 있습니다." }],
  interviewQuestions: ["요청 실패 시 기존 화면 상태를 어떻게 보존하나요?", "기능별 경계를 나눈 이유는 무엇인가요?"],
  refactoringSuggestions: [
    { title: "목록 변환 함수 추출", description: "반복된 정규화 규칙을 한 함수로 모으세요.", exampleCode: "const names = items.map((item) => item.name);" },
    { title: "오류 문구 상수화", description: "같은 오류 안내를 일관되게 사용하세요.", exampleCode: "" },
  ],
} satisfies ProjectReview;

export const emptyProjectReview = {
  totalScore: 0,
  summary: "분석이 완료되었지만 표시할 상세 항목이 없습니다.",
  categories: [],
  criticalIssues: [],
  warnings: [],
  strengths: [],
  interviewQuestions: [],
  refactoringSuggestions: [],
} satisfies ProjectReview;

export const reviewSectionTitles = ["카테고리별 점수", "치명 이슈", "경고", "강점", "면접 질문", "리팩토링 제안"];
export const reviewEmptyMessages = ["카테고리 점수 없음", "치명 이슈 없음", "경고 없음", "강점 정보 없음", "면접 질문 없음", "리팩토링 제안 없음"];
