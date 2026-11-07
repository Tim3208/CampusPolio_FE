export type FlowStatus = "구현됨" | "미구현" | "확인 필요";

export type FlowEvidence = {
  path: string;
  line: number;
  label: string;
  revision?: string;
};

export type FlowState = {
  kind: "로딩" | "빈 화면" | "오류" | "권한" | "입력" | "진행 중";
  when: string;
  result: string;
  origin: "기존" | "제안";
};

export type UserFlow = {
  id: string;
  area: string;
  action: string;
  result: string;
  status: FlowStatus;
  statusNote: string;
  evidence: FlowEvidence[];
  conditionIds: string[];
  states: FlowState[];
};

export type ConditionFlow = {
  id: string;
  title: string;
  summary: string;
  status: FlowStatus;
  statusNote: string;
  cases: { when: string; result: string; origin: "기존" | "제안" }[];
  evidence: FlowEvidence[];
};

export type FlowIdea = {
  id: string;
  title: string;
  action: string;
  result: string;
  reason: string;
};

export type UserFlowCatalog = {
  reviewedAt: string;
  revision: string;
  repositoryUrl: string;
  areas: { id: string; title: string }[];
  flows: UserFlow[];
  conditions: ConditionFlow[];
  ideas: FlowIdea[];
};
