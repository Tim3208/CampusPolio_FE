import type { ConditionFlow, FlowEvidence, FlowState, FlowStatus, UserFlow, UserFlowCatalog } from "./types";

const sourcePaths = {
  api: "api.md",
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

  flow("AUTH-01", "auth", "Google 계정을 선택해 로그인한다", "인증 결과에 따라 원래 목적지 또는 학교 인증 화면으로 이동한다", "구현됨", "Google SDK와 인증 API의 응답을 처리하는 프론트 경로가 있다. 외부 OAuth 성공은 미검증이다.", [evidence("login", 45, "Google 로그인 응답 처리")], ["COND-LOGIN", "COND-NEXT"], [state("오류", "클라이언트 ID 누락·SDK 실패·인증 요청 실패", "로그인 설정 또는 오류 메시지를 표시한다."), state("로딩", "Google 버튼 준비 중", "준비 상태와 다시 시도 수단을 안내한다.", "제안")]),
  flow("AUTH-02", "auth", "학교 이메일을 입력하고 코드 전송을 선택한다", "전송 요청 후 6자리 코드 입력칸과 3분 타이머를 표시한다", "구현됨", "코드 전송 요청과 입력 단계 전환이 있다. 실제 메일 수신은 별도 항목이다.", [evidence("email", 229, "인증 코드 전송")], ["COND-EMAIL"], [state("입력", "유효한 학교 이메일 형식이 아님", "전송을 제한한다."), state("오류", "발송 요청 실패", "오류 메시지를 표시한다.")]),
  flow("AUTH-03", "auth", "전송한 인증번호를 학교 메일함에서 확인한다", "인증 메일을 수신한다", "확인 필요", "현재 API 설명은 실제 SMTP 대신 서버 로그 출력을 명시한다. 실제 메일 발송 구현과 운영 환경을 확인해야 한다.", [evidence("api", 775, "실제 메일 발송 제약")], ["COND-EMAIL"], [state("오류", "인증 메일이 수신되지 않음", "만료 후 재전송 경로를 제공한다.")]),
  flow("AUTH-04", "auth", "유효한 6자리 코드를 입력하고 인증 확인을 선택한다", "학교 인증 완료 후 원래 목적지로 이동한다", "구현됨", "인증 확인 API 성공 응답을 받아 next 경로로 이동한다.", [evidence("email", 298, "인증 확인")], ["COND-EMAIL", "COND-NEXT"], [state("오류", "서버의 코드 검증 거부 또는 요청 실패", "오류 메시지를 표시한다."), state("입력", "화면의 3분 타이머 만료", "확인을 제한하고 재전송을 활성화한다.")]),
  flow("AUTH-05", "auth", "6자리 인증번호를 붙여넣는다", "숫자가 각 입력칸에 나뉘어 입력된다", "구현됨", "붙여넣기·다음 칸 이동 처리가 있다.", [evidence("email", 378, "인증번호 붙여넣기")], ["COND-EMAIL"]),
  flow("AUTH-06", "auth", "타이머 만료 후 재전송을 선택한다", "코드를 재요청하고 입력값과 3분 타이머를 초기화한다", "구현됨", "재전송은 타이머 만료 후 활성화된다.", [evidence("email", 269, "인증번호 재전송")], ["COND-EMAIL"], [state("진행 중", "재전송 요청 중", "중복 요청을 제한한다."), state("오류", "재전송 실패", "실패 이유를 표시한다.")]),
  flow("AUTH-07", "auth", "로그아웃을 선택한다", "세션을 종료하고 비로그인 상태로 전환한다", "미구현", "로그아웃 API와 후속 기획은 있으나 사용자 버튼·호출 흐름이 없다.", [evidence("api", 637, "로그아웃 계약"), evidence("plan", 241, "로그아웃 후속 기획")], ["COND-LOGIN"], [state("오류", "로그아웃 실패", "종료되지 않은 상태를 안내하고 재시도 수단을 제공한다.", "제안")]),
  flow("AUTH-08", "auth", "회원 탈퇴를 선택한다", "계정 탈퇴와 세션 무효화를 처리한다", "미구현", "회원 탈퇴 API 계약만 있으며 프론트 진입점과 확인 화면이 없다. 확인 절차와 데이터 정책을 추가 확정해야 한다.", [evidence("api", 1445, "회원 탈퇴 계약")], ["COND-LOGIN"], [state("진행 중", "탈퇴를 요청하기 전", "삭제 범위를 확인할 수 있게 한다. 세부 정책은 미정이다.", "제안")]),

  flow("HOME-01", "discovery", "홈에 접속한다", "주요 프로젝트와 분야별 프로젝트를 확인한다", "구현됨", "홈 조회 결과를 주요 프로젝트와 카테고리 영역에 연결한다.", [evidence("home", 48, "홈 데이터 표시")], [], [state("빈 화면", "프로젝트가 없음", "빈 목록 안내와 프로젝트 등록 수단을 표시한다."), state("오류", "홈 데이터 조회 실패", "조회 실패와 다시 시도를 표시한다."), state("로딩", "홈 조회 중", "홈 스켈레톤을 표시한다.")]),
  flow("HOME-02", "discovery", "주요 프로젝트의 이전·다음 버튼을 선택하거나 가로로 넘긴다", "인접 프로젝트 카드를 확인한다", "구현됨", "실제 스크롤 위치에 따라 양 끝 이동 버튼을 비활성화한다.", [evidence("slider", 14, "주요 프로젝트 이동")]),
  flow("HOME-03", "discovery", "홈에서 분야 태그를 선택한다", "선택한 분야의 프로젝트만 표시한다", "구현됨", "홈에서 받은 프로젝트를 분야별로 표시한다.", [evidence("home", 113, "분야별 보기")], [], [state("빈 화면", "선택 분야 프로젝트가 없음", "해당 분야의 빈 상태와 전체 보기 수단을 표시한다.")]),
  flow("HOME-04", "discovery", "홈의 분야별 프로젝트 더 보기를 선택한다", "선택한 분야 조건이 반영된 탐색 화면으로 이동한다", "구현됨", "분야별 더 보기 링크에 선택 태그를 전달한다.", [evidence("home", 158, "분야별 더 보기")]),
  flow("HOME-05", "discovery", "주요 프로젝트의 전체 프로젝트 보기를 선택한다", "조건 없는 프로젝트 탐색으로 이동한다", "구현됨", "주요 프로젝트 영역의 전체 보기는 고정 /projects 링크다.", [evidence("slider", 94, "전체 프로젝트 보기")]),
  flow("HOME-06", "discovery", "분야 선택에서 전체를 선택한다", "분야를 구분하지 않고 홈 프로젝트를 표시한다", "구현됨", "선택한 분야를 해제해 전체 프로젝트를 표시한다.", [evidence("home", 113, "전체 분야 선택")]),
  flow("SEARCH-01", "discovery", "프로젝트 탐색을 연다", "검색 가능한 프로젝트 목록을 확인한다", "구현됨", "서버 경로에서 조회한 목록을 카드 또는 리스트에 표시한다.", [evidence("search", 43, "탐색 화면")], [], searchStates),
  flow("SEARCH-02", "discovery", "검색어를 입력하고 검색한다", "검색 조건에 맞는 첫 페이지를 표시한다", "구현됨", "검색어를 URL에 반영하고 페이지를 초기화한다.", [evidence("search", 413, "검색 UI"), evidence("query", 1, "검색 URL 생성")], [], searchStates),
  flow("SEARCH-03", "discovery", "태그 필터를 선택한다", "태그 조건에 맞는 프로젝트를 표시한다", "구현됨", "데스크톱 태그 조작을 URL 검색 조건에 반영한다.", [evidence("search", 88, "태그 검색 연결")], [], searchStates),
  flow("SEARCH-04", "discovery", "모바일 필터에서 태그를 고른 뒤 적용한다", "선택한 태그로 결과를 갱신하고 필터를 닫는다", "구현됨", "적용 전 선택은 임시 상태이며 적용 시 URL을 한 번 변경한다.", [evidence("filter", 1, "모바일 필터 적용")], ["COND-FILTER"], searchStates),
  flow("SEARCH-05", "discovery", "모바일 필터 선택 중 취소하거나 닫는다", "기존 검색 결과와 적용 조건을 유지한다", "구현됨", "미적용 선택을 결과에 반영하지 않는다.", [evidence("filter", 1, "필터 취소")], ["COND-FILTER"]),
  flow("SEARCH-06", "discovery", "최신순 또는 조회순 정렬을 선택한다", "선택한 정렬의 첫 페이지를 표시한다", "확인 필요", "UI와 enum은 VIEW_COUNT를 사용하지만 API 설명의 POPULAR와 다르다. 정렬 계약 확인이 필요하다.", [evidence("search", 114, "정렬 선택"), evidence("guide", 107, "정렬 계약 차이")], [], searchStates),
  flow("SEARCH-07", "discovery", "그리드 또는 리스트 보기를 선택한다", "검색 조건을 유지하며 보기 방식을 바꾼다", "구현됨", "보기 방식은 URL에 기록되고 보기 변경 시 페이지를 초기화한다.", [evidence("search", 137, "보기 전환"), evidence("query", 1, "보기 URL")]),
  flow("SEARCH-08", "discovery", "적용된 조건 칩을 해제한다", "해당 조건만 제거한 첫 페이지를 표시한다", "구현됨", "다른 검색 조건과 선택한 보기 방식은 유지한다.", [{ path: "src/features/project/project-search-filter/ui/applied-filter-chips.tsx", line: 17, label: "개별 조건 해제" }], [], searchStates),
  flow("SEARCH-09", "discovery", "페이지 번호 또는 이전·다음을 선택한다", "검색 조건과 보기를 유지한 해당 페이지를 표시한다", "구현됨", "첫·마지막 페이지 이동 제한과 현재 페이지 표시가 있다.", [evidence("search", 223, "페이지 이동")], [], searchStates),
  flow("SEARCH-10", "discovery", "연도·학기·전공 조건으로 검색한다", "여러 학사 조건을 조합한 결과를 표시한다", "미구현", "확정 시안의 후속 TODO이며 현재 검색 조건에 학사 항목이 없다.", [evidence("plan", 240, "학사 조건 복합 검색 기획")], [], [state("빈 화면", "복합 조건 결과가 없음", "적용 조건을 보여주고 개별 해제 수단을 제공한다.", "제안")]),
  flow("SEARCH-11", "discovery", "홈 또는 탐색의 프로젝트 카드를 선택한다", "해당 프로젝트 상세로 이동한다", "구현됨", "실제 프로젝트 ID를 사용한 상세 링크가 있다.", [evidence("search", 43, "상세 진입"), evidence("home", 48, "홈 프로젝트 목록")]),
  flow("SEARCH-12", "discovery", "모바일 필터 안에서 선택 초기화를 누른다", "필터 내부의 임시 태그 선택만 비운다", "구현됨", "실제 검색 결과는 적용하기를 누를 때까지 유지한다.", [evidence("filter", 97, "임시 선택 초기화")], ["COND-FILTER"]),
  flow("SEARCH-13", "discovery", "전체 조건 초기화를 선택한다", "검색어·태그·정렬을 비우고 첫 페이지를 표시한다", "구현됨", "그리드·리스트 보기 방식은 유지한다.", [evidence("search", 293, "전체 조건 초기화")], [], searchStates),
  flow("SEARCH-14", "discovery", "모바일·태블릿에서 필터를 연다", "현재 적용 태그를 복사한 임시 선택 화면을 표시한다", "구현됨", "필터를 여는 시점에 실제 적용 조건을 임시 상태로 복사한다.", [evidence("filter", 35, "필터 열기와 선택 복사")], ["COND-FILTER"]),

  flow("DETAIL-01", "project-detail", "프로젝트 상세를 연다", "제목·본문·작성자·참여자·태그·등록일·조회수·좋아요 수를 확인한다", "구현됨", "Markdown 본문과 도메인 정보를 표시한다. 좋아요 수 표시는 좋아요 행동 구현을 뜻하지 않는다.", [evidence("detail", 34, "상세 정보")], ["COND-PROJECT-VISIBILITY"], [state("오류", "대상이 없거나 잘못된 ID 또는 상세 조회 실패", "프로젝트를 불러오지 못했어요 안내와 재시도·모음 링크를 표시한다."), state("빈 화면", "본문·작성자·참여자 정보가 없음", "영역별 대체 문구를 표시한다."), state("빈 화면", "대표 이미지·본문 이미지 로드 실패", "대체 표시 또는 이미지 오류 안내를 제공한다.")]),
  flow("DETAIL-02", "project-detail", "첨부 파일을 선택한다", "파일 주소를 새 창에서 연다", "구현됨", "현재는 일반 첨부 링크이며 전용 PDF·영상 뷰어와 구분한다.", [evidence("detail", 85, "첨부 링크")], [], [state("빈 화면", "첨부 파일이 없음", "첨부 없음 안내를 표시한다."), state("오류", "파일 주소가 만료되거나 외부 열기 실패", "다시 접근할 수 있는 안내를 제공한다.", "제안")]),
  flow("DETAIL-03", "project-detail", "프로젝트 모음으로 돌아가기를 선택한다", "프로젝트 탐색으로 이동한다", "구현됨", "고정 /projects 링크다. 이전 검색 조건 복원을 보장하지 않는다.", [evidence("detail", 44, "모음으로 이동")]),
  flow("DETAIL-04", "project-detail", "AI 리뷰 요청을 선택한다", "요청한 프로젝트의 리뷰 결과를 확인한다", "구현됨", "점수·요약·개선 항목을 표시하는 요청 경로가 있다. 실제 AI 성공은 미검증이다.", [evidence("review", 78, "AI 리뷰 요청"), evidence("api", 181, "리뷰 API 계약")], ["COND-REVIEW"], [state("진행 중", "리뷰 생성 중", "생성 중 표시와 중복 요청 제한을 제공한다."), state("빈 화면", "리뷰 세부 결과가 비어 있음", "각 결과 영역에 빈 상태 문구를 표시한다."), state("오류", "리뷰 생성 실패", "오류와 재시도 버튼을 표시한다.")]),
  flow("DETAIL-05", "project-detail", "AI 리뷰 다시 생성 또는 재시도를 선택한다", "새 리뷰 응답으로 결과를 갱신한다", "구현됨", "같은 프로젝트에 다시 요청해 결과를 갱신한다.", [evidence("review", 85, "리뷰 재요청")], ["COND-REVIEW"], [state("오류", "재요청 실패", "오류를 표시하고 다시 시도할 수 있다.")]),
  flow("DETAIL-06", "project-detail", "상세에서 관련 작품을 선택한다", "관련 프로젝트 상세를 확인한다", "미구현", "관련 작품은 후속 기획이며 현재 상세에 추천 데이터와 이동 UI가 없다.", [evidence("plan", 242, "관련 작품 후속 기획")], [], [state("빈 화면", "관련 작품이 없음", "추천 영역을 생략하거나 빈 안내를 제공한다.", "제안")]),
  flow("DETAIL-07", "project-detail", "GitHub·PDF·영상 전용 자료를 선택한다", "자료 유형에 맞는 정보와 열람 수단을 확인한다", "미구현", "전용 자료 구조가 후속 TODO로 남아 있다. 일반 첨부 링크는 존재한다.", [evidence("plan", 242, "전용 자료 구조 기획")]),

  flow("EDIT-01", "project-editor", "프로젝트 작성 화면을 연다", "새 프로젝트 입력 폼을 표시한다", "구현됨", "로그인과 학교 인증을 확인한 뒤 작성 폼을 표시한다.", [evidence("createRoute", 14, "작성 접근 확인")], ["COND-EDITOR-ACCESS"]),
  flow("EDIT-02", "project-editor", "제목과 본문을 작성하고 서식 도구를 사용한다", "입력한 내용과 서식이 편집기에 반영된다", "구현됨", "리치 텍스트 편집과 Markdown 변환 경로가 있다.", [evidence("richEditor", 1, "본문 편집기"), evidence("editor", 630, "저장 본문 변환")], [], [state("오류", "저장하지 않고 이탈하거나 새로고침함", "미저장 내용의 유실 가능성을 안내한다.", "제안")]),
  flow("EDIT-03", "project-editor", "추천 태그 또는 새 태그를 추가·해제한다", "선택 태그가 본문 설정과 저장 내용에 반영된다", "구현됨", "태그 추가·중복 방지·삭제와 저장 payload가 연결되어 있다.", [evidence("editor", 437, "태그 선택"), evidence("editor", 630, "태그 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER", "COND-PROJECT-SAVE"]),
  flow("EDIT-04", "project-editor", "제작 연도·학기·학과를 선택하고 저장한다", "선택한 학사 정보가 저장된다", "미구현", "선택 UI는 있으나 저장 payload에 학사 정보가 포함되지 않는다.", [evidence("editor", 630, "저장 payload"), evidence("editor", 1094, "학사 정보 입력"), evidence("plan", 240, "학사 정보 저장 기획")]),
  flow("EDIT-05", "project-editor", "파일을 선택하거나 드래그해 첨부한다", "업로드된 파일을 첨부 목록에 표시한다", "구현됨", "프로젝트 Draft를 확보한 뒤 파일 업로드를 요청한다.", [evidence("editor", 611, "파일 드롭"), evidence("api", 286, "파일 업로드 계약")], ["COND-EDITOR-ACCESS", "COND-UPLOAD"], [state("입력", "지원하지 않는 파일 또는 50MiB 초과", "파일 형식·용량 오류를 안내한다."), state("오류", "파일 업로드 실패", "실패 안내를 표시한다."), state("오류", "여러 파일 중 일부만 업로드 성공", "성공·실패 파일을 구분하고 실패 파일만 재시도한다.", "제안")]),
  flow("EDIT-06", "project-editor", "본문 이미지 삽입에서 파일을 선택한다", "업로드한 이미지를 본문에 삽입한다", "구현됨", "업로드 완료 후 편집 가능 상태에서 이미지가 삽입되며 저장 본문에도 반영된다.", [evidence("editor", 351, "본문 이미지 지연 삽입"), evidence("editor", 560, "본문 이미지 업로드")], ["COND-UPLOAD", "COND-EDITOR-ACCESS"], [state("진행 중", "이미지 업로드 중", "편집·도구·저장을 비활성화한다."), state("오류", "이미지 업로드 실패", "오류 표시 후 다시 선택할 수 있다.")]),
  flow("EDIT-07", "project-editor", "첨부 파일 제거를 선택한다", "첨부와 서버 파일 연결이 제거된다", "미구현", "현재는 화면의 uploadedAssets에서만 제거한다. DELETE API를 호출하지 않는다.", [evidence("editor", 620, "화면 목록에서만 제거"), evidence("api", 1634, "파일 삭제 계약")], ["COND-UPLOAD"], [state("오류", "서버 제거 실패", "기존 첨부 상태를 유지하고 실패를 안내한다.", "제안")]),
  flow("EDIT-08", "project-editor", "임시 저장을 선택한다", "현재 내용을 Draft로 저장하고 내 프로젝트로 이동한다", "구현됨", "Draft 생성과 상세 수정 후 내 프로젝트로 이동한다. 제목 검증이 선행된다.", [evidence("editor", 659, "Draft 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-09", "project-editor", "새 프로젝트의 공개 등록을 선택한다", "본문 저장 후 발행하고 내 프로젝트 모음으로 이동한다", "구현됨", "신규 작성 모드는 저장 후 publish 요청을 호출하고 내 프로젝트로 이동한다.", [evidence("editor", 754, "신규 프로젝트 발행")], ["COND-EDITOR-ACCESS", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-10", "project-editor", "기존 프로젝트 수정 화면을 연다", "기존 내용을 편집 폼에 불러온다", "구현됨", "프로젝트 상세를 불러와 폼을 채운다. 접근 가능 여부는 별도 조건 항목을 참조한다.", [evidence("editRoute", 14, "수정 경로"), evidence("editor", 365, "수정 초기 데이터")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER"], [state("로딩", "기존 프로젝트 조회 중", "불러오는 중 상태를 표시한다."), state("오류", "프로젝트 조회 실패", "오류 안내를 표시한다.")]),
  flow("EDIT-11", "project-editor", "기존 프로젝트 내용을 수정하고 저장한다", "수정 요청 후 내 프로젝트 모음으로 이동한다", "구현됨", "수정 모드에서 제목·본문·태그·대표 이미지를 PATCH하고 내 프로젝트로 이동한다.", [evidence("editor", 734, "수정 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-12", "project-editor", "임시저장한 프로젝트를 열어 발행한다", "Draft가 공개 등록된 프로젝트로 전환된다", "미구현", "재진입한 수정 모드는 PATCH만 수행하고 publish를 호출하지 않는다.", [evidence("editor", 734, "수정 모드 저장 분기"), evidence("api", 213, "프로젝트 발행 계약")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER", "COND-PROJECT-SAVE"]),
  flow("EDIT-13", "project-editor", "편집기에서 대시보드로 돌아가기를 선택한다", "내 프로젝트 모음으로 이동한다", "구현됨", "고정 마이페이지 링크가 있다. 미저장 내용 복구는 구현되어 있지 않다.", [{ path: "src/widgets/project/ui/project-editor-page.tsx", line: 22, label: "편집기에서 모음 이동" }], [], [state("오류", "미저장 변경사항이 있음", "이탈 전에 변경사항 유실을 안내한다.", "제안")]),
  flow("EDIT-14", "project-editor", "비공개 저장을 선택하고 저장한다", "Draft로 저장하고 내 프로젝트 모음으로 이동한다", "구현됨", "현재 비공개 저장은 임시저장과 같은 Draft 경로다. 비공개 PUBLISHED 상태를 만드는 기능은 아니다.", [evidence("editor", 690, "비공개 Draft 저장")], ["COND-EDITOR-ACCESS", "COND-PROJECT-SAVE"], editorStates),
  flow("EDIT-15", "project-editor", "기존 프로젝트의 첨부 목록을 불러와 관리한다", "저장된 첨부 파일을 확인하고 관리한다", "미구현", "수정 폼 초기화는 제목·본문·태그만 반영한다. 기존 파일 조회 계약과 관리 UI가 연결되지 않았다.", [evidence("editor", 365, "수정 초기 데이터"), evidence("api", 256, "기존 파일 조회 계약")], ["COND-UPLOAD"]),
  flow("EDIT-16", "project-editor", "편집기의 취소를 선택한다", "내 프로젝트 모음으로 이동한다", "구현됨", "취소 버튼은 내 프로젝트 경로에 연결된다.", [evidence("editor", 1188, "편집 취소")], [], [state("오류", "미저장 변경사항이 있음", "이탈 전에 유실 가능성을 안내한다.", "제안")]),

  flow("MYPROJ-01", "my-projects", "내 프로젝트 모음을 연다", "참여 프로젝트와 공개·Draft 상태를 확인한다", "구현됨", "로그인한 사용자의 프로젝트를 조회해 표시한다.", [evidence("myProjectsRoute", 1, "내 프로젝트 조회"), evidence("myProjects", 1, "프로젝트 모음")], ["COND-MYPAGE"], [state("빈 화면", "내 프로젝트가 없음", "등록 안내와 생성 카드를 표시한다."), state("오류", "목록 조회 실패", "오류 메시지를 표시한다.")]),
  flow("MYPROJ-02", "my-projects", "내 프로젝트의 공개 상태 필터를 선택한다", "해당 상태의 내 프로젝트를 표시한다", "미구현", "프론트 조회 함수에는 상태 옵션이 있으나 화면은 ALL 고정이며 필터 UI가 없다. API 명세에 상태 parameter가 없어 서버 지원도 확인이 필요하다.", [evidence("myProjectsRoute", 30, "ALL 고정 조회"), { path: "src/entities/project/api/get-my-projects.ts", line: 62, label: "프론트 상태 옵션" }, evidence("api", 1478, "현재 목록 계약")], ["COND-MYPAGE"]),
  flow("MYPROJ-03", "my-projects", "내 프로젝트 카드를 선택한다", "해당 프로젝트 상세로 이동한다", "구현됨", "카드 클릭과 Enter·Space가 상세 경로로 연결된다.", [evidence("myProjects", 137, "내 프로젝트 카드")], ["COND-MYPAGE", "COND-PROJECT-VISIBILITY"]),
  flow("MYPROJ-04", "my-projects", "내 프로젝트의 설정을 선택한다", "해당 프로젝트 수정 화면으로 이동한다", "구현됨", "설정 버튼은 카드 상세 이동과 분리되어 수정 경로로 이동한다. 작성자 권한 판별은 별도 미완료 조건이다.", [evidence("myProjects", 162, "수정 화면 진입")], ["COND-EDITOR-ACCESS", "COND-PROJECT-OWNER"]),
  flow("MYPROJ-05", "my-projects", "프로젝트 생성 카드를 선택한다", "새 프로젝트 작성 화면으로 이동한다", "구현됨", "마이페이지 생성 카드에 작성 링크가 있다.", [evidence("myProjects", 86, "프로젝트 생성 카드")], ["COND-EDITOR-ACCESS"]),
  flow("MYPROJ-06", "my-projects", "내 프로젝트에서 다음 목록 페이지를 선택한다", "다음 내 프로젝트 목록을 확인한다", "미구현", "현재 첫 페이지를 조회하며 화면에 페이지 제어가 없다. 명세는 배열 응답이고 프론트는 페이지형도 처리하므로 서버 페이지 계약은 확인이 필요하다.", [evidence("myProjectsRoute", 30, "내 프로젝트 고정 조회"), evidence("api", 1478, "목록 응답 계약")]),

  flow("PORT-01", "portfolio-builder", "포트폴리오 제작을 연다", "선택 가능한 내 프로젝트를 표시한다", "구현됨", "첫 8개를 ALL 상태로 조회한다. 전체 목록 탐색 완성 여부와 인증 조건은 별도 항목이다.", [evidence("portfolioCreate", 16, "제작 프로젝트 조회")], ["COND-PORTFOLIO-ACCESS"], [state("빈 화면", "불러온 프로젝트가 없음", "표시할 프로젝트 없음 안내를 표시한다."), state("오류", "프로젝트 조회 실패", "오류 메시지와 빈 목록을 표시한다.")]),
  flow("PORT-02", "portfolio-builder", "제작 화면에서 프로젝트를 검색한다", "현재 불러온 목록에서 제목·설명·태그가 맞는 항목을 표시한다", "구현됨", "현재 첫 8개에 대한 로컬 검색이다. 전체 내 프로젝트 검색으로 확장하면 미구현이다.", [evidence("builder", 176, "제작 목록 로컬 검색")], [], [state("빈 화면", "검색 결과가 없음", "표시할 프로젝트 없음 안내를 표시한다.")]),
  flow("PORT-03", "portfolio-builder", "제작 화면의 최신순 정렬을 선택한다", "프로젝트 목록을 최신순으로 재정렬한다", "미구현", "정렬 버튼에 동작 핸들러가 없다.", [evidence("builder", 403, "연결되지 않은 정렬 버튼")]),
  flow("PORT-04", "portfolio-builder", "제작 화면에서 이전·다음 페이지를 선택한다", "다른 페이지의 내 프로젝트를 선택할 수 있다", "미구현", "페이지 버튼이 비활성화되어 있고 조회는 첫 8개로 고정되어 있다.", [evidence("builder", 443, "비활성 페이지 이동"), evidence("portfolioCreate", 23, "고정 페이지 크기")]),
  flow("PORT-05", "portfolio-builder", "프로젝트 카드를 선택한다", "선택 목록에 추가하고 선택 개수를 표시한다", "구현됨", "선택 ID와 선택 목록을 관리한다.", [evidence("builder", 200, "프로젝트 선택")], ["COND-PORTFOLIO-PROJECTS"]),
  flow("PORT-06", "portfolio-builder", "선택한 카드를 다시 누르거나 해제한다", "해당 프로젝트를 선택 목록에서 제외한다", "구현됨", "개별 선택 해제 경로가 있다.", [evidence("builder", 200, "선택 토글"), evidence("builder", 222, "개별 선택 해제")]),
  flow("PORT-07", "portfolio-builder", "선택 해제를 선택한다", "선택한 프로젝트를 모두 해제한다", "구현됨", "선택 목록 전체 초기화가 연결되어 있다.", [evidence("builder", 472, "전체 선택 해제")], [], [state("빈 화면", "선택한 프로젝트가 없음", "프로젝트를 추가하라는 안내를 표시한다.")]),
  flow("PORT-08", "portfolio-builder", "선택 목록에서 위·아래 버튼을 선택한다", "포트폴리오의 프로젝트 표시 순서를 바꾼다", "구현됨", "선택 목록 순서 변경과 양 끝 버튼 비활성 처리가 있다.", [evidence("builder", 234, "순서 변경"), evidence("builder", 881, "순서 이동 버튼")], ["COND-PORTFOLIO-PROJECTS"]),
  flow("PORT-09", "portfolio-builder", "포트폴리오 제목과 설명을 입력한다", "입력 내용과 글자 수를 표시한다", "구현됨", "제목과 설명 상태가 폼에 연결되어 있다.", [evidence("builder", 245, "제목·설명 입력")], ["COND-PORTFOLIO-SAVE"]),
  flow("PORT-10", "portfolio-builder", "썸네일 파일을 선택한다", "선택한 이미지의 로컬 미리보기를 표시한다", "구현됨", "브라우저 object URL 미리보기이며 서버 업로드는 아니다.", [evidence("builder", 263, "로컬 이미지 미리보기")], [], [state("입력", "이미지가 아닌 파일 또는 처리할 수 없는 파일을 선택", "지원 파일 안내를 제공한다. 업로드 형식·용량 정책은 미정이다.", "제안")]),
  flow("PORT-11", "portfolio-builder", "선택한 썸네일로 포트폴리오를 저장한다", "저장한 상세에도 선택 이미지가 표시된다", "미구현", "사용자 선택 파일은 업로드하지 않는다. 저장에는 선택 순서 중 썸네일이 존재하는 첫 프로젝트의 이미지를 사용한다.", [evidence("builder", 86, "저장용 썸네일 결정"), evidence("builder", 582, "썸네일 업로드 미구현 표시")]),
  flow("PORT-12", "portfolio-builder", "포트폴리오 템플릿을 선택한다", "선택한 템플릿을 적용한다", "미구현", "My Projects 한 종류로 고정되어 있으며 템플릿 선택 핸들러와 저장 필드가 없다.", [evidence("builder", 43, "고정 템플릿"), evidence("builder", 644, "템플릿 선택 영역")]),
  flow("PORT-13", "portfolio-builder", "미리보기를 선택한다", "선택한 프로젝트 순서와 각 프로젝트의 제목·설명을 요약해서 확인한다", "구현됨", "현재 미리보기는 선택 프로젝트 요약이다. 최종 상세와 같은 화면을 보장하지 않는다.", [evidence("builder", 697, "미리보기 열기"), evidence("builder", 965, "선택 목록 미리보기")], [], [state("빈 화면", "선택한 프로젝트가 없음", "프로젝트 선택을 요청하는 문구를 표시한다."), state("입력", "키보드로 미리보기를 조작함", "대화상자 포커스 고정·Escape 닫기·트리거 복귀를 제공한다.", "제안")]),
  flow("PORT-14", "portfolio-builder", "미리보기의 닫기를 선택한다", "포트폴리오 제작 화면으로 돌아간다", "구현됨", "닫기 버튼이 미리보기 상태를 해제한다.", [evidence("builder", 986, "미리보기 닫기")]),
  flow("PORT-15", "portfolio-builder", "완성될 포트폴리오를 미리 확인한다", "입력한 제목·설명·썸네일·템플릿이 최종 상세와 같게 표시된다", "미구현", "현재 미리보기는 고정 My Projects 제목의 프로젝트 요약이며 제작 입력 전체를 전달받지 않는다.", [evidence("builder", 965, "현재 요약 미리보기의 범위")]),
  flow("PORT-16", "portfolio-builder", "비공개 저장을 선택한다", "포트폴리오를 생성하고 정보·선택·순서를 저장한 뒤 상세로 이동한다", "확인 필요", "프론트의 순차 요청은 있지만 필수 userId query를 생략하는 계약 차이가 있다. 인증 게이트와 다단계 실패 복구도 남아 있다.", [evidence("builder", 284, "비공개 저장"), evidence("portfolioApi", 208, "생성 요청"), evidence("guide", 108, "포트폴리오 계약 차이")], ["COND-PORTFOLIO-ACCESS", "COND-PORTFOLIO-PROJECTS", "COND-PORTFOLIO-SAVE"], portfolioSaveStates),
  flow("PORT-17", "portfolio-builder", "제작 화면에서 이전으로 돌아가기를 선택한다", "내 포트폴리오 모음으로 이동한다", "구현됨", "제작 화면 상단에 모음으로 돌아가는 링크가 있다.", [evidence("builder", 357, "제작에서 모음으로 이동")], ["COND-MYPAGE"], [state("오류", "미저장 변경사항이 있음", "이동 전에 미저장 내용의 유실을 안내한다.", "제안")]),

  flow("MYPORT-01", "portfolios", "내 포트폴리오 모음을 연다", "내 포트폴리오와 공개 상태를 확인한다", "구현됨", "현재 첫 8개를 조회해 표시한다.", [evidence("myPortfoliosRoute", 15, "내 포트폴리오 조회"), evidence("myPortfolios", 237, "포트폴리오 목록")], ["COND-MYPAGE"], [state("빈 화면", "포트폴리오가 없음", "아직 포트폴리오가 없습니다 안내와 제작 카드를 표시한다."), state("오류", "목록 조회 실패", "조회 실패 제목과 원인을 표시한다.")]),
  flow("MYPORT-02", "portfolios", "포트폴리오 제작 카드를 선택한다", "포트폴리오 제작 화면으로 이동한다", "구현됨", "제작 카드에 /portfolios/new 링크가 있다.", [evidence("myPortfolios", 82, "포트폴리오 제작 진입")], ["COND-PORTFOLIO-ACCESS"]),
  flow("MYPORT-03", "portfolios", "포트폴리오 카드를 선택한다", "해당 slug의 상세를 표시한다", "구현됨", "상세 라우트와 목록 카드 이동이 있다.", [evidence("myPortfolios", 247, "상세로 이동"), evidence("portfolioRoute", 21, "slug 상세 경로")], ["COND-PORTFOLIO-VISIBILITY"], [state("오류", "상세를 찾지 못함", "404 화면을 표시한다."), state("오류", "상세 조회 실패", "오류 안내와 모음으로 돌아가기 링크를 표시한다.")]),
  flow("MYPORT-04", "portfolios", "포트폴리오 상세의 프로젝트를 선택한다", "해당 프로젝트 상세로 이동한다", "구현됨", "포트폴리오에 포함된 프로젝트 카드를 상세 경로에 연결한다.", [evidence("portfolioDetail", 118, "포함 프로젝트 열람")], ["COND-PORTFOLIO-VISIBILITY"], [state("빈 화면", "표시할 공개 프로젝트가 없음", "포함된 프로젝트 없음 안내를 표시한다.")]),
  flow("MYPORT-05", "portfolios", "포트폴리오 상세에서 모음으로 돌아간다", "내 포트폴리오 모음으로 이동한다", "구현됨", "고정 마이페이지 링크다. 비로그인 방문자는 마이페이지 인증 조건이 적용된다.", [evidence("portfolioDetail", 58, "모음으로 이동")], ["COND-MYPAGE"]),
  flow("MYPORT-06", "portfolios", "공개 포트폴리오 주소를 연다", "로그인 없이 공개 상세를 열람한다", "확인 필요", "slug 라우트는 존재한다. 공개·비공개와 포함 프로젝트 필터링은 서버 정책에 의존하며 실제 서버는 미검증이다.", [evidence("portfolioRoute", 21, "포트폴리오 상세"), evidence("api", 1571, "공개 상세 접근 계약")], ["COND-PORTFOLIO-VISIBILITY"]),
  flow("MYPORT-07", "portfolios", "포트폴리오 공개 전환을 선택한다", "조건을 만족한 포트폴리오를 공개한다", "미구현", "공개 상태 변경 API 함수는 있으나 사용자 전환 UI가 없다. 제작 저장은 항상 비공개다.", [evidence("api", 1119, "공개 전환 계약"), evidence("builder", 284, "비공개로 고정 저장")], ["COND-PORTFOLIO-VISIBILITY", "COND-PORTFOLIO-OWNER"], [state("권한", "공개·발행 프로젝트가 하나도 없음", "공개할 수 없는 이유와 필요한 프로젝트 조건을 안내한다.", "제안")]),
  flow("MYPORT-08", "portfolios", "포트폴리오 비공개 전환을 선택한다", "포트폴리오를 비공개 상태로 변경한다", "미구현", "계약과 API 함수는 있으나 기존 포트폴리오의 상태 전환 UI가 없다.", [evidence("api", 1119, "비공개 전환 계약")], ["COND-PORTFOLIO-VISIBILITY", "COND-PORTFOLIO-OWNER"]),
  flow("MYPORT-09", "portfolios", "기존 포트폴리오 정보를 수정하고 저장한다", "제목·설명·썸네일을 갱신하고 기존 주소를 유지한다", "미구현", "수정 API helper는 신규 제작 저장에만 쓰이며 기존 편집 경로가 없다.", [evidence("api", 1027, "정보 수정 및 slug 유지 계약")], ["COND-PORTFOLIO-OWNER"]),
  flow("MYPORT-10", "portfolios", "기존 포트폴리오에 프로젝트를 추가하거나 제거한다", "프로젝트 연결 목록을 갱신한다", "미구현", "프로젝트 연결 수정 API만 있다. 기존 편집 UI는 없다. 제거해도 원본 프로젝트를 삭제하지 않는다.", [evidence("api", 1211, "기존 프로젝트 연결 수정 계약")], ["COND-PORTFOLIO-OWNER", "COND-PORTFOLIO-PROJECTS"]),
  flow("MYPORT-11", "portfolios", "기존 포트폴리오의 순서를 변경하고 저장한다", "저장된 프로젝트 표시 순서를 갱신한다", "미구현", "신규 제작 중 순서 지정은 있으나 기존 포트폴리오 편집 경로는 없다.", [evidence("api", 1303, "기존 순서 변경 계약")], ["COND-PORTFOLIO-OWNER", "COND-PORTFOLIO-PROJECTS"]),
  flow("MYPORT-12", "portfolios", "포트폴리오 삭제를 선택한다", "포트폴리오를 모음에서 제외하고 원본 프로젝트는 유지한다", "미구현", "DELETE 계약만 있고 삭제 UI·프론트 호출 함수가 없다.", [evidence("api", 957, "포트폴리오 삭제 계약")], ["COND-PORTFOLIO-OWNER"], [state("진행 중", "삭제 전", "삭제 대상과 원본 프로젝트 보존 범위를 확인하도록 안내한다.", "제안")]),
  flow("MYPORT-13", "portfolios", "공개·비공개 목록 필터를 선택한다", "선택 상태의 포트폴리오만 표시한다", "미구현", "목록 API 옵션은 있으나 사용자 필터 UI가 없다.", [evidence("api", 1500, "목록 공개 상태 필터 계약"), evidence("myPortfoliosRoute", 29, "현재 목록 조회")]),
  flow("MYPORT-14", "portfolios", "포트폴리오 모음의 다음 페이지를 선택한다", "다음 포트폴리오 목록을 확인한다", "미구현", "조회는 page 0·size 8로 고정되어 있고 페이지 제어가 없다.", [evidence("myPortfoliosRoute", 29, "첫 페이지 고정 조회")]),
  flow("MYPORT-15", "portfolios", "포트폴리오 공유를 선택한다", "외부에 전달할 포트폴리오 주소를 확인한다", "미구현", "프로젝트 소개에 공유 목표는 있지만 공유 UI는 없다. 주소 복사 방식은 별도 제안이다.", [{ path: "README.md", line: 3, label: "포트폴리오 공유 목표" }, evidence("portfolioDetail", 58, "현재 상세 UI")], ["COND-PORTFOLIO-VISIBILITY"], [state("권한", "비공개 포트폴리오를 공유하려 함", "상대의 접근 가능 여부와 공개 전환 조건을 안내한다.", "제안")]),

  flow("PROFILE-01", "profile", "프로필 설정을 연다", "기존 프로필 또는 새 프로필 입력 폼을 표시한다", "확인 필요", "조회·404 분기는 있으나 명세 필수 userId query를 클라이언트가 생략한다.", [evidence("profileRoute", 16, "프로필 조회"), evidence("profileApi", 22, "현재 조회 요청")], ["COND-MYPAGE", "COND-PROFILE"], [state("오류", "프로필 조회 실패", "설정 화면에 조회 오류 본문을 표시한다.")]),
  flow("PROFILE-02", "profile", "이름·닉네임·전공·학년·이미지 URL·자기소개를 입력한다", "폼과 프로필 미리보기에 반영한다", "구현됨", "입력과 미리보기가 상태에 연결되어 있다. 이미지 URL은 파일 업로드가 아니다.", [evidence("profile", 153, "프로필 입력 상태"), evidence("profile", 397, "프로필 미리보기")], ["COND-MYPAGE", "COND-PROFILE"], [state("입력", "필수 닉네임 누락 또는 입력 길이·학년·URL 검증 실패", "검증 메시지를 표시하고 저장을 중단한다."), state("오류", "이미지 URL을 불러올 수 없음", "이니셜 등 대체 이미지를 제공한다.", "제안")]),
  flow("PROFILE-03", "profile", "새 프로필을 작성하고 저장한다", "프로필을 생성하고 성공 메시지를 표시한다", "확인 필요", "생성 후 추가 저장 실패 시 재시도 분기를 수정했지만 userId·학년 계약과 실제 서버 확인이 남아 있다.", [evidence("profile", 177, "새 프로필 저장", PROFILE_RETRY_REVISION), evidence("profile", 209, "생성 후 추가 저장 재시도", PROFILE_RETRY_REVISION), evidence("api", 392, "프로필 생성 userId 명세"), evidence("api", 2199, "학년 타입 명세")], ["COND-PROFILE"], [state("오류", "생성 성공 후 추가 정보 저장 실패", "오류와 입력값을 유지하며 같은 화면에서 다시 저장하면 추가 정보만 다시 요청한다.")]),
  flow("PROFILE-04", "profile", "기존 프로필을 수정하고 저장한다", "프로필을 갱신하고 성공 안내와 새로고침을 제공한다", "확인 필요", "수정 핸들러는 있으나 필수 userId와 학년 null의 계약 차이가 남아 있다.", [evidence("profile", 195, "기존 프로필 수정"), evidence("profile", 229, "저장 성공 처리"), evidence("guide", 108, "프로필 API 차이")], ["COND-PROFILE"], [state("진행 중", "저장 요청 중", "중복 제출을 제한한다."), state("오류", "프로필 없음·인증 만료 또는 저장 오류", "원인에 맞는 오류 메시지를 표시한다.")]),

  flow("OTHER-01", "planned", "지원 메뉴를 선택한다", "서비스 지원 내용을 확인한다", "미구현", "현재 제목과 placeholder만 있다. FAQ·문의 방법 등 구체 내용은 아직 미정이다.", [evidence("support", 8, "지원 placeholder")]),
  flow("OTHER-02", "planned", "인증 화면의 Policy·Contact·Help Center를 선택한다", "선택한 안내 내용을 확인한다", "미구현", "현재 세 링크 모두 홈으로 연결되어 목적에 맞는 안내가 없다.", [evidence("email", 535, "안내 링크의 현재 목적지")]),
  flow("OTHER-03", "planned", "다크 모드를 선택한다", "화면 테마를 변경한다", "미구현", "후속 기획은 있으나 테마 선택 UI가 없다.", [evidence("plan", 244, "다크 모드 후속 기획")]),
  flow("OTHER-04", "planned", "Event·전시 화면을 연다", "전시와 참여 프로젝트를 살펴본다", "확인 필요", "후속 TODO에 전시가 있으나 홈 확장 여부·상세 범위·사용자 진입 방식이 미정이다. 현재 경로는 없다.", [evidence("plan", 243, "Event·전시 범위 결정 필요")]),
];

const conditions: ConditionFlow[] = [
  { id: "COND-LOGIN", title: "로그인 여부와 계정 메뉴", summary: "헤더와 로그인 후 화면이 달라지는 조건", status: "확인 필요", statusNote: "프론트 분기는 있으나 현재 사용자 조회의 필수 userId query와 세션 사용 방식은 서버 계약 확인이 필요하다.", cases: [
    { when: "비로그인", result: "헤더에 로그인·회원가입 진입을 표시한다. 모바일은 로그인으로 통합한다.", origin: "기존" },
    { when: "로그인됨", result: "마이페이지와 모바일 계정 메뉴를 표시한다.", origin: "기존" },
    { when: "처음 Google 계정으로 로그인", result: "계약상 기존 사용자를 조회하거나 새로 생성하고 세션을 저장한다. 실제 서버 동작은 미검증이다.", origin: "기존" },
    { when: "현재 사용자 조회 실패", result: "현재 헤더는 비로그인처럼 표시한다. 서버 장애와 세션 만료를 구분하지 않는다.", origin: "기존" },
    { when: "서버 일시 장애", result: "비로그인 단정 대신 상태 확인 실패와 재시도를 안내한다.", origin: "제안" },
  ], evidence: [evidence("header", 14, "현재 로그인 상태 조회"), evidence("api", 1389, "현재 사용자 조회 계약"), evidence("api", 659, "Google 로그인·가입 계약")] },
  { id: "COND-NEXT", title: "로그인·인증 후 돌아갈 목적지", summary: "next 경로와 학교 인증 여부에 따른 이동", status: "구현됨", statusNote: "내부 경로 정규화와 학교 인증 조건 분기가 있다.", cases: [
    { when: "목적지가 작성·수정이고 학교 미인증", result: "원래 목적지를 유지한 학교 이메일 인증 화면으로 이동한다.", origin: "기존" },
    { when: "학교 인증 완료 또는 인증 불필요 경로", result: "유효한 next 경로로 이동한다.", origin: "기존" },
    { when: "next가 없거나 외부 경로", result: "안전한 내부 기본 경로인 홈으로 이동한다.", origin: "기존" },
  ], evidence: [evidence("login", 58, "인증 후 이동"), evidence("routes", 58, "안전한 내부 경로")] },
  { id: "COND-MYPAGE", title: "마이페이지 접근과 현재 로그인 복귀", summary: "내 프로젝트·포트폴리오·설정·지원의 접근 조건", status: "구현됨", statusNote: "현재 로그인 게이트와 /mypage 고정 복귀가 구현되어 있다. 하위 탭 복귀는 추가 제안이다. 장애도 로그인 실패로 처리하는 제약이 있다.", cases: [
    { when: "로그인 상태로 접근", result: "요청한 마이페이지 화면을 표시한다.", origin: "기존" },
    { when: "비로그인 또는 사용자 조회 실패", result: "next=/mypage로 로그인에 이동한다. 로그인 후 내 프로젝트가 기본 목적지다.", origin: "기존" },
    { when: "특정 하위 탭에서 로그인 필요", result: "로그인 후 처음 요청한 하위 탭으로 복귀한다.", origin: "제안" },
  ], evidence: [evidence("authGate", 29, "마이페이지 인증 게이트")] },
  { id: "COND-EMAIL", title: "학교 이메일·인증번호·만료", summary: "이메일 전송과 코드 확인 버튼이 활성화되는 조건", status: "확인 필요", statusNote: "화면은 삼육대학교 이메일을 안내하지만 검사와 API는 .ac.kr이다. 실제 메일 발송은 서버 로그 설명과 대조가 필요하다.", cases: [
    { when: "사용자 조회 완료·유효한 .ac.kr 이메일", result: "인증 코드 전송을 할 수 있다. 발송 후 이메일 입력을 잠근다.", origin: "기존" },
    { when: "코드 6자리·잔여 시간 있음·처리 중 아님", result: "인증 확인을 할 수 있다.", origin: "기존" },
    { when: "3분 만료", result: "인증 확인을 막고 재전송을 활성화한다.", origin: "기존" },
    { when: "이미 학교 인증 완료", result: "인증 화면을 거치지 않고 목적지로 이동한다.", origin: "기존" },
    { when: "인증 화면에서 세션 만료", result: "인증 화면을 목적지에 담아 로그인으로 이동한다.", origin: "기존" },
    { when: "이메일을 잘못 적은 뒤 전송함", result: "이메일 변경 수단을 제공하고 인증 단계를 다시 시작한다.", origin: "제안" },
  ], evidence: [evidence("email", 48, "이메일 검사"), evidence("email", 123, "버튼 활성 조건"), evidence("email", 148, "인증 상태 분기"), evidence("api", 775, "메일 발송 계약")] },
  { id: "COND-FILTER", title: "모바일 필터의 임시 선택과 적용", summary: "선택 중인 태그와 실제 결과 조건을 구분", status: "구현됨", statusNote: "적용 시점에만 결과 URL을 갱신한다.", cases: [
    { when: "필터 안에서 태그만 선택", result: "필터 내부 임시 선택만 변경하고 결과는 유지한다.", origin: "기존" },
    { when: "적용 선택", result: "선택 태그를 URL에 반영하고 첫 페이지로 이동한다.", origin: "기존" },
    { when: "취소·닫기", result: "기존 적용 조건과 검색 결과를 유지한다.", origin: "기존" },
  ], evidence: [evidence("filter", 1, "임시 필터 상태와 적용")] },
  { id: "COND-EDITOR-ACCESS", title: "프로젝트 작성·수정의 인증", summary: "로그인 및 학교 인증 상태에 따른 편집기 접근", status: "구현됨", statusNote: "서버 진입과 저장·업로드 전에 인증을 확인하는 프론트 경로가 있다. 실제 세션 성공은 미검증이다.", cases: [
    { when: "쿠키 없음 또는 사용자 조회 실패", result: "작성·수정 경로를 next에 담아 로그인으로 이동한다.", origin: "기존" },
    { when: "로그인했지만 학교 미인증", result: "학교 이메일 인증 화면으로 이동한다.", origin: "기존" },
    { when: "로그인과 학교 인증 완료", result: "작성·수정 폼에 진입한다. 수정 권한은 작성자 조건을 별도로 확인한다.", origin: "기존" },
  ], evidence: [evidence("createRoute", 14, "작성 접근"), evidence("editRoute", 18, "수정 접근")] },
  { id: "COND-PROJECT-OWNER", title: "프로젝트 작성자와 수정 권한", summary: "OWNER 전용 수정 계약과 현재 안내의 차이", status: "미구현", statusNote: "명세는 OWNER만 수정 가능하지만 현재 목록은 역할별 버튼 제한이 없고 편집기는 403을 학교 인증으로 처리한다.", cases: [
    { when: "로그인한 OWNER", result: "계약상 프로젝트를 수정할 수 있다. 실제 서버 권한 수용은 미검증이다.", origin: "기존" },
    { when: "OWNER가 아닌 참여자", result: "명세상 수정할 수 없다. 현재 화면 진입점은 역할별로 제한되지 않는다.", origin: "기존" },
    { when: "수정 권한 없음으로 403", result: "학교 인증 부족과 작성자 권한 부족을 구분해 안내한다.", origin: "제안" },
  ], evidence: [evidence("api", 914, "OWNER 전용 수정"), evidence("myProjects", 162, "설정 진입"), evidence("editor", 271, "권한 오류의 현재 인증 안내")] },
  { id: "COND-UPLOAD", title: "프로젝트 파일과 업로드 상태", summary: "지원 형식·용량·Draft 확보·제거의 범위", status: "미구현", statusNote: "업로드는 연결되어 있지만 파일 제거는 서버 삭제와 연결되지 않는다.", cases: [
    { when: "PDF·MD·JPG·JPEG·PNG, 파일당 50MiB 이하", result: "현재 파일 검증을 통과하면 Draft를 확보하고 업로드한다.", origin: "기존" },
    { when: "업로드 중", result: "본문 편집·서식 도구·파일 선택 버튼·저장을 제한한다. 드롭과 첨부 제거의 중복 조작 방어는 확인이 필요하다.", origin: "기존" },
    { when: "첨부 제거", result: "현재 화면 목록에서만 제거한다. 서버 DELETE는 호출하지 않는다.", origin: "기존" },
    { when: "서버 파일까지 제거할 때", result: "삭제 요청 성공 후 목록을 확정하고 실패 시 안내한다.", origin: "제안" },
  ], evidence: [evidence("editor", 620, "로컬 파일 제거"), evidence("guide", 111, "파일 계약과 현재 제약"), evidence("api", 1634, "서버 파일 삭제 계약")] },
  { id: "COND-PROJECT-SAVE", title: "프로젝트 신규·임시저장·수정", summary: "저장 모드에 따라 발행 여부와 목적지가 달라짐", status: "미구현", statusNote: "신규 발행은 있지만 재개한 Draft를 발행하는 수정 분기가 없다.", cases: [
    { when: "임시 저장", result: "제목 검증 후 Draft를 생성·수정하고 내 프로젝트로 이동한다.", origin: "기존" },
    { when: "비공개 저장", result: "제목만 필수 검증하며 본문 없이도 Draft로 저장한다.", origin: "기존" },
    { when: "제목·태그 입력", result: "제목은 최대 255자, 태그는 중복 없이 최대 10개로 제한한다.", origin: "기존" },
    { when: "새 프로젝트 공개 등록", result: "제목·본문 검증 후 본문을 저장하고 발행해 내 프로젝트로 이동한다.", origin: "기존" },
    { when: "기존 프로젝트 수정 저장", result: "제목·본문 검증 후 PATCH하고 내 프로젝트로 이동한다. 현재 이 분기는 발행하지 않는다.", origin: "기존" },
    { when: "저장해 둔 Draft를 발행하려 함", result: "Draft 내용 저장 후 별도 발행 경로를 제공한다.", origin: "제안" },
  ], evidence: [evidence("editor", 659, "임시 저장"), evidence("editor", 696, "신규·수정 저장 분기")] },
  { id: "COND-PROJECT-VISIBILITY", title: "공개 탐색과 Draft 상세 접근", summary: "탐색되는 프로젝트와 임시저장 상세의 접근 차이", status: "확인 필요", statusNote: "검색은 공개·발행 프로젝트를 대상으로 한다. Draft 상세의 본인·타인 접근 정책은 명세가 불명확하며 현재 상세 서버 조회는 쿠키를 전달하지 않는다.", cases: [
    { when: "공개 프로젝트 탐색", result: "계약상 공개·발행된 프로젝트를 검색한다.", origin: "기존" },
    { when: "내 Draft 카드를 선택", result: "현재 UI는 상세로 이동하지만 실제 본인 열람 성공과 타인 접근 정책은 확인이 필요하다.", origin: "기존" },
    { when: "Draft 상세를 제공할 때", result: "서버 접근 정책 확인 후 본인 열람과 접근 불가 안내를 구분한다.", origin: "제안" },
  ], evidence: [evidence("api", 71, "공개 검색 대상"), { path: "src/app/projects/[projectId]/page.tsx", line: 40, label: "상세 서버 조회" }] },
  { id: "COND-REVIEW", title: "AI 리뷰 요청 가능 조건", summary: "리뷰 진행 상태와 아직 명시되지 않은 권한 조건", status: "확인 필요", statusNote: "현재 API에는 로그인·코드 존재·요청 횟수 조건이 명시되지 않는다. 정책을 임의로 확정하지 않았다.", cases: [
    { when: "프로젝트 ID가 있고 요청 중이 아님", result: "현재 UI는 리뷰 요청 버튼을 제공한다.", origin: "기존" },
    { when: "생성 중", result: "중복 요청을 제한하고 생성 상태를 표시한다.", origin: "기존" },
    { when: "로그인 여부 또는 분석할 코드가 없음", result: "허용·차단 정책과 안내를 계약 확인 후 정한다.", origin: "제안" },
  ], evidence: [evidence("review", 78, "현재 리뷰 요청 조건"), evidence("api", 181, "AI 리뷰 계약 범위")] },
  { id: "COND-PORTFOLIO-ACCESS", title: "포트폴리오 제작의 인증", summary: "대학 인증 계약과 현재 제작 경로의 차이", status: "확인 필요", statusNote: "API는 대학 인증을 요구하지만 현재 제작 경로에는 별도 인증 게이트가 없으며 필수 userId query도 생략한다.", cases: [
    { when: "로그인 및 대학 인증 완료", result: "명세상 포트폴리오를 생성할 수 있다.", origin: "기존" },
    { when: "현재 제작 경로에 직접 접근", result: "내 프로젝트 조회를 시도하며 실패하면 오류와 빈 목록을 표시한다.", origin: "기존" },
    { when: "비로그인 또는 대학 미인증", result: "생성 전에 로그인·학교 인증으로 이어지는 안내를 제공한다.", origin: "제안" },
  ], evidence: [evidence("api", 532, "포트폴리오 생성 인증 계약"), evidence("portfolioCreate", 16, "현재 제작 조회"), evidence("portfolioApi", 208, "현재 생성 요청")] },
  { id: "COND-PORTFOLIO-PROJECTS", title: "포트폴리오 선택·연결·순서", summary: "참여 프로젝트 범위와 최대 개수, 공개에 포함되는 조건", status: "미구현", statusNote: "선택·순서 UI는 있으나 첫 8개만 제공하며 50개 방어와 기존 포트폴리오 편집 UI가 없다.", cases: [
    { when: "프로젝트 연결 추가", result: "계약상 OWNER·MEMBER로 참여한 프로젝트만 가능하며 중복 없이 최대 50개다.", origin: "기존" },
    { when: "순서 저장", result: "계약상 저장 ID 목록이 현재 연결된 프로젝트 목록과 정확히 일치해야 한다.", origin: "기존" },
    { when: "선택 프로젝트가 0개", result: "현재 제작 코드는 빈 비공개 포트폴리오 생성을 허용한다. 공개 조건과 구분한다.", origin: "기존" },
    { when: "임시·비공개 프로젝트를 선택", result: "공개 상세에 제외되는 항목과 이유를 저장 전에 안내한다.", origin: "제안" },
  ], evidence: [evidence("api", 1211, "프로젝트 연결 조건"), evidence("api", 1303, "프로젝트 순서 조건"), evidence("builder", 284, "선택 0개 저장 경로")] },
  { id: "COND-PORTFOLIO-SAVE", title: "포트폴리오 저장과 일부 실패", summary: "생성·정보·연결·순서·비공개 저장의 순차 처리", status: "확인 필요", statusNote: "순차 요청은 있지만 계약 차이와 일부 성공 후 재시도의 중복 생성 가능성이 있다.", cases: [
    { when: "제목 없음 또는 길이 제한 초과", result: "입력 오류를 표시하고 저장하지 않는다.", origin: "기존" },
    { when: "현재 비공개 저장 성공", result: "생성→조건부 정보 수정→프로젝트 연결→순서→비공개 상태 저장 후 slug 상세로 이동한다.", origin: "기존" },
    { when: "저장 중", result: "저장 중 문구를 표시하고 미리보기·저장 버튼을 비활성화한다.", origin: "기존" },
    { when: "중간 요청 실패", result: "오류를 표시한다. 현재 이미 저장된 데이터의 롤백·재사용을 보장하지 않는다.", origin: "기존" },
    { when: "일부 성공 후 재시도", result: "생성된 포트폴리오를 이어서 저장하고 실패 단계를 안내한다.", origin: "제안" },
  ], evidence: [evidence("builder", 284, "순차 저장"), evidence("builder", 333, "저장 실패"), evidence("guide", 108, "서버 계약 차이")] },
  { id: "COND-PORTFOLIO-VISIBILITY", title: "포트폴리오 공개·비공개·열람", summary: "공개 전환 요건과 방문자가 실제 볼 수 있는 항목", status: "미구현", statusNote: "기존 API 정책이며 공개 전환 UI는 없다. 열람 필터와 소유권은 실제 서버에서 별도 검증해야 한다.", cases: [
    { when: "공개로 전환", result: "공개되고 발행된 프로젝트가 한 개 이상 필요하다.", origin: "기존" },
    { when: "소유자가 비공개로 전환", result: "계약상 언제든 비공개로 전환할 수 있다.", origin: "기존" },
    { when: "공개 포트폴리오 방문", result: "누구나 열람할 수 있으며 공개·발행 상태의 프로젝트만 표시한다.", origin: "기존" },
    { when: "비공개 포트폴리오 방문", result: "소유자만 열람할 수 있고 타인에게는 404를 반환한다.", origin: "기존" },
  ], evidence: [evidence("api", 1119, "공개 전환 조건"), evidence("api", 1571, "공개·비공개 상세 정책")] },
  { id: "COND-PORTFOLIO-OWNER", title: "기존 포트폴리오 관리 권한", summary: "정보·연결·순서·공개 상태·삭제는 소유자 전용", status: "미구현", statusNote: "API 계약은 있지만 기존 포트폴리오 편집·관리 화면이 없다.", cases: [
    { when: "로그인한 소유자", result: "계약상 정보·연결·순서·공개 상태 변경과 삭제를 할 수 있다.", origin: "기존" },
    { when: "이름을 수정", result: "기존 slug 주소는 유지한다.", origin: "기존" },
    { when: "프로젝트 연결 해제 또는 포트폴리오 삭제", result: "원본 프로젝트는 유지한다. 삭제된 포트폴리오 slug는 재사용하지 않는다.", origin: "기존" },
    { when: "소유자가 아닌 사용자의 변경 요청", result: "접근 거부를 명확히 안내하고 안전한 목록으로 돌아갈 수 있게 한다.", origin: "제안" },
  ], evidence: [evidence("api", 1027, "정보 변경 권한"), evidence("api", 957, "삭제 및 원본 보존 정책")] },
  { id: "COND-PROFILE", title: "프로필 유무와 저장 계약", summary: "생성·수정 분기와 추가 저장 실패 후 재시도", status: "확인 필요", statusNote: "필수 userId query와 학년 null의 차이가 있으며 실제 서버 검증이 남아 있다.", cases: [
    { when: "프로필 조회가 404", result: "빈 생성 폼을 표시하고 저장 시 POST한다.", origin: "기존" },
    { when: "기존 프로필 존재", result: "기존 값을 표시하고 PATCH로 수정한다.", origin: "기존" },
    { when: "새 프로필에 추가 필드가 있음", result: "POST 후 추가 PATCH로 이름·전공·학년·이미지 등을 저장한다.", origin: "기존" },
    { when: "POST 성공 후 PATCH 실패", result: "오류를 표시하고 입력값을 유지한다. 같은 화면에서 다시 저장하면 PATCH만 재시도한다.", origin: "기존" },
    { when: "POST 성공을 확인하지 못한 후 재시도", result: "같은 화면에서 POST부터 다시 요청한다. 응답이 유실된 경우 실제 생성 여부는 서버 확인이 필요하며 중복 생성 또는 충돌이 발생할 수 있다.", origin: "기존" },
  ], evidence: [evidence("profile", 195, "생성·수정 분기", PROFILE_RETRY_REVISION), evidence("profile", 209, "추가 저장 전 생성 상태 반영", PROFILE_RETRY_REVISION), evidence("api", 392, "프로필 생성 userId 명세"), evidence("api", 2199, "학년 타입 명세")] },
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
    { id: "planned", title: "지원·기획된 후속 기능" },
  ],
  flows,
  conditions,
  ideas: [
    { id: "IDEA-01", title: "AI 소개 초안", action: "선택 프로젝트로 소개 초안을 요청한다", result: "포트폴리오 소개 문장을 제안받아 수정한다", reason: "기존 AI 코드 리뷰와 별개의 새 기능이다. 생성 정책과 API 계약은 아직 없다." },
    { id: "IDEA-02", title: "포트폴리오 PDF", action: "포트폴리오 PDF 내보내기를 선택한다", result: "제출용 파일을 내려받는다", reason: "프로젝트 PDF 첨부 열람과 다른 기능이다. 내보내기 범위와 형식은 새 제안이다." },
    { id: "IDEA-03", title: "공유 주소 복사·QR", action: "공개 포트폴리오 주소를 복사하거나 QR을 만든다", result: "다른 사람에게 접근 가능한 주소를 전달한다", reason: "공유 목표는 기존 기획에 있지만 복사와 QR이라는 구체 방식은 추가 제안이다." },
    { id: "IDEA-04", title: "작성 중 초안 복구", action: "작성 중 화면을 닫았다가 다시 연다", result: "남겨둔 초안을 복원한다", reason: "현재 수동 임시저장과 구분되는 자동 보관·복구 제안이다. 저장 위치와 보관 기간은 미정이다." },
    { id: "IDEA-05", title: "관심 프로젝트", action: "프로젝트에 관심 표시를 한다", result: "관심 프로젝트를 모아 다시 찾는다", reason: "현재 좋아요 수 표시만으로 좋아요·북마크 행동이 확정되지 않는다. 별도 기능 제안이다." },
    { id: "IDEA-06", title: "지원 내용 구체화", action: "지원에서 궁금한 항목을 찾는다", result: "FAQ 또는 문의 경로로 문제를 해결한다", reason: "지원 화면의 존재는 기존 기획이지만 FAQ·문의 폼·연락처 구성은 아직 정해지지 않았다." },
  ],
};
