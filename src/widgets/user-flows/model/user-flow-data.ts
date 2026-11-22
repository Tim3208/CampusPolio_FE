import type { ConditionFlow, FlowEvidence, FlowState, FlowStatus, UserFlow, UserFlowCatalog } from "./types";

const sourcePaths = {
  api: "api.md",
  client: "src/shared/api/client.ts",
  authPaths: "src/shared/config/auth.ts",
  plan: "docs/ai/uiux-phase1-design-spec.md",
  guide: "docs/ai/storybook-guide.md",
  header: "src/widgets/header/ui/app-header.tsx",
  nav: "src/widgets/mypage/ui/mypage-nav.tsx",
  authGate: "src/widgets/mypage/ui/mypage-auth-gate.tsx",
  login: "src/features/auth/google-sign-in/ui/google-sign-in-button.tsx",
  email: "src/widgets/verify-email/ui/verify-email-page.tsx",
  routes: "src/shared/config/routes.ts",
  home: "src/widgets/home/ui/home-page.tsx",
  slider: "src/widgets/home/ui/featured-project-slider.tsx",
  search: "src/widgets/project-collection/ui/project-collection-page.tsx",
  filter: "src/features/project/project-search-filter/ui/project-tag-filter-sheet.tsx",
  query: "src/features/project/project-search-filter/lib/search-query.ts",
  detail: "src/widgets/project/ui/project-detail-page.tsx",
  review: "src/features/project/project-review/ui/project-review-panel.tsx",
  editor: "src/features/project/project-editor/ui/project-editor-form.tsx",
  richEditor: "src/features/project/project-editor/ui/rich-markdown-editor.tsx",
  createRoute: "src/app/projects/new/page.tsx",
  editRoute: "src/app/projects/[projectId]/edit/page.tsx",
  myProjects: "src/widgets/mypage/ui/mypage-projects-page.tsx",
  myProjectsRoute: "src/app/mypage/projects/page.tsx",
  builder: "src/features/portfolio/portfolio-builder/ui/portfolio-builder.tsx",
  portfolioCreate: "src/widgets/portfolio/ui/portfolio-create-page.tsx",
  portfolioDetail: "src/widgets/portfolio/ui/portfolio-detail-page.tsx",
  portfolioRoute: "src/app/portfolios/[slug]/page.tsx",
  portfolioApi: "src/entities/portfolio/api/portfolio.ts",
  myPortfolios: "src/widgets/mypage/ui/mypage-portfolios-page.tsx",
  myPortfoliosRoute: "src/app/mypage/portfolios/page.tsx",
  profile: "src/features/profile/profile-settings/ui/profile-settings-form.tsx",
  profileApi: "src/entities/profile/api/profile.ts",
  profileRoute: "src/app/mypage/settings/page.tsx",
  support: "src/app/mypage/support/page.tsx",
} as const;

const PROFILE_RETRY_REVISION = "f7dffd591507e76cfa88853836673aea998191bb";

/** 조사한 기존 파일과 줄 번호로 구현 또는 기획 근거를 만든다. */
function evidence(key: keyof typeof sourcePaths, line: number, label: string, revision?: string): FlowEvidence {
  return { path: sourcePaths[key], line, label, ...(revision ? { revision } : {}) };
}

/** 예외 상태를 기존 동작과 추가 제안으로 구분해 기록한다. */
function state(kind: FlowState["kind"], when: string, result: string, origin: FlowState["origin"] = "기존"): FlowState {
  return { kind, when, result, origin };
}

/** 사용자 행동 하나의 기대 결과와 구현 근거를 목록 항목으로 묶는다. */
function flow(id: string, area: string, action: string, result: string, status: FlowStatus, statusNote: string, sources: FlowEvidence[], conditionIds: string[] = [], states: FlowState[] = []): UserFlow {
  return { id, area, action, result, status, statusNote, evidence: sources, conditionIds, states };
}

const searchStates = [
  state("빈 화면", "검색 조건에 맞는 프로젝트가 없음", "검색 결과 없음과 조건 초기화 수단을 표시한다."),
  state("오류", "프로젝트 조회 실패", "조회 실패 안내와 다시 시도 버튼을 표시한다."),
  state("로딩", "목록을 불러오는 중", "탐색 화면의 스켈레톤을 표시한다."),
];
const editorStates = [
  state("입력", "필수 내용 또는 입력 길이 검증에 실패", "입력 안내를 표시하고 저장을 중단한다."),
  state("오류", "저장 요청 실패", "오류 대화상자를 표시한다."),
  state("진행 중", "저장 또는 업로드 처리 중", "중복 제출과 충돌하는 조작을 제한한다."),
];
const portfolioSaveStates = [
  state("진행 중", "포트폴리오 저장 중", "저장 중 문구를 표시하고 미리보기·저장 버튼을 비활성화한다."),
  state("입력", "제목이 비었거나 제목 100자·설명 500자를 초과", "검증 메시지를 표시하고 저장을 중단한다."),
  state("오류", "생성 이후 정보·연결·순서 저장 중 하나가 실패", "오류를 표시한다. 현재 재시도는 생성부터 반복하므로 중복 생성 가능성이 남는다."),
  state("오류", "일부 단계만 저장됨", "생성된 항목을 유지하고 실패 단계부터 복구하도록 안내한다.", "제안"),
];

