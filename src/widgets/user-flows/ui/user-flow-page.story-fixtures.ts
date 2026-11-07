import type { UserFlowCatalog } from "../model/types";

export const storyCatalog: UserFlowCatalog = {
  reviewedAt: "2026-10-28",
  revision: "ecd372668b06c788d5dba4b92c1e285e8a23ded4",
  repositoryUrl: "https://github.com/Tim3208/CampusPolio_FE",
  areas: [{ id: "explore", title: "프로젝트 탐색" }, { id: "account", title: "계정" }],
  flows: [
    { id: "fixture-01", area: "explore", action: "프로젝트 카드를 선택한다", result: "선택한 프로젝트 상세로 이동한다", status: "구현됨", statusNote: "상세 링크가 연결되어 있습니다. 서버 응답은 별도로 확인합니다.", conditionIds: ["fixture-session"], evidence: [{ path: "src/shared/config/routes.ts", line: 1, label: "화면 경로" }, { path: "src/features/profile/profile-settings/ui/profile-settings-form.tsx", line: 209, label: "갱신 근거", revision: "test-evidence-revision" }], states: [{ kind: "오류", when: "상세 조회에 실패하면", result: "오류 안내를 표시한다", origin: "기존" }, { kind: "빈 화면", when: "프로젝트가 삭제되었다면", result: "목록으로 돌아갈 경로를 안내한다", origin: "제안" }] },
    { id: "fixture-02", area: "account", action: "로그아웃을 선택한다", result: "로그인 세션을 종료한다", status: "미구현", statusNote: "계약은 있지만 사용자 버튼은 없습니다.", conditionIds: ["fixture-session"], evidence: [{ path: "api.md", line: 637, label: "로그아웃 계약" }], states: [] },
    { id: "fixture-03", area: "account", action: "프로필을 저장한다", result: "입력한 프로필을 다시 확인한다", status: "확인 필요", statusNote: "화면과 API 계약의 차이를 확인해야 합니다.", conditionIds: [], evidence: [{ path: "src/shared/config/routes.ts", line: 1, label: "프로필 경로" }], states: [] },
  ],
  conditions: [{ id: "fixture-session", title: "로그인 상태", summary: "동일한 행동도 세션 유무에 따라 달라집니다.", status: "구현됨", statusNote: "화면에 인증 분기가 있습니다.", cases: [{ when: "로그인하지 않았으면", result: "로그인 화면으로 이동한다", origin: "기존" }, { when: "세션이 만료되면", result: "작업을 보존하고 다시 로그인하도록 안내한다", origin: "제안" }], evidence: [{ path: "src/shared/config/routes.ts", line: 1, label: "로그인 경로" }] }],
  ideas: [{ id: "fixture-idea", title: "프로젝트 즐겨찾기", action: "즐겨찾기를 선택한다", result: "나중에 볼 목록에 보관한다", reason: "기존 코드와 확정 기획에 없는 추가 아이디어입니다." }],
};