const flows: UserFlow[] = [
  flow("NAV-01", "navigation", "로고를 선택한다", "홈으로 이동한다", "구현됨", "로고에 홈 링크가 연결되어 있다.", [evidence("header", 92, "홈 이동")]),
  flow("NAV-02", "navigation", "헤더 검색어를 입력하고 Enter를 누른다", "검색어가 적용된 프로젝트 탐색으로 이동한다", "구현됨", "앞뒤 공백을 제거하고 검색어를 URL에 반영한다. 빈 검색어는 전체 탐색으로 이동한다.", [evidence("header", 72, "헤더 검색")]),
  flow("NAV-03", "navigation", "모바일 검색 아이콘을 선택한다", "프로젝트 탐색으로 이동한다", "구현됨", "모바일 검색 버튼의 탐색 링크가 있다.", [evidence("header", 101, "모바일 검색")]),
  flow("NAV-04", "navigation", "로그인 또는 회원가입을 선택한다", "Google 로그인 화면으로 이동한다", "구현됨", "두 버튼 모두 같은 로그인 경로를 사용한다.", [evidence("header", 129, "로그인·회원가입 진입")], ["COND-LOGIN"]),
  flow("NAV-05", "navigation", "마이페이지를 선택한다", "내 프로젝트 모음으로 이동한다", "구현됨", "/mypage는 내 프로젝트로 연결된다.", [evidence("header", 107, "마이페이지 진입"), { path: "src/app/mypage/page.tsx", line: 9, label: "기본 목적지" }], ["COND-MYPAGE"]),
  flow("NAV-06", "navigation", "모바일 계정 메뉴를 연다", "내 프로젝트·내 포트폴리오·프로필 설정·프로젝트 등록을 선택할 수 있다", "구현됨", "로그인한 사용자에게 계정 메뉴를 제공한다.", [evidence("header", 110, "모바일 계정 메뉴")], ["COND-LOGIN"]),
  flow("NAV-07", "navigation", "마이페이지 메뉴를 선택한다", "해당 화면으로 이동하고 현재 메뉴를 표시한다", "구현됨", "프로젝트·포트폴리오·설정·지원 링크와 현재 경로 표시가 있다. 지원 본문은 별도 미구현 항목이다.", [evidence("nav", 9, "마이페이지 메뉴")], ["COND-MYPAGE"]),
  flow("NAV-08", "navigation", "프로젝트 등록 또는 제출을 선택한다", "프로젝트 작성 진입 경로로 이동한다", "구현됨", "헤더·홈·탐색·마이페이지의 등록 링크가 작성 경로로 연결된다.", [evidence("nav", 37, "등록 링크"), evidence("home", 85, "홈 등록 링크")], ["COND-EDITOR-ACCESS"]),

  flow("AUTH-01", "auth", "Google 계정을 선택해 로그인한다", "인증 결과에 따라 원래 목적지 또는 학교 인증 화면으로 이동한다", "확인 필요", "[P0 · BE 선합의 · AUTH-01] Google SDK·로그인 응답 처리 경로는 있다. 팀 정책은 Google 이메일 도메인 제한 없이 로그인 허용이며, 동일 클라이언트 ID·본인 식별·JWT 쿠키 유지와 재발급은 실제 서버 계약 확인이 필요하다.", [evidence("login", 45, "Google 로그인 응답 처리")], ["COND-LOGIN", "COND-NEXT"], [state("오류", "클라이언트 ID 누락·SDK 실패·인증 요청 실패", "로그인 설정 또는 오류 메시지를 표시한다."), state("로딩", "Google 버튼 준비 중", "준비 상태와 다시 시도 수단을 안내한다.", "제안")]),
  flow("AUTH-02", "auth", "학교 이메일을 입력하고 코드 전송을 선택한다", "별도 대학 이메일로 코드를 요청하고 입력 단계와 만료 안내를 확인한다", "확인 필요", "[P0 · BE 선합의 · AUTH-02] FE 선행으로 삼육대 한정 안내를 수정할 수 있다. 현재 .ac.kr 입력·전송은 있지만 타이머는 3분 고정이다. 팀 정책은 Google 주소와 다른 .ac.kr 주소 허용이며 실제 발송·만료 응답·횟수 제한을 맞춰야 한다.", [evidence("email", 229, "인증 코드 전송")], ["COND-EMAIL"], [state("입력", "유효한 학교 이메일 형식이 아님", "전송을 제한한다."), state("오류", "발송 요청 실패", "오류 메시지를 표시한다.")]),
  flow("AUTH-03", "auth", "전송한 인증번호를 학교 메일함에서 확인한다", "인증 메일을 수신한다", "확인 필요", "[P0 · BE 선합의 · AUTH-02] 현재 수신 명세는 실제 SMTP 대신 서버 로그 출력을 설명한다. 실제 메일 수신과 발송 제한·재발송 가능 시각은 서버 확인 전이며 팀 정책 확정만으로 발송 완료로 보지 않는다.", [evidence("api", 775, "실제 메일 발송 제약")], ["COND-EMAIL"], [state("오류", "인증 메일이 수신되지 않음", "만료 후 재전송 경로를 제공한다.")]),
  flow("AUTH-04", "auth", "유효한 6자리 코드를 입력하고 인증 확인을 선택한다", "학교 인증 완료 후 원래 목적지로 이동한다", "확인 필요", "[P0 · BE 선합의 · AUTH-02] 6자리 코드 제출과 성공 후 이동은 있다. 대학 인증을 현재 계정에 유지하는지와 잘못된 코드·만료·10분 10회 제한·인증 만료의 구별을 서버에서 확인해야 한다.", [evidence("email", 298, "인증 확인")], ["COND-EMAIL", "COND-NEXT"], [state("오류", "서버의 코드 검증 거부 또는 요청 실패", "오류 메시지를 표시한다."), state("입력", "현재 고정 3분 타이머 만료", "현재는 확인을 제한하고 재전송을 활성화한다. 서버 시각 연동은 미구현이다.")]),
  flow("AUTH-05", "auth", "6자리 인증번호를 붙여넣는다", "숫자가 각 입력칸에 나뉘어 입력된다", "구현됨", "[P0 · FE 선행 · AUTH-02] 숫자 붙여넣기·다음 칸 이동은 구현돼 있다. 대학 인증 교체 시 이 입력 동작은 유지하고 서버 만료·횟수 제한 연결과 구분해 검증한다.", [evidence("email", 378, "인증번호 붙여넣기")], ["COND-EMAIL"]),
  flow("AUTH-06", "auth", "재전송 가능 안내에 따라 인증번호를 다시 요청한다", "새 코드를 요청하고 입력값과 만료 안내를 갱신한다", "확인 필요", "[P0 · BE 선합의 · AUTH-02] 현재는 3분 타이머 만료 후 재전송하고 다시 3분으로 초기화한다. 서버의 만료·재발송 가능 시각 및 코드 발송 10분 3회 제한과 연결되지 않았다.", [evidence("email", 269, "인증번호 재전송")], ["COND-EMAIL"], [state("진행 중", "재전송 요청 중", "중복 요청을 제한한다."), state("오류", "재전송 실패", "실패 이유를 표시한다.")]),
  flow("AUTH-07", "auth", "로그아웃을 선택한다", "갱신 토큰과 인증 쿠키를 종료하고 비로그인 상태로 전환한다", "미구현", "[P0 · BE 선합의 · AUTH-01] 로그아웃 경로만 있고 사용자 버튼·요청·화면 갱신 흐름은 없다. 진행 중 재발급과 겹쳐도 새로고침 뒤 비로그인 상태를 유지하도록 연결해야 한다.", [evidence("api", 637, "로그아웃 계약"), evidence("plan", 241, "로그아웃 후속 기획")], ["COND-LOGIN"], [state("오류", "로그아웃 실패", "종료되지 않은 상태를 안내하고 재시도 수단을 제공한다.", "제안")]),
  flow("AUTH-08", "auth", "회원 탈퇴를 선택한다", "계정을 소프트 삭제하고 복구 기간과 자료 처리 안내를 확인한다", "미구현", "[P1 · BE 선합의 · ACCOUNT-01] 탈퇴 진입점·확인·호출은 없다. FE 선행으로 확인 화면·기존 204 응답 처리를 준비할 수 있다. 30일 복구·소유권 이전 정책과 복구 시 소유권·파일/북마크 보존 경계는 합의 후 연결한다.", [evidence("api", 1445, "회원 탈퇴 계약")], ["COND-LOGIN"], [state("진행 중", "탈퇴를 요청하기 전", "팀 정책의 30일 복구·소유권 이전·관계 제거와 아직 합의 중인 복구 경계를 안내한다.", "제안")]),

  flow("AUTH-09", "auth", "로그인한 채 화면을 이동하거나 새로고침한다", "유효한 인증을 유지하고 만료 시 재발급 후 원래 요청을 이어간다", "확인 필요", "[P0 · BE 선합의 · AUTH-01] 쿠키를 포함한 요청은 있지만 refresh 경로·만료 복구·서버 갱신 쿠키 전달은 없다. 현재 로그인 유지와 새 재발급 목표를 구분한다.", [evidence("client", 92, "현재 공통 요청"), evidence("authPaths", 1, "현재 인증 경로")], ["COND-LOGIN", "COND-REFRESH"]),
  flow("AUTH-10", "auth", "인증 만료나 서버 장애 안내에서 다시 시도한다", "재발급 불가이면 다시 로그인하고 일시 장애이면 재시도한다", "미구현", "[P0 · BE 선합의 · AUTH-01] 현재 조회 실패는 로그인 이동 또는 일반 오류가 된다. 재발급 실패와 일시 장애를 구분하고 무한 갱신·중복 저장을 막는 복구 경로가 필요하다.", [evidence("client", 92, "현재 오류 처리"), evidence("authGate", 29, "현재 로그인 게이트")], ["COND-REFRESH"], [state("오류", "재발급에 실패", "확정된 오류에 따라 다시 로그인하거나 잠시 뒤 재시도하도록 안내한다.", "제안")]),
  flow("AUTH-11", "auth", "탈퇴 후 30일 이내 같은 Google 계정으로 로그인한다", "계정과 복구 대상 자료·관계를 되찾고 복구 결과를 확인한다", "미구현", "[P1 · BE 선합의 · ACCOUNT-01] 팀 정책은 계정·프로젝트·포트폴리오·멤버 관계·북마크 복구다. 현재 복구 결과 UI와 계약이 없고 이전 OWNER 복귀·닉네임 충돌·파일 보존 경계는 미확정이다.", [evidence("login", 45, "현재 일반 로그인 처리"), evidence("api", 1445, "기존 탈퇴 계약")], ["COND-ACCOUNT-RECOVERY"]),
  flow("AUTH-12", "auth", "탈퇴 후 30일이 지난 뒤 같은 Google 계정으로 로그인한다", "이전 자료를 복구하지 않고 새 계정으로 시작한다", "미구현", "[P1 · BE 선합의 · ACCOUNT-01] 팀 정책은 이전 계정 영구 비활성·신규 가입이다. 현재 신규/복구 결과의 구별과 복구 불가 안내는 없으며 30일 경계 판정은 서버 계약이 필요하다.", [evidence("login", 45, "현재 로그인 응답 처리")], ["COND-ACCOUNT-RECOVERY"]),

  flow("HOME-01", "discovery", "홈에 접속한다", "주요 프로젝트와 분야별 프로젝트를 확인한다", "구현됨", "[P0 · BE 선합의 · ACCESS-01] 홈 결과를 표시하는 UI는 있다. 공개 프로젝트만 포함하고 소프트 삭제된 자료를 제외하는 서버 결과는 실제 검증 전이다.", [evidence("home", 48, "홈 데이터 표시")], [], [state("빈 화면", "프로젝트가 없음", "빈 목록 안내와 프로젝트 등록 수단을 표시한다."), state("오류", "홈 데이터 조회 실패", "조회 실패와 다시 시도를 표시한다."), state("로딩", "홈 조회 중", "홈 스켈레톤을 표시한다.")]),
  flow("HOME-02", "discovery", "주요 프로젝트의 이전·다음 버튼을 선택하거나 가로로 넘긴다", "인접 프로젝트 카드를 확인한다", "구현됨", "실제 스크롤 위치에 따라 양 끝 이동 버튼을 비활성화한다.", [evidence("slider", 14, "주요 프로젝트 이동")]),
  flow("HOME-03", "discovery", "홈에서 분야 태그를 선택한다", "선택한 분야의 프로젝트만 표시한다", "구현됨", "홈에서 받은 프로젝트를 분야별로 표시한다.", [evidence("home", 113, "분야별 보기")], [], [state("빈 화면", "선택 분야 프로젝트가 없음", "해당 분야의 빈 상태와 전체 보기 수단을 표시한다.")]),
  flow("HOME-04", "discovery", "홈의 분야별 프로젝트 더 보기를 선택한다", "선택한 분야 조건이 반영된 탐색 화면으로 이동한다", "구현됨", "분야별 더 보기 링크에 선택 태그를 전달한다.", [evidence("home", 158, "분야별 더 보기")]),
  flow("HOME-05", "discovery", "주요 프로젝트의 전체 프로젝트 보기를 선택한다", "조건 없는 프로젝트 탐색으로 이동한다", "구현됨", "주요 프로젝트 영역의 전체 보기는 고정 /projects 링크다.", [evidence("slider", 94, "전체 프로젝트 보기")]),
  flow("HOME-06", "discovery", "분야 선택에서 전체를 선택한다", "분야를 구분하지 않고 홈 프로젝트를 표시한다", "구현됨", "선택한 분야를 해제해 전체 프로젝트를 표시한다.", [evidence("home", 113, "전체 분야 선택")]),
  flow("SEARCH-01", "discovery", "프로젝트 탐색을 연다", "검색 가능한 프로젝트 목록을 확인한다", "구현됨", "[P1 · BE 선합의 · LIST-01] 검색 목록 표시와 페이지 요청은 있다. 팀 정책의 페이지당 9개·공개 자료만 반환·소프트 삭제 제외를 실제 응답과 대조해야 한다.", [evidence("search", 43, "탐색 화면")], [], searchStates),
  flow("SEARCH-02", "discovery", "검색어를 입력하고 검색한다", "검색 조건에 맞는 첫 페이지를 표시한다", "확인 필요", "[P1 · BE 선합의 · LIST-01] 검색어·첫 페이지 URL 연결은 있다. 제목·요약·태그 검색은 화면 요구로 전달한 상태이며 대상 필드와 서버 결과 계약을 합의해야 한다.", [evidence("search", 413, "검색 UI"), evidence("query", 1, "검색 URL 생성")], [], searchStates),
  flow("SEARCH-03", "discovery", "태그 필터를 선택한다", "태그 조건에 맞는 프로젝트를 표시한다", "확인 필요", "[P1 · BE 선합의 · LIST-01] 태그 선택을 URL에 반영한다. 선택한 태그 모두 포함은 기존 화면 요구이며 서버 검색 의미와 태그 정규화 계약을 함께 합의해야 한다.", [evidence("search", 88, "태그 검색 연결")], [], searchStates),
  flow("SEARCH-04", "discovery", "모바일 필터에서 태그를 고른 뒤 적용한다", "선택한 태그로 결과를 갱신하고 필터를 닫는다", "구현됨", "[P1 · FE 선행 · LIST-01] 임시 선택·적용·닫기는 구현돼 있다. 서버의 태그 검색 계약을 연결해도 적용 전 결과를 바꾸지 않는 동작은 유지한다.", [evidence("filter", 1, "모바일 필터 적용")], ["COND-FILTER"], searchStates),
  flow("SEARCH-05", "discovery", "모바일 필터 선택 중 취소하거나 닫는다", "기존 검색 결과와 적용 조건을 유지한다", "구현됨", "미적용 선택을 결과에 반영하지 않는다.", [evidence("filter", 1, "필터 취소")], ["COND-FILTER"]),
  flow("SEARCH-06", "discovery", "최신순 또는 조회순 정렬을 선택한다", "선택한 정렬의 첫 페이지를 표시한다", "확인 필요", "[P1 · BE 선합의 · LIST-01] 최신순·조회수순 UI는 있다. 수신 명세의 POPULAR 설명과 VIEW_COUNT enum이 다르며 최초 발행일 최신순은 합의할 화면 요구다.", [evidence("search", 114, "정렬 선택"), evidence("guide", 107, "정렬 계약 차이")], [], searchStates),
  flow("SEARCH-07", "discovery", "그리드 또는 리스트 보기를 선택한다", "검색 조건을 유지하며 보기 방식을 바꾼다", "구현됨", "보기 방식은 URL에 기록되고 보기 변경 시 페이지를 초기화한다.", [evidence("search", 137, "보기 전환"), evidence("query", 1, "보기 URL")]),
  flow("SEARCH-08", "discovery", "적용된 조건 칩을 해제한다", "해당 조건만 제거한 첫 페이지를 표시한다", "구현됨", "다른 검색 조건과 선택한 보기 방식은 유지한다.", [{ path: "src/features/project/project-search-filter/ui/applied-filter-chips.tsx", line: 17, label: "개별 조건 해제" }], [], searchStates),
  flow("SEARCH-09", "discovery", "페이지 번호 또는 이전·다음을 선택한다", "검색 조건과 보기를 유지한 해당 페이지를 표시한다", "구현됨", "[P1 · BE 선합의 · LIST-01] 조건·보기 유지와 첫·끝 페이지 제어는 있다. 검색 결과 9개와 전체 건수·페이지 응답을 합의하고 호출 제한도 별도로 연결해야 한다.", [evidence("search", 223, "페이지 이동")], [], searchStates),
  flow("SEARCH-10", "discovery", "연도·학기·전공 조건으로 검색한다", "여러 학사 조건을 조합한 결과를 표시한다", "미구현", "[P1 · BE 선합의 · LIST-01] 학사 조건은 현재 검색에 없다. 제작 연도·학기·학과 저장 및 복합 필터는 팀 전달 문서의 화면 협의 요청이며 허용 값·저장/검색 계약부터 정해야 한다.", [evidence("plan", 240, "학사 조건 복합 검색 기획")], [], [state("빈 화면", "복합 조건 결과가 없음", "적용 조건을 보여주고 개별 해제 수단을 제공한다.", "제안")]),
  flow("SEARCH-11", "discovery", "홈 또는 탐색의 프로젝트 카드를 선택한다", "해당 프로젝트 상세로 이동한다", "구현됨", "실제 프로젝트 ID를 사용한 상세 링크가 있다.", [evidence("search", 43, "상세 진입"), evidence("home", 48, "홈 프로젝트 목록")]),
  flow("SEARCH-12", "discovery", "모바일 필터 안에서 선택 초기화를 누른다", "필터 내부의 임시 태그 선택만 비운다", "구현됨", "실제 검색 결과는 적용하기를 누를 때까지 유지한다.", [evidence("filter", 97, "임시 선택 초기화")], ["COND-FILTER"]),
  flow("SEARCH-13", "discovery", "전체 조건 초기화를 선택한다", "검색어·태그·정렬을 비우고 첫 페이지를 표시한다", "구현됨", "그리드·리스트 보기 방식은 유지한다.", [evidence("search", 293, "전체 조건 초기화")], [], searchStates),
  flow("SEARCH-14", "discovery", "모바일·태블릿에서 필터를 연다", "현재 적용 태그를 복사한 임시 선택 화면을 표시한다", "구현됨", "필터를 여는 시점에 실제 적용 조건을 임시 상태로 복사한다.", [evidence("filter", 35, "필터 열기와 선택 복사")], ["COND-FILTER"]),

  flow("DETAIL-01", "project-detail", "프로젝트 상세를 연다", "제목·본문·작성자·참여자·태그·등록일·조회수·좋아요 수를 확인한다", "구현됨", "[P0 · BE 선합의 · ACCESS-01] 본문·작성자·참여자 표시는 있다. 공개/비공개·삭제 결과를 구별하고 권한 없는 조회의 존재를 숨기는 계약 및 서버 인증 전달은 확인 전이다. 좋아요 표시는 추가/취소 기능이 아니다.", [evidence("detail", 34, "상세 정보")], ["COND-PROJECT-VISIBILITY"], [state("오류", "대상이 없거나 잘못된 ID 또는 상세 조회 실패", "프로젝트를 불러오지 못했어요 안내와 재시도·모음 링크를 표시한다."), state("빈 화면", "본문·작성자·참여자 정보가 없음", "영역별 대체 문구를 표시한다."), state("빈 화면", "대표 이미지·본문 이미지 로드 실패", "대체 표시 또는 이미지 오류 안내를 제공한다.")]),
  flow("DETAIL-02", "project-detail", "첨부 파일을 선택한다", "파일 주소를 새 창에서 연다", "확인 필요", "[P1 · BE 선합의 · PROJ-03] 현재 고정 fileUrl을 새 창으로 연다. 팀 정책의 S3 키·5분 서명 URL 발급/재발급·열람 권한 연결은 없으며 과거 PDF·문서 링크와 신규 PNG/JPG 업로드 범위를 구분해야 한다.", [evidence("detail", 85, "첨부 링크")], [], [state("빈 화면", "첨부 파일이 없음", "첨부 없음 안내를 표시한다."), state("오류", "파일 주소가 만료되거나 외부 열기 실패", "다시 접근할 수 있는 안내를 제공한다.", "제안")]),
  flow("DETAIL-03", "project-detail", "프로젝트 모음으로 돌아가기를 선택한다", "프로젝트 탐색으로 이동한다", "구현됨", "고정 /projects 링크다. 이전 검색 조건 복원을 보장하지 않는다.", [evidence("detail", 44, "모음으로 이동")]),
  flow("DETAIL-04", "project-detail", "AI 리뷰 요청을 선택한다", "요청한 프로젝트의 리뷰 결과를 확인한다", "확인 필요", "[P2 · BE 선합의 · INTEGRATION-01] 리뷰 요청·결과 UI는 있다. 현재 서버의 분석 자료·실행/열람 권한·결과 보관을 확인하는 범위이며 실제 AI 성공이나 새 정책을 확정한 상태는 아니다.", [evidence("review", 78, "AI 리뷰 요청"), evidence("api", 181, "리뷰 API 계약")], ["COND-REVIEW"], [state("진행 중", "리뷰 생성 중", "생성 중 표시와 중복 요청 제한을 제공한다."), state("빈 화면", "리뷰 세부 결과가 비어 있음", "각 결과 영역에 빈 상태 문구를 표시한다."), state("오류", "리뷰 생성 실패", "오류와 재시도 버튼을 표시한다.")]),
  flow("DETAIL-05", "project-detail", "AI 리뷰 다시 생성 또는 재시도를 선택한다", "새 리뷰 응답으로 결과를 갱신한다", "확인 필요", "[P2 · BE 선합의 · INTEGRATION-01] 동일 프로젝트에 다시 POST해 화면 결과를 바꾼다. 서버 결과 보관·중복 실행·재시도·횟수 제한은 확인 전이다.", [evidence("review", 85, "리뷰 재요청")], ["COND-REVIEW"], [state("오류", "재요청 실패", "오류를 표시하고 다시 시도할 수 있다.")]),
  flow("DETAIL-06", "project-detail", "상세에서 관련 작품을 선택한다", "관련 프로젝트 상세를 확인한다", "미구현", "현재 상세에 추천 데이터와 이동 UI가 없다. 기존 후속 기획을 보존한 항목이며 이번 팀 정책 연동의 핵심 구현 대상으로 추가하지 않는다.", [evidence("plan", 242, "관련 작품 후속 기획")], [], [state("빈 화면", "관련 작품이 없음", "추천 영역을 생략하거나 빈 안내를 제공한다.", "제안")]),
  flow("DETAIL-07", "project-detail", "GitHub·PDF·영상 전용 자료를 선택한다", "자료 유형에 맞는 정보와 열람 수단을 확인한다", "미구현", "기존 후속 기획이며 일반 첨부 링크만 있다. 이번 팀 정책의 신규 파일 허용은 PNG/JPG이고 GitHub·PDF·영상 전용 자료 기능의 추가 구현을 뜻하지 않는다.", [evidence("plan", 242, "전용 자료 구조 기획")]),

  flow("DETAIL-08", "project-detail", "비공개 프로젝트 주소를 연다", "OWNER·MEMBER는 내용을 보고 권한이 없는 사람은 존재를 알 수 없다", "확인 필요", "[P0 · BE 선합의 · ACCESS-01] 현재 상세 페이지는 서버 인증 전달이 없고 권한별 조회를 검증하지 않았다. 팀 정책의 MEMBER 열람을 적용하되 DRAFT와 비로그인 401/404 우선순위는 합의해야 한다.", [evidence("detail", 34, "현재 상세 표시"), { path: "src/app/projects/[projectId]/page.tsx", line: 31, label: "현재 상세 조회" }], ["COND-PROJECT-VISIBILITY"]),
  flow("DETAIL-09", "project-detail", "삭제된 프로젝트의 이전 주소나 연결을 연다", "삭제된 자료가 상세·목록·연결 조회에 노출되지 않는다", "확인 필요", "[P0 · BE 선합의 · ACCESS-01] 상세 404 처리는 있지만 소프트 삭제를 모든 조회·검색·포트폴리오 연결에서 제외하는 서버 계약과 직접 삭제 후 파일 정리는 실제 검증 전이다.", [{ path: "src/app/projects/[projectId]/page.tsx", line: 31, label: "현재 상세 오류 분기" }, evidence("portfolioDetail", 118, "현재 연결 프로젝트 표시")], ["COND-PROJECT-VISIBILITY", "COND-PROJECT-DELETE"]),

  flow("EDIT-01", "project-editor", "프로젝트 작성 화면을 연다", "새 프로젝트 입력 폼을 표시한다", "확인 필요", "[P1 · FE 선행 · PROJ-01] 현재 진입부터 대학 인증을 강제한다. 팀 정책은 로그인만으로 DRAFT 생성 가능이므로 작성 진입과 발행 인증 조건을 분리해야 한다.", [evidence("createRoute", 14, "작성 접근 확인")], ["COND-EDITOR-ACCESS"]),
  flow("EDIT-02", "project-editor", "제목과 본문을 작성하고 서식 도구를 사용한다", "입력한 내용과 서식이 편집기에 반영된다", "구현됨", "리치 텍스트 편집과 Markdown 변환 경로가 있다.", [evidence("richEditor", 1, "본문 편집기"), evidence("editor", 630, "저장 본문 변환")], [], [state("오류", "저장하지 않고 이탈하거나 새로고침함", "미저장 내용의 유실 가능성을 안내한다.", "제안")]),
  flow("EDIT-03", "project-editor", "추천 태그 또는 새 태그를 추가·해제한다", "선택 태그가 본문 설정과 저장 내용에 반영된다", "확인 필요", "[P1 · FE 선행 · PROJ-02] 태그 추가·제거·최대 10개 방어는 있다. 소문자 변환·공백을 하이픈으로 변환·기타 특수문자 거절·태그당 10자·정규화 후 중복 검사는 미반영이다.", [evidence("editor", 437, "태그 선택"), evidence("editor", 630, "태그 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER", "COND-PROJECT-SAVE", "COND-TAGS"]),
  flow("EDIT-04", "project-editor", "제작 연도·학기·학과를 선택하고 저장한다", "선택한 학사 정보가 저장된다", "미구현", "[P1 · BE 선합의 · LIST-01] 학사 정보 선택 UI는 있지만 저장하지 않는다. 제작 연도·학기·학과의 저장·재조회·검색은 화면 요구로 전달돼 있으며 후속 필드 계약이 필요하다.", [evidence("editor", 630, "저장 payload"), evidence("editor", 1094, "학사 정보 입력"), evidence("plan", 240, "학사 정보 저장 기획")]),
  flow("EDIT-05", "project-editor", "파일을 선택하거나 드래그해 첨부한다", "업로드된 파일을 첨부 목록에 표시한다", "확인 필요", "[P1 · BE 선합의 · PROJ-03] 현재 PDF·Markdown·JPG·JPEG·PNG/50MiB를 multipart로 업로드한다. 팀 정책의 PNG·JPG/100MB, S3 키·서명 URL 발급·연결 완료 방식과 불일치하므로 업로드 계약부터 교체해야 한다.", [evidence("editor", 611, "파일 드롭"), evidence("api", 286, "파일 업로드 계약")], ["COND-EDITOR-ACCESS", "COND-UPLOAD"], [state("입력", "현재 형식 검사 실패 또는 50MiB 초과", "현재 오류를 표시한다. 팀 정책의 PNG/JPG·100MB 검증으로 교체해야 한다."), state("오류", "파일 업로드 실패", "실패 안내를 표시한다."), state("오류", "여러 파일 중 일부만 업로드 성공", "성공·실패 파일을 구분하고 실패 파일만 재시도한다.", "제안")]),
  flow("EDIT-06", "project-editor", "본문 이미지 삽입에서 파일을 선택한다", "업로드한 이미지를 본문에 삽입한다", "확인 필요", "[P1 · BE 선합의 · PROJ-03] 현재 업로드 완료 후 본문 이미지 삽입은 동작한다. S3 키 보존·5분 URL 만료 후 재표시와 본문/파일 XSS 방어는 새 계약에 맞춰 검증해야 한다.", [evidence("editor", 351, "본문 이미지 지연 삽입"), evidence("editor", 560, "본문 이미지 업로드")], ["COND-UPLOAD", "COND-EDITOR-ACCESS"], [state("진행 중", "이미지 업로드 중", "편집·도구·저장을 비활성화한다."), state("오류", "이미지 업로드 실패", "오류 표시 후 다시 선택할 수 있다.")]),
  flow("EDIT-07", "project-editor", "첨부 파일 제거를 선택한다", "서버 파일 삭제 성공 후 첨부 목록을 갱신한다", "미구현", "[P1 · BE 선합의 · PROJ-03] 현재 로컬 배열만 제거한다. 팀 정책은 연결 파일 삭제 시 S3에서도 즉시 제거이므로 파일 식별·삭제 계약과 본문/대표 이미지 참조 처리부터 맞춰야 한다.", [evidence("editor", 620, "화면 목록에서만 제거"), evidence("api", 1634, "파일 삭제 계약")], ["COND-UPLOAD"], [state("오류", "서버 제거 실패", "기존 첨부 상태를 유지하고 실패를 안내한다.", "제안")]),
  flow("EDIT-08", "project-editor", "임시 저장을 선택한다", "현재 내용을 Draft로 저장하고 내 프로젝트로 이동한다", "확인 필요", "[P1 · FE 선행 · PROJ-01] DRAFT 생성·저장은 있지만 저장 직전에도 대학 인증을 강제한다. 미인증 로그인 사용자의 임시저장을 허용하고 발행 조건과 분리해야 한다.", [evidence("editor", 659, "Draft 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-09", "project-editor", "새 프로젝트의 공개 등록을 선택한다", "본문 저장 후 발행하고 내 프로젝트 모음으로 이동한다", "확인 필요", "[P1 · FE 선행 · PROJ-01] 신규 저장 후 발행 호출은 있다. 팀 정책의 OWNER·대학 인증·제목/썸네일 필수·본문 30~50,000자 검증은 일부 미반영이며 발행 요청 필드는 BE와 정합화해야 한다.", [evidence("editor", 754, "신규 프로젝트 발행")], ["COND-EDITOR-ACCESS", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-10", "project-editor", "기존 프로젝트 수정 화면을 연다", "기존 내용을 편집 폼에 불러온다", "확인 필요", "[P1 · BE 선합의 · PROJ-01] 현재 제목·본문·태그만 초기화한다. 작성 상태·공개 여부·기존 첨부를 복원할 응답과 미인증 DRAFT 편집의 접근 조건을 맞춰야 한다.", [evidence("editRoute", 14, "수정 경로"), evidence("editor", 365, "수정 초기 데이터")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER"], [state("로딩", "기존 프로젝트 조회 중", "불러오는 중 상태를 표시한다."), state("오류", "프로젝트 조회 실패", "오류 안내를 표시한다.")]),
  flow("EDIT-11", "project-editor", "기존 프로젝트 내용을 수정하고 저장한다", "수정 요청 후 내 프로젝트 모음으로 이동한다", "확인 필요", "[P1 · BE 선합의 · PROJ-01] 기존 내용 PATCH 후 이동은 있다. 공개 수정 즉시 반영은 화면 협의 요청이며 상태/권한 응답과 새 발행 검증 범위를 구분해야 한다.", [evidence("editor", 734, "수정 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-12", "project-editor", "임시저장한 프로젝트를 열어 발행한다", "Draft가 공개 등록된 프로젝트로 전환된다", "미구현", "[P1 · BE 선합의 · PROJ-01] 재진입한 edit 모드는 PATCH만 하고 발행하지 않는다. DRAFT 판단 정보와 OWNER·대학 인증·썸네일·본문 길이 조건을 반영한 재발행 흐름이 필요하다.", [evidence("editor", 734, "수정 모드 저장 분기"), evidence("api", 213, "프로젝트 발행 계약")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER", "COND-PROJECT-SAVE"]),
  flow("EDIT-13", "project-editor", "편집기에서 대시보드로 돌아가기를 선택한다", "내 프로젝트 모음으로 이동한다", "구현됨", "고정 마이페이지 링크가 있다. 미저장 내용 복구는 구현되어 있지 않다.", [{ path: "src/widgets/project/ui/project-editor-page.tsx", line: 22, label: "편집기에서 모음 이동" }], [], [state("오류", "미저장 변경사항이 있음", "이탈 전에 변경사항 유실을 안내한다.", "제안")]),
  flow("EDIT-14", "project-editor", "비공개 저장을 선택하고 저장한다", "Draft로 저장하고 내 프로젝트 모음으로 이동한다", "구현됨", "[P1 · FE 선행 · PROJ-01] 현재 비공개 저장은 DRAFT 경로다. 발행된 프로젝트의 공개 전환은 별도 미구현이며 미인증 DRAFT 허용에 맞춰 인증 게이트를 분리해야 한다.", [evidence("editor", 690, "비공개 Draft 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-15", "project-editor", "기존 프로젝트의 첨부 목록을 불러와 관리한다", "저장된 첨부 파일을 확인하고 관리한다", "미구현", "[P1 · BE 선합의 · PROJ-03] 기존 파일 관리 UI가 없다. 팀 정책의 S3 키·이름/형식/크기·5분 열람 URL을 받아 재진입 복원과 만료 복구를 구현해야 한다.", [evidence("editor", 365, "수정 초기 데이터"), evidence("api", 256, "기존 파일 조회 계약")], ["COND-UPLOAD"]),
  flow("EDIT-16", "project-editor", "편집기의 취소를 선택한다", "내 프로젝트 모음으로 이동한다", "구현됨", "취소 버튼은 내 프로젝트 경로에 연결된다.", [evidence("editor", 1188, "편집 취소")], [], [state("오류", "미저장 변경사항이 있음", "이탈 전에 유실 가능성을 안내한다.", "제안")]),

  flow("MYPROJ-01", "my-projects", "내 프로젝트 모음을 연다", "참여 프로젝트의 작성 상태와 공개 여부를 확인한다", "확인 필요", "[P1 · BE 선합의 · LIST-01] 목록 표시는 있으나 DRAFT/PUBLISHED를 공개 여부처럼 표현한다. 작성 상태·공개 여부 구분, 태그 없는 최신 응답, 참여 권한·삭제 제외·9개 페이지 계약을 맞춰야 한다.", [evidence("myProjectsRoute", 1, "내 프로젝트 조회"), evidence("myProjects", 1, "프로젝트 모음")], ["COND-MYPAGE"], [state("빈 화면", "내 프로젝트가 없음", "등록 안내와 생성 카드를 표시한다."), state("오류", "목록 조회 실패", "오류 메시지를 표시한다.")]),
  flow("MYPROJ-02", "my-projects", "내 프로젝트의 작성 상태·공개 여부 필터를 선택한다", "선택한 상태의 내 프로젝트를 확인한다", "미구현", "[P1 · BE 선합의 · LIST-01] 현재 ALL 고정이며 필터 UI가 없다. 수신 명세에 query가 없으므로 작성 상태와 공개 여부를 별도로 거르는 계약부터 합의해야 한다.", [evidence("myProjectsRoute", 30, "ALL 고정 조회"), { path: "src/entities/project/api/get-my-projects.ts", line: 62, label: "프론트 상태 옵션" }, evidence("api", 1478, "현재 목록 계약")], ["COND-MYPAGE"]),
  flow("MYPROJ-03", "my-projects", "내 프로젝트 카드를 선택한다", "해당 프로젝트 상세로 이동한다", "구현됨", "[P0 · BE 선합의 · ACCESS-01] 카드 이동은 구현돼 있다. 비공개 프로젝트 OWNER/MEMBER 열람과 DRAFT 적용 범위·비로그인 401/404 우선순위는 구분해 확인해야 한다.", [evidence("myProjects", 137, "내 프로젝트 카드")], ["COND-MYPAGE", "COND-PROJECT-VISIBILITY"]),
  flow("MYPROJ-04", "my-projects", "내 프로젝트의 설정을 선택한다", "해당 프로젝트 수정 화면으로 이동한다", "확인 필요", "[P1 · FE 선행 · PROJ-04] 설정 버튼은 모든 역할에 노출된다. OWNER 전용 수정·팀원 관리·공개 전환·삭제 진입을 제한하는 UI부터 준비하고 실제 요청은 권한 계약과 맞춰야 한다.", [evidence("myProjects", 162, "수정 화면 진입")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER"]),
  flow("MYPROJ-05", "my-projects", "프로젝트 생성 카드를 선택한다", "새 프로젝트 작성 화면으로 이동한다", "구현됨", "[P1 · FE 선행 · PROJ-01] 작성 화면 링크는 있다. 진입 경로의 대학 인증 강제를 제거해 로그인한 미인증 사용자도 DRAFT를 만들게 해야 한다.", [evidence("myProjects", 86, "프로젝트 생성 카드")], ["COND-EDITOR-ACCESS"]),
  flow("MYPROJ-06", "my-projects", "내 프로젝트에서 다음 목록 페이지를 선택한다", "다음 내 프로젝트 목록을 확인한다", "미구현", "[P1 · BE 선합의 · LIST-01] 현재 첫 페이지 고정·페이지 제어 없음이다. 수신 명세는 배열이므로 9개 단위 페이지·전체 건수 계약과 조회 조건을 합의해야 한다.", [evidence("myProjectsRoute", 30, "내 프로젝트 고정 조회"), evidence("api", 1478, "목록 응답 계약")]),

  flow("MYPROJ-07", "my-projects", "초대할 팀원의 닉네임을 검색한다", "중복되지 않는 닉네임으로 활성 계정의 초대 대상을 찾는다", "미구현", "[P1 · BE 선합의 · PROJ-04] 팀 정책은 OWNER만 닉네임으로 초대 대상을 검색하는 것이다. 현재 닉네임 검색 UI·API가 없으며 소프트 삭제 계정 제외·결과 정보·호출 제한 계약부터 필요하다.", [evidence("myProjects", 162, "현재 설정 진입"), evidence("profile", 153, "현재 닉네임 입력")], ["COND-PROJECT-TEAM", "COND-RATE-LIMIT"], [state("빈 화면", "초대할 활성 계정을 찾지 못함", "일치하는 계정이 없음을 안내한다.", "제안")]),
  flow("MYPROJ-08", "my-projects", "검색한 사용자를 프로젝트 팀원으로 초대한다", "초대 요청 결과와 현재 팀원 목록을 확인한다", "미구현", "[P1 · BE 선합의 · PROJ-04] 팀 정책은 프로젝트 OWNER만 초대할 수 있다. 현재 API·UI가 없으며 초대 수락 여부·중복 초대 처리·목록 반영 시점은 계약 확인 전이므로 임의로 정하지 않는다.", [evidence("detail", 37, "현재 작성자·참여자 조회 표시"), evidence("myProjects", 162, "현재 수정 진입")], ["COND-PROJECT-TEAM", "COND-PROJECT-OWNER"]),
  flow("MYPROJ-09", "my-projects", "프로젝트에서 팀원을 제거한다", "제거 결과와 변경된 팀원·열람 권한을 확인한다", "미구현", "[P1 · BE 선합의 · PROJ-04] 팀 정책은 OWNER만 팀원을 제거할 수 있다. 현재 제거 API·UI가 없으며 제거 이후 기존 포트폴리오 연결과 권한 변경 안내는 BE 계약을 확인해야 한다.", [evidence("detail", 37, "현재 팀원 표시"), evidence("myProjects", 162, "현재 설정 진입")], ["COND-PROJECT-TEAM", "COND-PROJECT-OWNER"]),
  flow("MYPROJ-10", "my-projects", "발행된 프로젝트의 공개 여부를 바꾼다", "OWNER가 공개·비공개로 전환하고 변경 결과를 확인한다", "미구현", "[P1 · BE 선합의 · PROJ-04] 기존 편집기의 비공개 저장은 DRAFT일 뿐 공개 전환이 아니다. 팀 정책에 맞는 별도 변경 계약·현재 상태·403 안내와 연결 포트폴리오 자동 비공개 결과를 받아야 한다.", [evidence("editor", 690, "현재 비공개 DRAFT 저장"), evidence("myProjects", 162, "현재 설정 진입")], ["COND-PROJECT-OWNER", "COND-PROJECT-VISIBILITY", "COND-PORTFOLIO-VISIBILITY"]),
  flow("MYPROJ-11", "my-projects", "프로젝트 삭제를 선택한다", "OWNER가 삭제 범위를 확인하고 프로젝트를 삭제한다", "미구현", "[P1 · BE 선합의 · PROJ-04] 프로젝트 자체 삭제 API·UI는 없다. 팀 정책은 조회에서 제외하고 직접 삭제 시 S3 파일·북마크도 삭제한다. 탈퇴에 따른 삭제·30일 복구와 혼동하지 않게 계약·확인 안내를 준비해야 한다.", [evidence("myProjects", 162, "현재 설정 진입"), evidence("editor", 620, "현재 로컬 첨부 제거")], ["COND-PROJECT-DELETE"], [state("진행 중", "직접 삭제를 요청하기 전", "프로젝트·파일·북마크 정리 범위를 확인한다. 직접 삭제의 복구 가능성을 임의로 약속하지 않는다.", "제안")]),
  flow("MYPROJ-12", "my-projects", "내 프로젝트에서 검색어를 입력한다", "권한이 있는 전체 프로젝트에서 검색 결과를 찾는다", "미구현", "[P1 · BE 선합의 · LIST-01] 내 프로젝트 검색 UI·검색 query 계약이 없다. 제목·요약·태그 제공과 전체 대상 검색·9개 페이지는 화면 요구와 팀 정책을 대조해 합의해야 한다.", [evidence("myProjectsRoute", 30, "현재 고정 목록 조회"), evidence("myProjects", 262, "현재 목록 표시")], ["COND-PROJECT-VISIBILITY", "COND-RATE-LIMIT"]),

  flow("PORT-01", "portfolio-builder", "포트폴리오 제작을 연다", "선택 가능한 내 프로젝트를 표시한다", "확인 필요", "[P1 · BE 선합의 · PORT-01] 현재 size 8·ALL로 내 프로젝트를 요청한다. 참여 프로젝트 선택은 있지만 대학 인증 게이트·목록 9개·발행 프로젝트만 연결할지의 정책 경계가 남아 있다.", [evidence("portfolioCreate", 16, "제작 프로젝트 조회")], ["COND-PORTFOLIO-ACCESS"], [state("빈 화면", "불러온 프로젝트가 없음", "표시할 프로젝트 없음 안내를 표시한다."), state("오류", "프로젝트 조회 실패", "오류 메시지와 빈 목록을 표시한다.")]),
  flow("PORT-02", "portfolio-builder", "제작 화면에서 프로젝트를 검색한다", "현재 불러온 목록에서 제목·설명·태그가 맞는 항목을 표시한다", "확인 필요", "[P1 · BE 선합의 · LIST-01] size 8로 받은 목록만 로컬 검색한다. 최신 내 프로젝트 schema에는 태그·요약이 없어 전체 대상 제목·요약·태그 검색 계약과 정보 제공 범위를 합의해야 한다.", [evidence("builder", 176, "제작 목록 로컬 검색")], [], [state("빈 화면", "검색 결과가 없음", "표시할 프로젝트 없음 안내를 표시한다.")]),
  flow("PORT-03", "portfolio-builder", "제작 화면의 최신순 정렬을 선택한다", "프로젝트 목록을 최신순으로 재정렬한다", "미구현", "[P1 · BE 선합의 · LIST-01] 최신순 버튼에 핸들러가 없다. 제작 목록의 정렬과 최초 발행일 기준 여부를 후속 목록 계약에 맞춰 연결해야 한다.", [evidence("builder", 403, "연결되지 않은 정렬 버튼")]),
  flow("PORT-04", "portfolio-builder", "제작 화면에서 이전·다음 페이지를 선택한다", "다른 페이지의 내 프로젝트를 선택할 수 있다", "미구현", "[P1 · BE 선합의 · LIST-01] 페이지 버튼은 비활성이고 size 8 고정 요청이다. 프로젝트 9개 단위 목록 계약과 페이지 간 선택 보존을 함께 연결해야 한다.", [evidence("builder", 443, "비활성 페이지 이동"), evidence("portfolioCreate", 23, "고정 페이지 크기")]),
  flow("PORT-05", "portfolio-builder", "프로젝트 카드를 선택한다", "선택 목록에 추가하고 선택 개수를 표시한다", "확인 필요", "[P1 · FE 선행 · PORT-01] 선택 ID·개수 관리는 있다. 중복 방지·최대 50개와 연결 가능 여부 안내를 보완하고 DRAFT 제외 여부는 BE 선합의 후 적용해야 한다.", [evidence("builder", 200, "프로젝트 선택")], ["COND-PORTFOLIO-PROJECTS"]),
  flow("PORT-06", "portfolio-builder", "선택한 카드를 다시 누르거나 해제한다", "해당 프로젝트를 선택 목록에서 제외한다", "구현됨", "개별 선택 해제 경로가 있다.", [evidence("builder", 200, "선택 토글"), evidence("builder", 222, "개별 선택 해제")]),
  flow("PORT-07", "portfolio-builder", "선택 해제를 선택한다", "선택한 프로젝트를 모두 해제한다", "구현됨", "선택 목록 전체 초기화가 연결되어 있다.", [evidence("builder", 472, "전체 선택 해제")], [], [state("빈 화면", "선택한 프로젝트가 없음", "프로젝트를 추가하라는 안내를 표시한다.")]),
  flow("PORT-08", "portfolio-builder", "선택 목록에서 위·아래 버튼을 선택한다", "포트폴리오의 프로젝트 표시 순서를 바꾼다", "구현됨", "[P1 · FE 선행 · PORT-01] 신규 제작의 순서 변경과 양 끝 버튼 제어는 있다. 최대 50개·전체 연결 ID와 순서 일치 검증을 보완하고 기존 편집 API 연결은 별도로 진행한다.", [evidence("builder", 234, "순서 변경"), evidence("builder", 881, "순서 이동 버튼")], ["COND-PORTFOLIO-PROJECTS"]),
  flow("PORT-09", "portfolio-builder", "포트폴리오 제목과 설명을 입력한다", "입력 내용과 글자 수를 표시한다", "구현됨", "제목과 설명 상태가 폼에 연결되어 있다.", [evidence("builder", 245, "제목·설명 입력")], ["COND-PORTFOLIO-SAVE"]),
  flow("PORT-10", "portfolio-builder", "썸네일 파일을 선택한다", "선택한 이미지의 로컬 미리보기를 표시한다", "구현됨", "[P1 · BE 선합의 · PORT-01] 파일 선택은 object URL 미리보기만 제공한다. 저장용 이미지 업로드·식별·제한 계약은 없으므로 프로젝트 이미지 규칙을 그대로 적용했다고 표시하지 않는다.", [evidence("builder", 263, "로컬 이미지 미리보기")], [], [state("입력", "처리할 수 없는 포트폴리오 대표 이미지 파일을 선택", "포트폴리오 업로드 계약을 확인한 뒤 형식·용량을 안내한다. 현재는 로컬 미리보기뿐이다.", "제안")]),
  flow("PORT-11", "portfolio-builder", "선택한 썸네일로 포트폴리오를 저장한다", "저장한 상세에도 선택 이미지가 표시된다", "미구현", "[P1 · BE 선합의 · PORT-01] 선택 파일을 업로드하지 않고 첫 프로젝트 이미지를 저장한다. 사용자가 선택한 대표 이미지 보관은 별도 저장 계약이 필요하다.", [evidence("builder", 86, "저장용 썸네일 결정"), evidence("builder", 582, "썸네일 업로드 미구현 표시")]),
  flow("PORT-12", "portfolio-builder", "포트폴리오 템플릿을 선택한다", "선택한 템플릿을 적용한다", "미구현", "고정 템플릿만 있고 선택·저장 필드가 없다. 기존 기획을 보존하며 이번 핵심 API 교체에 신규 템플릿 기능을 추가하지 않는다.", [evidence("builder", 43, "고정 템플릿"), evidence("builder", 644, "템플릿 선택 영역")]),
  flow("PORT-13", "portfolio-builder", "미리보기를 선택한다", "선택한 프로젝트 순서와 각 프로젝트의 제목·설명을 요약해서 확인한다", "구현됨", "현재 미리보기는 선택 프로젝트 요약이다. 최종 상세와 같은 화면을 보장하지 않는다.", [evidence("builder", 697, "미리보기 열기"), evidence("builder", 965, "선택 목록 미리보기")], [], [state("빈 화면", "선택한 프로젝트가 없음", "프로젝트 선택을 요청하는 문구를 표시한다."), state("입력", "키보드로 미리보기를 조작함", "대화상자 포커스 고정·Escape 닫기·트리거 복귀를 제공한다.", "제안")]),
  flow("PORT-14", "portfolio-builder", "미리보기의 닫기를 선택한다", "포트폴리오 제작 화면으로 돌아간다", "구현됨", "닫기 버튼이 미리보기 상태를 해제한다.", [evidence("builder", 986, "미리보기 닫기")]),
  flow("PORT-15", "portfolio-builder", "완성될 포트폴리오를 미리 확인한다", "입력한 제목·설명·썸네일·템플릿이 최종 상세와 같게 표시된다", "미구현", "현재 미리보기는 고정 My Projects 제목의 프로젝트 요약이며 제작 입력 전체를 전달받지 않는다.", [evidence("builder", 965, "현재 요약 미리보기의 범위")]),
  flow("PORT-16", "portfolio-builder", "비공개 저장을 선택한다", "포트폴리오를 생성하고 정보·선택·순서를 저장한 뒤 상세로 이동한다", "확인 필요", "[P1 · BE 선합의 · PORT-01] 순차 요청·userId 생략·일부 실패 후 중복 생성 가능성이 있다. 팀 문서의 통합 저장·복구 제안과 대학 인증·연결/순서 계약을 합의해야 한다.", [evidence("builder", 284, "비공개 저장"), evidence("portfolioApi", 208, "생성 요청"), evidence("guide", 108, "포트폴리오 계약 차이")], ["COND-PORTFOLIO-ACCESS", "COND-PORTFOLIO-PROJECTS", "COND-PORTFOLIO-SAVE"], portfolioSaveStates),
  flow("PORT-17", "portfolio-builder", "제작 화면에서 이전으로 돌아가기를 선택한다", "내 포트폴리오 모음으로 이동한다", "구현됨", "제작 화면 상단에 모음으로 돌아가는 링크가 있다.", [evidence("builder", 357, "제작에서 모음으로 이동")], ["COND-MYPAGE"], [state("오류", "미저장 변경사항이 있음", "이동 전에 미저장 내용의 유실을 안내한다.", "제안")]),

  flow("MYPORT-01", "portfolios", "내 포트폴리오 모음을 연다", "내 포트폴리오와 공개 상태를 확인한다", "확인 필요", "[P1 · BE 선합의 · LIST-01] 현재 size 8 첫 페이지를 표시한다. 팀 정책의 포트폴리오 6개 단위 목록·삭제 제외·자동 비공개 사유 제공 계약을 반영해야 한다.", [evidence("myPortfoliosRoute", 15, "내 포트폴리오 조회"), evidence("myPortfolios", 237, "포트폴리오 목록")], ["COND-MYPAGE"], [state("빈 화면", "포트폴리오가 없음", "아직 포트폴리오가 없습니다 안내와 제작 카드를 표시한다."), state("오류", "목록 조회 실패", "조회 실패 제목과 원인을 표시한다.")]),
  flow("MYPORT-02", "portfolios", "포트폴리오 제작 카드를 선택한다", "포트폴리오 제작 화면으로 이동한다", "구현됨", "제작 카드에 /portfolios/new 링크가 있다.", [evidence("myPortfolios", 82, "포트폴리오 제작 진입")], ["COND-PORTFOLIO-ACCESS"]),
  flow("MYPORT-03", "portfolios", "포트폴리오 카드를 선택한다", "해당 slug의 상세를 표시한다", "구현됨", "[P0 · BE 선합의 · ACCESS-01] slug 이동과 오류 화면은 있다. 소유자 비공개 열람·타인 404·삭제 제외와 비로그인 401/404 우선순위는 실제 서버에서 확인해야 한다.", [evidence("myPortfolios", 247, "상세로 이동"), evidence("portfolioRoute", 21, "slug 상세 경로")], ["COND-PORTFOLIO-VISIBILITY"], [state("오류", "상세를 찾지 못함", "404 화면을 표시한다."), state("오류", "상세 조회 실패", "오류 안내와 모음으로 돌아가기 링크를 표시한다.")]),
  flow("MYPORT-04", "portfolios", "포트폴리오 상세의 프로젝트를 선택한다", "해당 프로젝트 상세로 이동한다", "구현됨", "[P1 · BE 선합의 · PORT-01] 프로젝트 상세 이동은 있다. 팀 정책상 비공개 프로젝트는 포트폴리오에 표시하지 않으며 삭제 자료 제외·관리 조회 범위는 후속 응답과 대조해야 한다.", [evidence("portfolioDetail", 118, "포함 프로젝트 열람")], ["COND-PORTFOLIO-VISIBILITY"], [state("빈 화면", "표시할 공개 프로젝트가 없음", "포함된 프로젝트 없음 안내를 표시한다.")]),
  flow("MYPORT-05", "portfolios", "포트폴리오 상세에서 모음으로 돌아간다", "내 포트폴리오 모음으로 이동한다", "구현됨", "고정 마이페이지 링크다. 비로그인 방문자는 마이페이지 인증 조건이 적용된다.", [evidence("portfolioDetail", 58, "모음으로 이동")], ["COND-MYPAGE"]),
  flow("MYPORT-06", "portfolios", "공개 포트폴리오 주소를 연다", "로그인 없이 공개 상세를 열람한다", "확인 필요", "[P0 · BE 선합의 · ACCESS-01] 공개 slug 조회 경로는 있다. 비로그인 공개 조회·비공개 소유자만 열람·권한 없는 404·삭제 제외를 실제 서버에서 검증해야 한다.", [evidence("portfolioRoute", 21, "포트폴리오 상세"), evidence("api", 1571, "공개 상세 접근 계약")], ["COND-PORTFOLIO-VISIBILITY"]),
  flow("MYPORT-07", "portfolios", "포트폴리오 공개 전환을 선택한다", "조건을 만족한 포트폴리오를 공개한다", "미구현", "[P1 · BE 선합의 · PORT-01] 공개 변경 helper만 있고 UI가 없다. 공개 프로젝트 1개 이상 조건과 모두 비공개가 됐을 때 자동 전환을 반영하며 삭제/연결 제거로 0개가 되는 경계는 확인해야 한다.", [evidence("api", 1119, "공개 전환 계약"), evidence("builder", 284, "비공개로 고정 저장")], ["COND-PORTFOLIO-VISIBILITY", "COND-PORTFOLIO-OWNER"], [state("권한", "공개·발행 프로젝트가 하나도 없음", "공개할 수 없는 이유와 필요한 프로젝트 조건을 안내한다.", "제안")]),
  flow("MYPORT-08", "portfolios", "포트폴리오 비공개 전환을 선택한다", "포트폴리오를 비공개 상태로 변경한다", "미구현", "[P1 · BE 선합의 · PORT-01] 공개 변경 계약과 helper만 있고 기존 포트폴리오 전환 UI는 없다. 소유자 권한·오류와 자동 전환된 상태의 안내도 연결해야 한다.", [evidence("api", 1119, "비공개 전환 계약")], ["COND-PORTFOLIO-VISIBILITY", "COND-PORTFOLIO-OWNER"]),
  flow("MYPORT-09", "portfolios", "기존 포트폴리오 정보를 수정하고 저장한다", "제목·설명·썸네일을 갱신하고 기존 주소를 유지한다", "미구현", "[P1 · BE 선합의 · PORT-01] 정보 수정 helper는 신규 제작에만 쓰인다. 기존 편집·관리 조회와 제목 변경 후 slug 유지·권한 오류를 연결해야 한다.", [evidence("api", 1027, "정보 수정 및 slug 유지 계약")], ["COND-PORTFOLIO-OWNER"]),
  flow("MYPORT-10", "portfolios", "기존 포트폴리오에 프로젝트를 추가하거나 제거한다", "프로젝트 연결 목록을 갱신한다", "미구현", "[P1 · BE 선합의 · PORT-01] 연결 수정 API는 있지만 기존 편집 UI가 없다. OWNER/MEMBER 참여·50개·중복 방지와 제거 후 공개 가능 항목이 0개일 때의 정책을 합의해야 한다.", [evidence("api", 1211, "기존 프로젝트 연결 수정 계약")], ["COND-PORTFOLIO-OWNER", "COND-PORTFOLIO-PROJECTS"]),
  flow("MYPORT-11", "portfolios", "기존 포트폴리오의 순서를 변경하고 저장한다", "저장된 프로젝트 표시 순서를 갱신한다", "미구현", "[P1 · BE 선합의 · PORT-01] 신규 제작 순서 UI만 있다. 기존 관리 조회에서 연결 목록을 복원하고 저장 순서가 전체 연결 ID와 일치하는지 확인해야 한다.", [evidence("api", 1303, "기존 순서 변경 계약")], ["COND-PORTFOLIO-OWNER", "COND-PORTFOLIO-PROJECTS"]),
  flow("MYPORT-12", "portfolios", "포트폴리오 삭제를 선택한다", "포트폴리오를 모음에서 제외하고 원본 프로젝트는 유지한다", "미구현", "[P1 · BE 선합의 · PORT-01] DELETE 계약만 있고 사용자 UI·호출이 없다. 소프트 삭제·모든 조회 제외·원본 프로젝트 유지·slug 재사용 금지를 연결해야 한다.", [evidence("api", 957, "포트폴리오 삭제 계약")], ["COND-PORTFOLIO-OWNER"], [state("진행 중", "삭제 전", "삭제 대상과 원본 프로젝트 보존 범위를 확인하도록 안내한다.", "제안")]),
  flow("MYPORT-13", "portfolios", "공개·비공개 목록 필터를 선택한다", "선택 상태의 포트폴리오만 표시한다", "미구현", "[P1 · BE 선합의 · LIST-01] isPublic query helper는 있으나 필터 UI가 없다. 포트폴리오 6개 페이지 및 실제 공개 상태 응답과 함께 연결해야 한다.", [evidence("api", 1500, "목록 공개 상태 필터 계약"), evidence("myPortfoliosRoute", 29, "현재 목록 조회")]),
  flow("MYPORT-14", "portfolios", "포트폴리오 모음의 다음 페이지를 선택한다", "다음 포트폴리오 목록을 확인한다", "미구현", "[P1 · FE 선행 · LIST-01] page 0·size 8 고정 요청을 6개로 맞추고 기존 페이지 메타를 이용한 이동을 먼저 연결할 수 있다. 본인 식별과 실제 응답 검증은 BE 선합의가 필요하다.", [evidence("myPortfoliosRoute", 29, "첫 페이지 고정 조회")]),
  flow("MYPORT-15", "portfolios", "포트폴리오 공유를 선택한다", "외부에 전달할 포트폴리오 주소를 확인한다", "미구현", "[P1 · FE 선행 · PORT-01] slug와 상세 경로는 있지만 사용자 공유 UI는 없다. 기존 주소를 유지하고 공개/비공개 접근 안내를 준비할 수 있으며 복사·QR은 별도 제안이다.", [{ path: "README.md", line: 3, label: "포트폴리오 공유 목표" }, evidence("portfolioDetail", 58, "현재 상세 UI")], ["COND-PORTFOLIO-VISIBILITY"], [state("권한", "비공개 포트폴리오를 공유하려 함", "상대의 접근 가능 여부와 공개 전환 조건을 안내한다.", "제안")]),

  flow("MYPORT-16", "portfolios", "포트폴리오가 자동으로 비공개가 된 이유를 확인한다", "현재 비공개 상태와 다시 공개하기 위해 필요한 조건을 확인한다", "미구현", "[P1 · BE 선합의 · PORT-01] 팀 정책은 포함 프로젝트가 모두 비공개이면 자동 비공개다. 현재 사유 표시가 없고 응답 필드도 없다. 삭제·연결 제거로 0개가 된 경우의 적용은 별도로 합의해야 한다.", [evidence("myPortfolios", 237, "현재 포트폴리오 목록"), evidence("portfolioDetail", 58, "현재 상세 표시")], ["COND-PORTFOLIO-VISIBILITY"]),
  flow("MYPORT-17", "portfolios", "삭제한 포트폴리오의 이전 공유 주소를 연다", "삭제된 포트폴리오가 노출되지 않고 원본 프로젝트는 유지된다", "확인 필요", "[P0 · BE 선합의 · ACCESS-01] 현재 slug 404 처리는 있다. 소프트 삭제·모든 목록/검색 제외·삭제 slug 재사용 금지를 실제 서버에서 확인해야 한다.", [evidence("portfolioRoute", 21, "현재 slug 조회"), evidence("api", 957, "기존 삭제·원본 보존 계약")], ["COND-PORTFOLIO-OWNER"]),

  flow("PROFILE-01", "profile", "프로필 설정을 연다", "기존 프로필 또는 새 프로필 입력 폼을 표시한다", "확인 필요", "[P0 · BE 선합의 · AUTH-01] 프로필 조회·404 분기는 있으나 본인 식별 query 불일치가 있다. 인증 쿠키 기반 조회를 합의하고 프로필 없음과 인증 없음의 응답을 구별해야 한다.", [evidence("profileRoute", 16, "프로필 조회"), evidence("profileApi", 22, "현재 조회 요청")], ["COND-MYPAGE", "COND-PROFILE"], [state("오류", "프로필 조회 실패", "설정 화면에 조회 오류 본문을 표시한다.")]),
  flow("PROFILE-02", "profile", "이름·닉네임·전공·학년·이미지 URL·자기소개를 입력한다", "폼과 프로필 미리보기에 반영한다", "구현됨", "[P1 · FE 선행 · PROFILE-01] 입력·미리보기·닉네임 필수 검증은 있다. 팀 정책의 계정 간 중복 금지와 초대 검색용 닉네임 안내·중복 오류 상태를 준비해야 한다.", [evidence("profile", 153, "프로필 입력 상태"), evidence("profile", 397, "프로필 미리보기")], ["COND-MYPAGE", "COND-PROFILE"], [state("입력", "필수 닉네임 누락 또는 입력 길이·학년·URL 검증 실패", "검증 메시지를 표시하고 저장을 중단한다."), state("오류", "이미지 URL을 불러올 수 없음", "이니셜 등 대체 이미지를 제공한다.", "제안")]),
  flow("PROFILE-03", "profile", "새 프로필을 작성하고 저장한다", "프로필을 생성하고 성공 메시지를 표시한다", "확인 필요", "[P1 · BE 선합의 · PROFILE-01] 생성 후 PATCH 실패 시 재시도는 수정돼 있다. 첫 저장 통합·닉네임 중복·본인 식별·학년 null 계약과 실제 응답 검증은 남는다.", [evidence("profile", 177, "새 프로필 저장", PROFILE_RETRY_REVISION), evidence("profile", 209, "생성 후 추가 저장 재시도", PROFILE_RETRY_REVISION), evidence("api", 392, "프로필 생성 userId 명세"), evidence("api", 2199, "학년 타입 명세")], ["COND-PROFILE"], [state("오류", "생성 성공 후 추가 정보 저장 실패", "오류와 입력값을 유지하며 같은 화면에서 다시 저장하면 추가 정보만 다시 요청한다.")]),
  flow("PROFILE-04", "profile", "기존 프로필을 수정하고 저장한다", "프로필을 갱신하고 성공 안내와 새로고침을 제공한다", "확인 필요", "[P1 · BE 선합의 · PROFILE-01] 수정은 연결돼 있으나 닉네임 중복 전용 계약·userId·선택 항목 비우기 의미가 미확정이다. 팀원 검색에 쓰는 유일한 닉네임을 유지해야 한다.", [evidence("profile", 195, "기존 프로필 수정"), evidence("profile", 229, "저장 성공 처리"), evidence("guide", 108, "프로필 API 차이")], ["COND-PROFILE"], [state("진행 중", "저장 요청 중", "중복 제출을 제한한다."), state("오류", "프로필 없음·인증 만료 또는 저장 오류", "원인에 맞는 오류 메시지를 표시한다.")]),

  flow("PROFILE-05", "profile", "다른 계정이 사용 중인 닉네임으로 저장한다", "중복 닉네임을 구분해 안내받고 다른 이름으로 다시 저장한다", "확인 필요", "[P1 · BE 선합의 · PROFILE-01] 현재 필수·길이 검증과 일반 저장 오류는 있다. 팀 정책의 닉네임 유일성·중복 응답·탈퇴 복구 시 충돌 처리는 아직 별도 계약이 필요하다.", [evidence("profile", 177, "현재 프로필 저장"), evidence("profile", 229, "현재 저장 결과 처리")], ["COND-PROFILE", "COND-ACCOUNT-RECOVERY"]),

  flow("LIMIT-01", "service", "요청이 제한되었다는 안내를 확인한다", "제한 사유와 다시 시도할 수 있는 시점을 확인한다", "미구현", "[P1 · BE 선합의 · LIMIT-01] 현재 일반 오류만 표시한다. 팀 정책의 IP/사용자·기능별 제한과 임시 차단을 구별할 응답·대기 정보가 없으며 검색 제한 범위와 적용 우선순위는 합의해야 한다.", [evidence("client", 92, "현재 공통 오류 처리"), evidence("email", 229, "현재 인증 요청")], ["COND-RATE-LIMIT"]),
  flow("LIMIT-02", "service", "대기 시간이 지난 뒤 실패한 요청을 다시 시도한다", "허용된 요청만 다시 보내고 중복 실행과 반복 호출을 피한다", "미구현", "[P1 · BE 선합의 · LIMIT-01] 현재 공통 대기·재시도 흐름은 없다. 제한 응답과 서버 처리 여부를 확인한 뒤 검색·로그인·인증·서명 URL·생성 요청을 구분해 연결해야 한다.", [evidence("client", 92, "현재 단일 요청 처리"), evidence("builder", 284, "현재 다단계 저장")], ["COND-RATE-LIMIT", "COND-REFRESH"]),

  flow("OTHER-01", "planned", "지원 메뉴를 선택한다", "서비스 지원 내용을 확인한다", "미구현", "현재 제목과 placeholder만 있다. FAQ·문의 방법 등 구체 내용은 아직 미정이다.", [evidence("support", 8, "지원 placeholder")]),
  flow("OTHER-02", "planned", "인증 화면의 Policy·Contact·Help Center를 선택한다", "선택한 안내 내용을 확인한다", "미구현", "현재 세 링크 모두 홈으로 연결되어 목적에 맞는 안내가 없다.", [evidence("email", 535, "안내 링크의 현재 목적지")]),
  flow("OTHER-03", "planned", "다크 모드를 선택한다", "화면 테마를 변경한다", "미구현", "후속 기획은 있으나 테마 선택 UI가 없다.", [evidence("plan", 244, "다크 모드 후속 기획")]),
  flow("OTHER-04", "planned", "Event·전시 화면을 연다", "전시와 참여 프로젝트를 살펴본다", "확인 필요", "기존 전시 후속 기획이며 현재 경로가 없다. 이번 핵심 서비스·팀 최종 정책 연동 범위에 포함하지 않는다.", [evidence("plan", 243, "Event·전시 범위 결정 필요")]),
];

const conditions: ConditionFlow[] = [
  { id: "COND-LOGIN", title: "로그인 여부와 인증 유지", summary: "Google 로그인·본인 조회·계정 메뉴와 서버 장애 구분", status: "확인 필요", statusNote: "[P0 · BE 선합의 · AUTH-01] 로그인 UI는 있으나 JWT 재발급·쿠키 유지·본인 식별 계약은 미연결이다. 아래 팀 정책 목표는 현재 구현 완료를 뜻하지 않는다.", cases: [
    { when: "비로그인", result: "현재 헤더에 로그인·회원가입 진입을 표시한다. 공개 프로젝트·공개 포트폴리오는 팀 정책상 비로그인 조회가 가능하다.", origin: "기존" },
    { when: "Google 계정으로 로그인", result: "팀 정책은 이메일 도메인 제한 없이 허용한다. 현재 SDK 연결은 있지만 실제 Google 클라이언트 ID 일치와 서버 인증은 미검증이다.", origin: "기존" },
    { when: "현재 사용자 조회 성공", result: "현재 마이페이지와 모바일 계정 메뉴를 표시한다. 요청자의 본인 식별은 인증 쿠키로 처리하는 방향을 BE와 합의한다.", origin: "기존" },
    { when: "현재 사용자 조회 실패", result: "현재는 비로그인처럼 표시하거나 로그인으로 이동한다. 인증 만료와 일시 장애를 구분하는 복구는 미구현이다.", origin: "기존" },
  ], evidence: [evidence("header", 14, "현재 로그인 상태 조회"), evidence("api", 1389, "현재 사용자 조회 계약"), evidence("api", 659, "Google 로그인·가입 계약")] },
  { id: "COND-NEXT", title: "로그인·대학 인증 후 돌아갈 목적지", summary: "안전한 내부 경로와 DRAFT·발행 인증 조건 구분", status: "확인 필요", statusNote: "[P1 · FE 선행 · PROJ-01] 안전한 next 정규화는 있지만 작성·수정 진입에 대학 인증을 강제한다. 미인증 DRAFT 허용 정책에 맞춰 진입과 발행 조건을 분리해야 한다.", cases: [
    { when: "현재 작성·수정 목적지이며 대학 미인증", result: "현재는 원래 목적지를 유지한 인증 화면으로 이동한다. 팀 정책의 미인증 DRAFT 생성 허용과 다르다.", origin: "기존" },
    { when: "팀 정책에 따라 로그인 후 DRAFT를 작성", result: "대학 미인증이어도 작성 진입을 허용하도록 수정한다. 발행은 OWNER·대학 인증 조건을 따로 검사한다.", origin: "기존" },
    { when: "인증 완료 또는 인증 불필요 경로", result: "현재 유효한 next 경로로 이동한다.", origin: "기존" },
    { when: "next가 없거나 외부 경로", result: "현재 안전한 내부 기본 경로인 홈으로 이동한다.", origin: "기존" },
  ], evidence: [evidence("login", 58, "인증 후 이동"), evidence("routes", 58, "안전한 내부 경로")] },
  { id: "COND-MYPAGE", title: "마이페이지 접근과 현재 로그인 복귀", summary: "내 프로젝트·포트폴리오·설정·지원의 접근 조건", status: "확인 필요", statusNote: "[P0 · BE 선합의 · AUTH-01] 현재 로그인 게이트·/mypage 복귀는 있다. 만료 재발급과 장애 구별 없이 사용자 조회 실패를 모두 로그인 이동으로 처리한다.", cases: [
    { when: "로그인 상태로 접근", result: "현재 요청한 마이페이지 화면을 표시한다.", origin: "기존" },
    { when: "현재 비로그인 또는 사용자 조회 실패", result: "현재 next=/mypage로 로그인에 이동한다. 만료 복구·일시 장애 재시도를 별도로 연결해야 한다.", origin: "기존" },
    { when: "특정 하위 탭에서 로그인 필요", result: "처음 요청한 내부 경로로 복귀하도록 한다. 세부 복귀 연결은 추가 작업이다.", origin: "제안" },
  ], evidence: [evidence("authGate", 29, "마이페이지 인증 게이트")] },
  { id: "COND-EMAIL", title: "대학 이메일·인증번호·만료와 제한", summary: "별도 .ac.kr 이메일과 서버 기준 유효기간", status: "확인 필요", statusNote: "[P0 · BE 선합의 · AUTH-02] .ac.kr 입력은 있지만 삼육대 한정 안내·3분 고정 타이머가 남는다. FE 선행으로 문구를 바꾸고 실제 발송·서버 시각·제한 응답은 합의 후 연결한다.", cases: [
    { when: "일반 Google 이메일로 로그인하고 별도 .ac.kr 입력", result: "팀 정책은 두 주소의 일치를 검사하지 않는다. 현재 별도 입력은 가능하지만 실제 서버 수용을 확인해야 한다.", origin: "기존" },
    { when: "유효한 .ac.kr 이메일·사용자 조회 완료", result: "현재 코드를 요청하고 발송 후 이메일 입력을 잠근다. 실제 메일 발송 방식은 확인 전이다.", origin: "기존" },
    { when: "6자리 코드·현재 타이머 잔여 시간 있음", result: "현재 인증 확인이 가능하다. 서버 만료 시각을 반영하는 기능은 미연결이다.", origin: "기존" },
    { when: "현재 고정 3분 만료", result: "현재 확인을 막고 재전송을 활성화한다. 서버 재발송 가능 시각과 일치하는지는 확인 전이다.", origin: "기존" },
    { when: "코드 발송 10분 3회 또는 검증 10분 10회 제한", result: "팀 정책의 제한 대상이며 대기·재시도 안내에 필요한 응답은 합의해야 한다.", origin: "기존" },
    { when: "이미 대학 인증 완료", result: "현재 인증 화면을 건너뛰고 목적지로 이동한다.", origin: "기존" },
    { when: "이메일 오입력 뒤 전송", result: "이메일을 바꾸고 인증 단계를 다시 시작할 수 있는 수단을 제공한다.", origin: "제안" },
  ], evidence: [evidence("email", 48, "이메일 검사"), evidence("email", 123, "버튼 활성 조건"), evidence("email", 148, "인증 상태 분기"), evidence("api", 775, "메일 발송 계약")] },
  { id: "COND-FILTER", title: "모바일 필터의 임시 선택과 적용", summary: "선택 중인 태그와 실제 결과 조건을 구분", status: "구현됨", statusNote: "적용 시점에만 결과 URL을 갱신한다.", cases: [
    { when: "필터 안에서 태그만 선택", result: "필터 내부 임시 선택만 변경하고 결과는 유지한다.", origin: "기존" },
    { when: "적용 선택", result: "선택 태그를 URL에 반영하고 첫 페이지로 이동한다.", origin: "기존" },
    { when: "취소·닫기", result: "기존 적용 조건과 검색 결과를 유지한다.", origin: "기존" },
  ], evidence: [evidence("filter", 1, "임시 필터 상태와 적용")] },
  { id: "COND-EDITOR-ACCESS", title: "DRAFT 작성과 발행의 인증 조건", summary: "로그인만으로 임시 작성·대학 인증 후 발행", status: "확인 필요", statusNote: "[P1 · FE 선행 · PROJ-01] 현재 작성 진입·저장·업로드에 대학 인증을 강제한다. 팀 정책은 미인증 DRAFT 생성 허용이며 발행 시 OWNER·대학 인증을 요구한다.", cases: [
    { when: "현재 쿠키 없음 또는 사용자 조회 실패", result: "현재 작성·수정 경로를 next에 담아 로그인으로 이동한다. 서버 장애를 로그인 실패와 구별하는 작업은 AUTH-01이다.", origin: "기존" },
    { when: "로그인했지만 대학 미인증", result: "팀 정책상 DRAFT를 만들 수 있다. 현재 인증 화면으로 보내는 진입과 저장 게이트는 수정이 필요하다.", origin: "기존" },
    { when: "OWNER이며 대학 인증 완료", result: "팀 정책상 발행할 수 있다. 제목·썸네일·본문 길이 조건도 함께 만족해야 한다.", origin: "기존" },
    { when: "OWNER가 아닌 참여자", result: "팀 정책상 비공개 열람은 가능하나 수정·업로드·발행은 허용하지 않는다. DRAFT 열람 적용은 별도 확인이 필요하다.", origin: "기존" },
  ], evidence: [evidence("createRoute", 14, "작성 접근"), evidence("editRoute", 18, "수정 접근")] },
  { id: "COND-PROJECT-OWNER", title: "프로젝트 작성자와 수정 권한", summary: "OWNER 1명과 MEMBER 열람 권한·변경 권한 분리", status: "미구현", statusNote: "[P0 · BE 선합의 · ACCESS-01] 현재 역할별 버튼 제한이 없고 403을 대학 인증 필요로 단정한다. 팀 정책의 OWNER/MEMBER 권한과 401·403·404 구별을 연결해야 한다.", cases: [
    { when: "프로젝트 OWNER", result: "팀 정책상 본문·태그 수정, 파일 업로드, 팀원 추가·제거, 공개 전환·삭제를 할 수 있다. 발행은 대학 인증이 추가로 필요하다.", origin: "기존" },
    { when: "프로젝트 MEMBER", result: "팀 정책상 비공개 프로젝트를 열람할 수 있지만 OWNER 전용 변경 행동은 할 수 없다.", origin: "기존" },
    { when: "로그인했지만 삭제·공개 전환 권한 없음", result: "팀 정책상 403이며 권한 부족으로 안내해야 한다. 현재 편집기의 대학 인증 안내와 구분한다.", origin: "기존" },
    { when: "비공개 열람 권한 없음", result: "팀 정책상 404로 존재를 숨긴다. 비로그인 요청의 401/404 우선순위와 DRAFT 범위는 BE 확인이 남는다.", origin: "기존" },
  ], evidence: [evidence("api", 914, "OWNER 전용 수정"), evidence("myProjects", 162, "설정 진입"), evidence("editor", 271, "권한 오류의 현재 인증 안내")] },
  { id: "COND-UPLOAD", title: "프로젝트 파일·이미지와 만료 URL", summary: "PNG/JPG·100MB·S3 키·5분 URL·파일 연결/삭제", status: "확인 필요", statusNote: "[P1 · BE 선합의 · PROJ-03] 현재 multipart 업로드·50MiB 제한·고정 fileUrl과 로컬 제거를 사용한다. 팀 정책의 S3 식별/연결/URL 발급 및 파일 삭제 계약을 먼저 합의해야 한다.", cases: [
    { when: "현재 PDF·Markdown·JPG·JPEG·PNG/50MiB 이하 파일", result: "현재는 이 형식·용량으로 검증해 업로드한다. 신규 팀 정책의 PNG/JPG·100MB와 다르다.", origin: "기존" },
    { when: "팀 정책에 맞는 PNG/JPG 파일 업로드", result: "100MB 이하이며 요청 Content-Type과 서버 판별 MIME이 모두 유효해야 한다. 업로드·프로젝트 연결 완료 요청 형태는 합의 전이다.", origin: "기존" },
    { when: "서명 URL 발급 후 5분 경과", result: "팀 정책상 만료되므로 새 열람 URL을 받는 흐름이 필요하다. 현재 자동 복구는 없다.", origin: "기존" },
    { when: "24시간 동안 프로젝트에 연결하지 않은 파일", result: "팀 정책상 서버 예약 작업으로 삭제한다. 화면은 연결 여부와 실패 복구 결과를 확인할 수 있어야 한다.", origin: "기존" },
    { when: "연결 파일 삭제", result: "팀 정책상 S3에서 즉시 제거한다. 현재는 화면 배열만 제거하며 본문/대표 이미지에서 참조한 파일의 처리도 합의해야 한다.", origin: "기존" },
    { when: "업로드 중", result: "현재 본문·도구·파일 선택·저장을 제한한다. 드롭과 첨부 제거의 충돌 방어는 별도 확인이 필요하다.", origin: "기존" },
  ], evidence: [evidence("editor", 620, "로컬 파일 제거"), evidence("guide", 111, "파일 계약과 현재 제약"), evidence("api", 1634, "서버 파일 삭제 계약")] },
  { id: "COND-PROJECT-SAVE", title: "프로젝트 신규·임시저장·수정", summary: "미인증 임시저장과 강화된 발행 조건·DRAFT 재개", status: "확인 필요", statusNote: "[P1 · FE 선행 · PROJ-01] 신규 저장·발행은 있지만 미인증 DRAFT, 썸네일 필수·본문 30~50,000자, 재개 후 발행은 미반영이다. 상태 조회와 요청 필드는 BE 선합의가 필요하다.", cases: [
    { when: "로그인한 미인증 사용자가 임시저장", result: "팀 정책상 DRAFT 생성 가능이다. 현재 저장 직전 대학 인증 검사를 분리해야 한다.", origin: "기존" },
    { when: "현재 비공개 저장 버튼", result: "DRAFT 생성·수정 경로다. 발행된 프로젝트의 공개 여부 변경과 같은 기능이 아니다.", origin: "기존" },
    { when: "발행 요청", result: "팀 정책상 OWNER·대학 인증·제목과 썸네일 필수·본문 30~50,000자를 만족해야 한다. 현재 일부 검증이 없다.", origin: "기존" },
    { when: "저장한 DRAFT를 다시 열어 발행", result: "현재 edit 분기는 PATCH만 수행한다. 상태를 확인하고 동일 프로젝트를 발행하는 경로를 추가해야 한다.", origin: "기존" },
    { when: "공개 프로젝트 내용 수정", result: "현재 PATCH를 수행한다. 상세 즉시 반영·편집 복원은 화면 협의 요청이며 서버 결과를 확인해야 한다.", origin: "기존" },
  ], evidence: [evidence("editor", 659, "임시 저장"), evidence("editor", 696, "신규·수정 저장 분기")] },
  { id: "COND-PROJECT-VISIBILITY", title: "프로젝트 공개·비공개·삭제 조회", summary: "공개 비로그인 열람·비공개 OWNER/MEMBER·삭제 제외", status: "확인 필요", statusNote: "[P0 · BE 선합의 · ACCESS-01] 팀 정책의 공개 범위와 404 숨김·소프트 삭제 제외를 현재 조회에 연결해야 한다. DRAFT의 MEMBER 열람과 비로그인 401/404 우선순위는 미확정이다.", cases: [
    { when: "공개 프로젝트 조회·검색", result: "팀 정책상 비로그인도 열람하고 검색은 공개 프로젝트만 반환한다. 실제 서버 결과는 미검증이다.", origin: "기존" },
    { when: "비공개 프로젝트의 OWNER 또는 MEMBER", result: "팀 정책상 열람 가능하다. 현재 상세 서버 조회에 인증 쿠키 전달 경로가 없다.", origin: "기존" },
    { when: "비공개 프로젝트를 다른 사용자가 조회", result: "팀 정책상 404로 존재를 숨긴다. 비로그인 요청의 응답 우선순위는 확인 후 적용한다.", origin: "기존" },
    { when: "DRAFT 상세에 팀원이 접근", result: "비공개 MEMBER 열람 규칙을 DRAFT에도 적용할지는 정책 경계로 남아 있다. 작성자만 또는 팀원 허용으로 임의 확정하지 않는다.", origin: "기존" },
    { when: "소프트 삭제된 프로젝트", result: "팀 정책상 공개·내 목록·검색·포트폴리오 연결 조회에서 제외한다.", origin: "기존" },
    { when: "같은 사용자가 다시 열람", result: "팀 정책은 반복 열람에서도 조회수 증가를 허용한다. 화면 수치와 서버 처리의 실제 확인이 필요하다.", origin: "기존" },
  ], evidence: [evidence("api", 71, "공개 검색 대상"), { path: "src/app/projects/[projectId]/page.tsx", line: 40, label: "상세 서버 조회" }] },
  { id: "COND-REVIEW", title: "AI 리뷰 요청 가능 조건", summary: "리뷰 진행 상태와 아직 명시되지 않은 권한 조건", status: "확인 필요", statusNote: "[P2 · BE 선합의 · INTEGRATION-01] 현재 서버의 자료·실행/열람 권한·보관·재시도 방식을 확인하는 항목이다. 신규 AI 기능이나 제한 정책을 확정하지 않는다.", cases: [
    { when: "프로젝트 ID가 있고 요청 중이 아님", result: "현재 리뷰 요청 버튼을 표시한다.", origin: "기존" },
    { when: "생성 중", result: "현재 중복 클릭을 막고 생성 중 상태를 표시한다.", origin: "기존" },
    { when: "분석 자료 없음·권한 부족·결과 재조회", result: "서버의 현재 처리 방식과 응답을 확인한 뒤 안내를 연결한다. 현재 API 설명만으로 정책을 정할 수 없다.", origin: "기존" },
  ], evidence: [evidence("review", 78, "현재 리뷰 요청 조건"), evidence("api", 181, "AI 리뷰 계약 범위")] },
  { id: "COND-PORTFOLIO-ACCESS", title: "포트폴리오 제작의 인증", summary: "대학 인증 계약과 현재 제작 경로의 차이", status: "확인 필요", statusNote: "[P0 · BE 선합의 · AUTH-02] 팀 정책과 명세는 대학 인증된 사용자만 생성하도록 한다. 현재 제작 경로의 인증 게이트·본인 식별 계약은 미완료다.", cases: [
    { when: "로그인 및 .ac.kr 대학 인증 완료", result: "팀 정책상 포트폴리오를 생성할 수 있다.", origin: "기존" },
    { when: "현재 제작 URL 직접 접근", result: "현재 내 프로젝트 조회를 시도하고 실패하면 오류와 빈 목록을 표시한다.", origin: "기존" },
    { when: "비로그인 또는 대학 미인증", result: "생성 전에 로그인·대학 인증을 안내하도록 연결해야 한다. 본인 식별·실패 응답은 BE 계약을 따른다.", origin: "기존" },
  ], evidence: [evidence("api", 532, "포트폴리오 생성 인증 계약"), evidence("portfolioCreate", 16, "현재 제작 조회"), evidence("portfolioApi", 208, "현재 생성 요청")] },
  { id: "COND-PORTFOLIO-PROJECTS", title: "포트폴리오 선택·연결·순서", summary: "참여 프로젝트 범위와 최대 개수, 공개에 포함되는 조건", status: "미구현", statusNote: "[P1 · BE 선합의 · PORT-01] 선택·순서 UI는 있으나 size 8 고정·50개 방어·기존 편집이 미완료다. 발행 프로젝트만 연결할지는 팀 문서의 확인 경계로 남는다.", cases: [
    { when: "프로젝트 연결 추가", result: "팀 정책상 자신이 OWNER/MEMBER로 참여한 프로젝트만 중복 없이 최대 50개까지 담는다.", origin: "기존" },
    { when: "순서 저장", result: "기존 명세는 현재 연결 ID 전체와 요청 순서가 정확히 일치해야 한다.", origin: "기존" },
    { when: "DRAFT를 포트폴리오에 연결하려 함", result: "발행된 프로젝트만 연결하자는 화면 요구의 적용 여부는 BE 확인 전이다. 현재 확정된 금지 정책으로 표시하지 않는다.", origin: "기존" },
    { when: "연결한 비공개 프로젝트", result: "팀 정책상 포트폴리오 상세에는 표시하지 않는다. 편집용 연결 목록을 제공할 범위는 합의해야 한다.", origin: "기존" },
    { when: "선택 프로젝트가 0개", result: "현재 빈 비공개 포트폴리오 저장을 허용한다. 공개 전환에는 공개 프로젝트가 필요하다.", origin: "기존" },
  ], evidence: [evidence("api", 1211, "프로젝트 연결 조건"), evidence("api", 1303, "프로젝트 순서 조건"), evidence("builder", 284, "선택 0개 저장 경로")] },
  { id: "COND-PORTFOLIO-SAVE", title: "포트폴리오 저장과 일부 실패", summary: "생성·정보·연결·순서·비공개 저장의 순차 처리", status: "확인 필요", statusNote: "[P1 · BE 선합의 · PORT-01] 현재 순차 저장은 일부 성공과 응답 유실 후 중복 생성 가능성이 있다. 통합 저장·재시도 보장은 팀 문서의 협의 요청이며 구현 완료가 아니다.", cases: [
    { when: "제목 없음 또는 기존 길이 제한 초과", result: "현재 입력 오류를 표시하고 저장하지 않는다.", origin: "기존" },
    { when: "현재 비공개 저장 성공", result: "생성→정보→프로젝트 연결→순서→비공개 요청 후 slug 상세로 이동한다.", origin: "기존" },
    { when: "저장 진행 중", result: "현재 저장 중 표시와 미리보기·저장 비활성화를 제공한다.", origin: "기존" },
    { when: "중간 실패 또는 응답 유실 후 재시도", result: "현재 데이터 재사용·롤백·중복 방지를 보장하지 않는다. 통합 저장과 복구 응답은 BE와 합의해야 한다.", origin: "기존" },
  ], evidence: [evidence("builder", 284, "순차 저장"), evidence("builder", 333, "저장 실패"), evidence("guide", 108, "서버 계약 차이")] },
  { id: "COND-PORTFOLIO-VISIBILITY", title: "포트폴리오 공개·비공개·열람", summary: "공개 전환 요건과 방문자가 실제 볼 수 있는 항목", status: "미구현", statusNote: "[P1 · BE 선합의 · PORT-01] 수동 공개 변경 UI와 자동 비공개 사유 표시가 없다. 모두 비공개인 경우의 자동 전환은 팀 정책이며 삭제/연결 제거로 0개가 되는 경우는 추가 확인이 필요하다.", cases: [
    { when: "공개로 전환", result: "팀 정책상 공개 프로젝트가 하나 이상 필요하다.", origin: "기존" },
    { when: "포함한 프로젝트가 모두 비공개로 바뀜", result: "팀 정책상 포트폴리오도 자동 비공개가 된다. 전환 사유·현재 상태를 보여줄 응답은 합의해야 한다.", origin: "기존" },
    { when: "프로젝트 삭제 또는 연결 제거로 공개 가능 항목이 0개", result: "자동 비공개를 적용하는지는 팀 문서의 확인 경계다. 임의 확정하지 않는다.", origin: "기존" },
    { when: "공개 포트폴리오 방문", result: "팀 정책상 비로그인도 열람하며 비공개 프로젝트는 상세에 표시하지 않는다.", origin: "기존" },
    { when: "비공개 포트폴리오 방문", result: "소유자만 열람한다. 타인 404는 팀 정책이고 비로그인 401/404 우선순위는 BE 확인이 남는다.", origin: "기존" },
  ], evidence: [evidence("api", 1119, "공개 전환 조건"), evidence("api", 1571, "공개·비공개 상세 정책")] },
  { id: "COND-PORTFOLIO-OWNER", title: "기존 포트폴리오 관리 권한", summary: "정보·연결·순서·공개 상태·삭제는 소유자 전용", status: "미구현", statusNote: "[P0 · BE 선합의 · ACCESS-01] 소유자 전용 변경·타인 403·비공개 타인 404·삭제 제외를 구분해야 한다. 기존 편집·삭제 UI는 없으며 PORT-01에서 연결한다.", cases: [
    { when: "로그인한 소유자", result: "팀 정책상 정보·연결·순서·공개 상태 변경과 삭제가 가능하다.", origin: "기존" },
    { when: "제목 수정", result: "기존 slug 주소를 유지한다.", origin: "기존" },
    { when: "프로젝트 연결 해제 또는 포트폴리오 삭제", result: "원본 프로젝트는 유지한다. 삭제된 포트폴리오는 모든 조회에서 제외하고 slug를 재사용하지 않는다.", origin: "기존" },
    { when: "다른 로그인 사용자의 수정·삭제 요청", result: "팀 정책상 403으로 거절한다. 존재를 숨기는 비공개 열람 404와 구분해 안내해야 한다.", origin: "기존" },
  ], evidence: [evidence("api", 1027, "정보 변경 권한"), evidence("api", 957, "삭제 및 원본 보존 정책")] },
  { id: "COND-PROFILE", title: "프로필 유무와 저장 계약", summary: "닉네임 필수·중복 금지·첫 저장과 선택 항목 비우기", status: "확인 필요", statusNote: "[P1 · BE 선합의 · PROFILE-01] 입력·생성/수정은 있지만 중복 없는 닉네임 계약과 첫 저장 통합·선택값 비우기 의미는 합의 전이다. 생성 후 PATCH 재시도 수정은 유지한다.", cases: [
    { when: "프로필 조회 404", result: "현재 빈 생성 폼을 표시한다. 인증 실패와 구별하는 응답 계약이 필요하다.", origin: "기존" },
    { when: "필수 닉네임이 없거나 다른 계정과 중복", result: "팀 정책상 허용하지 않는다. 현재 필수 검증은 있으나 닉네임 중복 응답과 안내는 정합화해야 한다.", origin: "기존" },
    { when: "최초 프로필에 추가 정보가 있음", result: "현재 POST 후 PATCH로 저장한다. 첫 요청에서 입력 전체를 반영하는 방식은 협의 요청이다.", origin: "기존" },
    { when: "POST 성공 후 PATCH 실패", result: "현재 입력을 유지하며 같은 화면 재시도 시 PATCH만 요청한다.", origin: "기존" },
    { when: "POST 응답 유실 후 재시도", result: "현재 POST부터 요청할 수 있어 생성 여부·충돌 처리를 BE와 확인해야 한다.", origin: "기존" },
    { when: "선택 항목을 비움", result: "현재 학년 null 등 명세와 차이가 있다. 생략과 명시적 비우기의 의미를 합의해야 한다.", origin: "기존" },
  ], evidence: [evidence("profile", 195, "생성·수정 분기", PROFILE_RETRY_REVISION), evidence("profile", 209, "추가 저장 전 생성 상태 반영", PROFILE_RETRY_REVISION), evidence("api", 392, "프로필 생성 userId 명세"), evidence("api", 2199, "학년 타입 명세")] },
  { id: "COND-REFRESH", title: "인증 만료·재발급·로그아웃 경합", summary: "만료 복구와 다시 로그인·서버 장애 구분", status: "미구현", statusNote: "[P0 · BE 선합의 · AUTH-01] refresh 호출·쿠키 전달·동시 요청 복구가 없다. HttpOnly 쿠키 계약과 실패 응답을 합의한 뒤 연결한다.", cases: [
    { when: "Access Token 만료 후 갱신 성공", result: "팀 문서의 목표는 원래 요청을 이어가는 것이다. 현재 재발급·원 요청 복구는 미구현이다.", origin: "기존" },
    { when: "갱신 불가 또는 일시적 서버 장애", result: "다시 로그인할 상황과 재시도할 상황을 구별한다. 응답·재시도 조건은 합의해야 한다.", origin: "기존" },
    { when: "동시에 여러 요청이 만료됨", result: "갱신을 공유하고 재귀·무한 재시도 및 중복 저장을 막는 복구를 구현한다.", origin: "제안" },
    { when: "로그아웃과 갱신이 동시에 진행됨", result: "팀 문서의 목표는 종료된 로그인이 다시 살아나지 않는 것이다. 새로고침·다른 화면에서도 비로그인 상태를 확인해야 한다.", origin: "기존" },
  ], evidence: [evidence("client", 92, "현재 공통 요청"), evidence("authPaths", 1, "현재 인증 경로")] },
  { id: "COND-TAGS", title: "태그 정규화와 제한", summary: "소문자·공백 하이픈·10자/10개·정규화 후 중복", status: "미구현", statusNote: "[P1 · FE 선행 · PROJ-02] 현재 태그 추가·원문 중복·10개 제한은 있으나 팀 정책의 정규화와 길이/문자 검사는 없다. 서버 최종 검증도 함께 대조해야 한다.", cases: [
    { when: "대문자나 공백이 포함된 태그", result: "팀 정책에 따라 소문자로 바꾸고 공백을 하이픈으로 바꾼다. 변환 결과를 사용자가 확인할 수 있어야 한다.", origin: "기존" },
    { when: "그 외 특수문자 또는 태그당 10자 초과", result: "팀 정책상 허용하지 않는다. 공백 치환으로 생긴 하이픈은 허용한다.", origin: "기존" },
    { when: "정규화 결과가 기존 태그와 같거나 10개 초과", result: "팀 정책상 중복·초과를 거절한다. 현재 원문 비교만 하는 로직을 보완해야 한다.", origin: "기존" },
  ], evidence: [evidence("editor", 437, "현재 태그 추가"), evidence("editor", 630, "현재 태그 저장")] },
  { id: "COND-PROJECT-TEAM", title: "팀원 닉네임 검색·초대·제거", summary: "OWNER 전용 팀 관리와 MEMBER 권한", status: "미구현", statusNote: "[P1 · BE 선합의 · PROJ-04] 팀원 조회 표시만 있고 검색·초대·제거는 없다. 초대 수락·중복 요청·멤버 제거 후 연결 처리 방식은 새 계약이 필요하다.", cases: [
    { when: "OWNER가 닉네임으로 사용자를 검색", result: "팀 정책은 계정 간 유일한 닉네임을 사용하며 소프트 삭제 계정을 검색에서 제외한다.", origin: "기존" },
    { when: "OWNER가 팀원을 추가하거나 제거", result: "팀 정책상 허용한다. 현재 요청 경로·결과 형식·초대 완료 시점은 미정이다.", origin: "기존" },
    { when: "MEMBER가 팀 관리·수정·업로드를 요청", result: "팀 정책상 허용하지 않는다. 비공개 열람만 가능한 역할과 변경 권한을 구별한다.", origin: "기존" },
    { when: "팀원 제거 또는 소유권 변경 뒤 화면을 다시 사용", result: "서버의 현재 역할을 다시 확인하고 접근·변경 가능 여부를 갱신한다. 기존 포트폴리오 연결 처리도 확인이 필요하다.", origin: "제안" },
  ], evidence: [evidence("detail", 37, "현재 참여자 표시"), evidence("myProjects", 162, "현재 설정 진입")] },
  { id: "COND-PROJECT-DELETE", title: "프로젝트 직접 삭제와 탈퇴 삭제", summary: "OWNER 직접 삭제·파일/북마크 정리·복구 경계 분리", status: "미구현", statusNote: "[P1 · BE 선합의 · PROJ-04] 직접 삭제 API·UI가 없다. 직접 삭제의 파일 정리와 탈퇴의 30일 복구를 같은 동작으로 처리하지 않는다.", cases: [
    { when: "OWNER가 프로젝트를 직접 삭제", result: "팀 정책에 따라 조회·검색에서 제외하고 해당 S3 파일과 북마크도 삭제한다. 직접 삭제의 복구 가능성은 별도로 확인해야 한다.", origin: "기존" },
    { when: "다른 로그인 사용자가 삭제 요청", result: "팀 정책상 403으로 거절한다.", origin: "기존" },
    { when: "OWNER가 탈퇴했고 남은 MEMBER가 없음", result: "팀 정책상 프로젝트를 소프트 삭제하고 30일 이내 복구할 수 있다. 복구용 파일·북마크 보존은 BE 합의가 남는다.", origin: "기존" },
    { when: "프로젝트 삭제로 포트폴리오 공개 가능 항목이 0개", result: "자동 비공개 적용 범위와 소유자 안내는 정책 경계로 확인해야 한다.", origin: "기존" },
  ], evidence: [evidence("myProjects", 162, "현재 프로젝트 관리 진입"), evidence("api", 1445, "기존 탈퇴 계약")] },
  { id: "COND-ACCOUNT-RECOVERY", title: "회원 탈퇴·30일 복구·소유권 이전", summary: "계정과 자료 복구·영구 비활성·닉네임 충돌", status: "미구현", statusNote: "[P1 · BE 선합의 · ACCOUNT-01] 팀 정책은 정해졌으나 현재 탈퇴·복구 UI와 응답 계약이 없다. 소유권 재이전·닉네임 충돌·파일/북마크 보존은 확인 전이다.", cases: [
    { when: "탈퇴 요청", result: "팀 정책상 계정을 소프트 삭제하고 모든 조회·검색에서 제외한다. MEMBER 관계는 제거한다.", origin: "기존" },
    { when: "탈퇴자가 OWNER이고 MEMBER가 남음", result: "팀 정책상 가장 오래된 MEMBER에게 소유권을 넘겨 OWNER 1명 규칙을 유지한다.", origin: "기존" },
    { when: "탈퇴 후 30일 이내 같은 Google 계정으로 로그인", result: "팀 정책상 계정·프로젝트·포트폴리오·멤버 관계·북마크를 복구한다. 이미 이전한 소유권·다시 사용된 닉네임은 처리 방식 합의 후 안내한다.", origin: "기존" },
    { when: "30일이 지난 뒤 같은 Google 계정으로 로그인", result: "팀 정책상 이전 계정은 영구 비활성이고 새 계정으로 가입한다. 이전 자료를 복구한다고 안내하지 않는다.", origin: "기존" },
  ], evidence: [evidence("api", 1445, "기존 회원 탈퇴 계약"), evidence("login", 45, "현재 일반 로그인 처리")] },
  { id: "COND-RATE-LIMIT", title: "기능별 호출 제한과 재시도", summary: "IP/사용자 기준·기능별 제한·임시 차단", status: "미구현", statusNote: "[P1 · BE 선합의 · LIMIT-01] 팀 정책의 제한은 있지만 현재 제한 사유·대기·복구 UI는 없다. 검색 확정값·일반/기능별 우선순위·임시 차단·재시도 정보는 합의해야 한다.", cases: [
    { when: "일반 API 호출", result: "팀 정책은 비로그인 IP당 1분 60회, 로그인 사용자당 1분 120회다. 두 기준과 기능별 제한의 적용 순서는 확인해야 한다.", origin: "기존" },
    { when: "검색 또는 로그인 호출", result: "팀 정책은 검색 1분 120~180회 범위, 로그인 1분 10회다. 검색 확정값은 미정이므로 화면에 고정 수치를 약속하지 않는다.", origin: "기존" },
    { when: "대학 인증 코드 발송·검증", result: "팀 정책은 발송 10분 3회, 검증 10분 10회다. 재시도 시각과 만료 안내를 구별해야 한다.", origin: "기존" },
    { when: "S3 서명 URL 발급 또는 프로젝트 생성", result: "팀 정책은 URL 발급 10분 10회, 프로젝트 생성 1시간 30회다. 필요한 URL 갱신과 업로드·생성 재시도의 중복을 막아야 한다.", origin: "기존" },
    { when: "제한 초과 또는 실패 반복으로 임시 차단", result: "제한 응답·해제 시점·다시 시도할 조건을 확인해 안내한다. 현재는 일반 오류이며 무한 자동 재요청을 추가하지 않는다.", origin: "기존" },
  ], evidence: [evidence("client", 92, "현재 공통 오류 처리"), evidence("email", 229, "현재 인증 요청"), evidence("editor", 611, "현재 업로드 요청")] },

];

export const userFlowCatalog: UserFlowCatalog = {
  reviewedAt: "2026-10-28",
  revision: "ecd372668b06c788d5dba4b92c1e285e8a23ded4",
  repositoryUrl: "https://github.com/Tim3208/CampusPolio_FE",
  areas: [
    { id: "navigation", title: "공통 이동" },
    { id: "auth", title: "로그인·학교 인증" },
    { id: "discovery", title: "홈·프로젝트 탐색" },
    { id: "project-detail", title: "프로젝트 상세·AI 리뷰" },
    { id: "project-editor", title: "프로젝트 작성·수정" },
    { id: "my-projects", title: "내 프로젝트" },
    { id: "portfolio-builder", title: "포트폴리오 제작" },
    { id: "portfolios", title: "포트폴리오 열람·관리" },
    { id: "profile", title: "프로필 설정" },
    { id: "service", title: "공통 오류·호출 제한" },
    { id: "planned", title: "지원·기획된 후속 기능" },
  ],
  flows,
  conditions,
  ideas: [
    { id: "IDEA-01", title: "AI 소개 초안", action: "선택 프로젝트로 소개 초안을 요청한다", result: "포트폴리오 소개 문장을 제안받아 수정한다", reason: "기존 AI 코드 리뷰와 별개의 새 기능이다. 생성 정책과 API 계약은 아직 없다." },
    { id: "IDEA-02", title: "포트폴리오 PDF", action: "포트폴리오 PDF 내보내기를 선택한다", result: "제출용 파일을 내려받는다", reason: "프로젝트 PDF 첨부 열람과 다른 기능이다. 내보내기 범위와 형식은 새 제안이다." },
    { id: "IDEA-03", title: "공유 주소 복사·QR", action: "공개 포트폴리오 주소를 복사하거나 QR을 만든다", result: "다른 사람에게 접근 가능한 주소를 전달한다", reason: "공유 목표는 기존 기획에 있지만 복사와 QR이라는 구체 방식은 추가 제안이다." },
    { id: "IDEA-04", title: "작성 중 초안 복구", action: "작성 중 화면을 닫았다가 다시 연다", result: "남겨둔 초안을 복원한다", reason: "현재 수동 임시저장과 구분되는 자동 보관·복구 제안이다. 저장 위치와 보관 기간은 미정이다." },
    { id: "IDEA-05", title: "관심 프로젝트", action: "프로젝트에 관심 표시를 한다", result: "관심 프로젝트를 모아 다시 찾는다", reason: "팀 정책에 북마크의 삭제·복구는 언급되지만 추가·취소 사용자 흐름과 API는 확정되지 않았다. 현재 좋아요 수 표시와 구분하는 기존 제안이다." },
    { id: "IDEA-06", title: "지원 내용 구체화", action: "지원에서 궁금한 항목을 찾는다", result: "FAQ 또는 문의 경로로 문제를 해결한다", reason: "지원 화면의 존재는 기존 기획이지만 FAQ·문의 폼·연락처 구성은 아직 정해지지 않았다." },
  ],
};
