# UI/UX 1차 구현 및 개발 검증

설계 선택: 2026-10-04. 개발 검증: 2026-10-05 KST (실제 UTC 실행 시각은 실행 JSON에 기록).
상태: 승인된 개발 범위의 후속 후보 제출. 첫 개발 검수 FAIL의 본문 이미지 결함·실행 플래그 근거·서버 인계는 DEV-03 attempt02에서 보완했고 DEV-04에서 공통 Markdown을 복원했다. 이후 실제 독립 QA attempt01은 F-01 화살표 불일치로 FAIL이며 미완료 관찰 항목은 BLOCKED로 남았다. 현재 QA-REPAIR-01 후보의 새 개발 검수·전체 독립 QA·Wiki는 대기다. 아래의 과거 “실행 전” 표기는 각 개발 제출 당시의 역사 상태이며 독립 QA PASS나 전체 작업 완료를 주장하지 않는다.

## 기준과 보호 범위

[최종 디자인 HTML](uiux-phase1-design.html)의 색·타이포그래피·간격·반응형·상태를 우선하고 [스케치](uiux-phase1-sketch.html)의 동작 주석을 보완 기준으로 썼다. 공통 헤더, 홈, 탐색, 상세 및 마이페이지 공통 틀까지 적용한다. 실제 getProject/getMyProjects normalization과 조회 위치, 양의 정수 ID·404 의미, auth gate, profile/editor/portfolio 저장·검증·편집 계약은 유지했다. 새 API 필드, 지도 교수, 관련 작품, 자료 종류, 로그아웃·새 메뉴는 추가하지 않았다.

전역 primary #1E40AF, 기존 Button 크기, dark 토큰과 로그인·프로필 controls/색은 유지한다. 대상 소비자만 main-10과 승인된 md/xl/icon-md/icon-xl 크기를 사용한다. 루트 README의 실행 방법은 바꾸지 않았다. 홈 CTA의 picsum studio-desk 사진만 사용자 결정에 따라 임시 사용한다. footer 문구는 비활성 텍스트다.

## 파일 대응

| 영역 | 파일·역할 |
|---|---|
| 공통·헤더 (DEV-01) | globals.css, Button/Sheet/Dropdown/Skeleton/MarkdownViewer, widgets/header: 승인 공통 스타일·검색·기존 인증 연결 |
| 홈 (DEV-02) | widgets/home: 실제 인기 슬라이더, 분야 카드와 더 보기, 임시 CTA |
| 탐색 (DEV-02) | widgets/project-collection, features/project/project-search-filter: URL 검색·정렬·보기·페이지, Sheet draft/적용/취소 |
| 상세 (DEV-03) | widgets/project/ui/project-detail-page.tsx: 서버 메타·shared MarkdownViewer SSR 소비·자료→AI 조합; project-detail-image.tsx: 대표 이미지 client 오류 처리. shared/ui/markdown-image.tsx: span 기반 본문 이미지 client 오류 처리(DEV-04) |
| 상세 상태 (DEV-03) | project-detail-error.tsx: 같은 URL 재조회·/projects 복귀; project-detail-skeleton.tsx 및 app/projects/[projectId]/loading.tsx: public API 연결; not-found.tsx: 같은 회복 경로 |
| AI 리뷰 (DEV-03) | features/project/project-review/ui/project-review-panel.tsx: 기본 외관만 변경, reviewProject/projectId/요청·loading·error·retry·재생성·점수 clamp·모든 기존 결과 UI 유지 |
| 마이페이지 (DEV-03) | mypage-nav.tsx 한 목록 공유, sidebar/shell: 1280 240px·1024 220px, 미만 상단 메뉴; projects:16:10 이미지·본문 공개 배지·2줄 제목·한 줄 태그·실제 updatedAt·직접 수정 이동 |
| 보호 본문 외곽 (DEV-03) | settings/portfolios/route-placeholder: 외곽 padding·min-width·폭만 조정. ProfileSettingsForm은 기존 코드 그대로 |

## 의도적인 차이

예시 제목·이름·수치·사진·파일명 대신 실제 모델 값을 표시한다. 없는 태그·요약·대표 이미지 영역은 생략하고, 본문이 없을 때 요약을 복제하지 않는다. OWNER와 MEMBER 메타, createdAt ko-KR 형식을 유지한다. 대표 이미지 URL이 존재한 뒤 실패한 경우만 같은16:9 대체 영역과 제목 라벨을 표시한다. API 동적 이미지에는 native img/onError와 하이드레이션 전 complete/naturalWidth 확인을 사용하며 next/image 원격 설정을 늘리지 않았다. 자료는 files.length 및 originalName/fileUrl만 쓰고 긴 이름은 줄바꿈하며 기존 _blank/noreferrer 동작을 유지한다.

HTML 예시 프로필 폼으로 재설계하지 않았다. 기존 필드·저장 버튼·학년 범위·닉네임/자기소개 검증·미리보기·controls/색을 유지했다. 지원은 메뉴만 ‘지원’으로 통일하며 기존 Support 본문 placeholder는 유지한다. ellipsis는 기존처럼 편집으로 직접 이동한다.

## DEV-03 역사 개발 검증 (2026-10-05)

| 명령 | 최종 결과 |
|---|---|
| npx tsc --noEmit --incremental false | exit0; 실제 stdout/stderr0바이트 로그 보존 |
| npm run lint | exit0; 실제 stdout/stderr와 실행 JSON 보존 |
| npm run build -- --webpack | exit0; 최종 production 빌드 로그 보존 |
| npm run start -- --hostname 127.0.0.1 --port 3018 | 같은 환경으로 attempt02 artifact 기동·Ready 및 CUA 확인. exec session39726·실제3018 listener PID31308을 실행 중인 상태로 Master 인계 |

최종 빌드와 start 모두 NEXT_PUBLIC_USE_MOCK_API=false, NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:9018, NEXT_PUBLIC_MOCK_AUTH_STATE=verified를 명시했다. 빌드 전 PowerShell 환경을 각각 설정했다. 첫 제출의 webpack 승인 서술은 당시 승인 근거가 없었던 오류였다. 재시도에서는 Master가 DEV-01의 실제 긴 Windows 경로 실패를 근거로 npm run build -- --webpack 실행을 명시적으로 승인했다. 이는 이 실행 환경의 선택이며 사용자 승인 번들러 변경이나 제품 설정 변경이 아니다. 기본 Turbopack production build는 미검증이며 QA 재빌드도 같은 환경값과 --webpack을 사용한다. next-env.d.ts는 원래 production .next/types/routes.d.ts 참조와 원래 바이트/hash를 유지한다. 소스 manifest hash와 ignored .next build artifact를 별도로 기록했다. 제품 코드에 fixture/QA route/auth bypass/환경 비밀값을 추가하지 않았다.

CUA 개발 smoke에서 상세360/768/1024/1280 title26/32/36/42px·자료320/280px·태블릿 본문 아래2칸·모바일 순서를 확인했다. 실제 Korean meta, Markdown/긴 표·코드 내부 스크롤, 긴 파일명, 대표 이미지 실패/URL 부재, exact empty copy, invalidID 회복, loading skeleton, AI 요청·재생성·error·retry·비활성 loading 및 전체 결과를 확인했다. 마이페이지4폭 메뉴·본문 배지·낮은 mobile 생성 카드, pointer/keyboard 상세/직접 수정 이동, 원래 프로필 폼과 portfolio/support 외곽의 가로 넘침을 확인했다. 최종 통합 home slider 실제 scrollLeft0→302, 공학 더 보기 tags query, Enter 검색, Sheet draft/Escape, 정렬/보기 URL과 Back을 확인했다. 독립 QA의 전체9case·refresh·pagination·감소 모션 확인은 아직 실행 전이다.

초기 router.refresh 오류 회복은 서버 GET이 완료돼도 pending 화면에 남는 실제 재현을 발견했다. 앞선 성공 메모는 결과 화면까지 확인하지 못한 성급한 판정이었다. 최종 같은 URL reload로 수정하고 새 빌드의 실제 내용 복구만 최종 근거로 채택한다. 초기 잘못된1280 캡처와 offscreen blank reference는 역사 기록만 유지하고 actual/corrected 캡처만 폭별 비교 근거로 채택한다. JPEG 픽셀 크기와 DOM CSS viewport는 따로 기록하며 이미지 크기 일치만으로 디자인 PASS를 주장하지 않는다.

## DEV-03 역사 검증 제한과 인계

첫 제출의 shared MarkdownImage 하이드레이션 전 실패 결함과 실제 검수 FAIL·defect JSON·스크린샷은 역사 근거로 보존한다. DEV-03 attempt02/03 당시 상세는 소유 server project-detail-page.tsx에서 기존 react-markdown/remark-gfm으로 SSR하며, 소유 client project-detail-image.tsx의 ProjectDetailMarkdownImage가 ref complete/naturalWidth와 onError를 사용한다. P 안에서는 기존 SPAN/IMG 구조를 유지한다. skipHtml·기본 URL transform·GFM table wrapper·campus-markdown 스타일·alt/title과 기존16:9 fallback 외관을 유지했다. 당시 shared MarkdownViewer/MarkdownImage는 바이트 그대로이고 소비자는 없어 이 helper 자체를 수정했다고 주장하지 않는다.

Attempt02 production CUA에서360/1280 각각 목록→상세 fresh navigation 및 reload를 확인했다. 정상 본문 IMG naturalWidth223은 유지됐고 실패 본문은 aria-label을 가진 SPAN으로 대체됐다(313×176.0625 및720×405). P 안 DIV가0이고 페이지 scrollWidth=clientWidth, 긴 코드/표는 내부 overflow:auto, browser warn/error 로그0이다. 원래 실패 이미지 URL을 포함한 HTTP 응답에도 제목·GFM table·코드·정상 IMG가 있어 서버 렌더링을 확인했다. skipHtml·defaultUrlTransform은 코드 및 설치 라이브러리 검사로 확인했으며 공격적 payload 검사는 생략했다. 새 screenshot4개는 실제 DOM viewport 및 원본 JPEG 크기·hash를 따로 기록한다. 변경 없는 이전 화면 근거는 원래 errata·제약과 정확한 해시를 함께 재사용하며 전체 QA로 확대하지 않았다.

외부 fixture는 제품 밖 work/campus-fixture-server.cjs의 기존 mock resolver 메모리 자료를9018에서 제공한다. mock API=false로 실제 request/rewrite 위치를 지나지만 실제 backend·OAuth·AI 서비스·메일·서버 권한은 검증하지 않았다. 로컬 synthetic 검증은 이 구분을 유지한다. 공격적 injection/security probing/fuzz/load QA는 생략했다. 저장 계약은 코드 보호와 기존 UI 확인 근거이며 실제 backend 저장 검증을 완료로 기록하지 않는다.

독립 QA 주소는 http://127.0.0.1:3018. 당시 worker의 production exec session39726·PID/log·환경·BUILD_ID를 Master가 인수하고 외부9018 및 참조8765 서버를 유지한다. 재기동은 같은 npm run start -- --hostname 127.0.0.1 --port 3018과 환경값을 사용한다. 재빌드가 필요하면 같은 환경을 먼저 설정하고 npm run build -- --webpack을 사용한다. 먼저 http://127.0.0.1:9018/control에서 normal/auth-in cookie를 얻는다. mode=empty/error/delay/long/missing/no-image, 추가 pagination 전용 paged는 외부 제어이고 제품 route가 아니다. 참조는 http://127.0.0.1:8765/uiux-phase1-design.html?charset=utf8. 첫 제출의 start exit1은 worker가 Ready 후 의도적으로 종료한 역사 기록이며 기동 실패가 아니다. 재시도는 normal/auth-in을 복원하고3018을 실행 중인 채 인계하며 exit0을 만들어 기록하지 않는다. 이후 독립 QA 결과는 AgentFlow 실행 기록에 남기며, Wiki는 독립 QA PASS 뒤 별도 writer가 갱신한다.

## 2026-10-05 DEV-04 구현 변경 및 attempt01~03 역사 개발 검증

사용자가 공통 컴포넌트 수리·재사용(raw/1791131570812-message-user-5944f85c-59ee-473b-b77d-ff104cc78db2.txt)과 원본 승인 표 복원·별도 변경 이력(raw/1791131875910-message-user-8114853c-9fc1-4d43-9e0e-541ec265101a.txt)을 결정했다. shared MarkdownImage에 src 의존 ref complete/naturalWidth 확인을 추가해 초기 실패와 onError를 모두 처리한다. failedSource를 현재 src와 비교하므로 새 정상 주소를 이전 실패가 가리지 않는다. p 안 fallback은 span이고 alt/title·campus-markdown-image·16:9 대체 스타일을 유지한다. 상세 server component는 shared MarkdownViewer로 project.content를 렌더링한다. widget ReactMarkdown/remarkGfm/Components/map 및 ProjectDetailMarkdownImage 중복을 제거하며 대표 이미지 ProjectDetailImage는 보존한다. shared Viewer는 skipHtml·라이브러리 기본 URL 변환·GFM·표/코드 내부 스크롤을 유지한다. 원본 7절 표는 원래 텍스트·사유·2026-10-04 승인일 그대로 복원했다.

2026-10-05 KST DEV-04 attempt01에서 실제 type(npx tsc --noEmit --incremental false)·lint(npm run lint)·production build(npm run build -- --webpack)를 실행했고 당시 결과는 모두 exit0이었다. 정확한 UTC 실행 시각·cwd·환경·stdout/stderr(빈 파일 포함)는 run/02-development/dev-04-attempt01-*-run2-receipt.json과 로그에 기록했다. 첫 type 명령은 Windows shell quoting 때문에 도구 실행 전 exit1이었고 그 로그를 보존한 뒤 PowerShell 호출로 run2를 실행했다. 이후 attempt02~04의 문서 변경과 attempt05의 실제 최종 검사·재빌드는 별도 실행 이력이다. 위 attempt01 영수증을 현재 전체 후보의 새 실행으로 읽지 않는다. attempt05의 실제 type/lint/build 결과는 run/02-development/dev-04-attempt05-{type,lint,build}-receipt.json에 보존되어 있다.

DEV-04 attempt01/02의 역사 앱 smoke에서360×800 및1280×900 CSS viewport의 실제 목록 카드→상세 fresh navigation과 reload를 당시 production에서 각각 확인했다. 정상 본문 IMG naturalWidth223, 실패 본문 SPAN(parent P), p 안 div0, 페이지 scrollWidth=clientWidth(345/1265), code/table 내부 overflow:auto, browser warn/error0을 관찰했다. 실패 대체는 모바일313×176.0625/desktop720×405다. 실제 모바일 CUA 가로 스크롤은 code0→345 및 table0→180이고 page0을 유지했다. 당시 원본 JPEG4개는 별도 실제 pixel dimensions·CSS viewport·zoom1·hash를 screenshot-manifest에 기록했다. 정상 dataset 복귀와 reload도 확인했다. 앞선 DEV-04 attempt01/02에서 동일하게 mounted된 본문 이미지의 in-place src 변경은 당시 fixture UI가 제공하지 않아 실행하지 않았고 src 의존 ref/failedSource 비교만 정적으로 확인했다. 2026-10-05 KST DEV-04 attempt03에서는 제품 밖 http://127.0.0.1:9019 외부 컴포넌트 fixture가 현재 shared MarkdownImage 원본 소스(SHA-256 b49d710891e2d85bfaf7175df78d15c86e38a1c15946fa62c3f37e6701ef7285)를 그대로 import한 bundle(05c1216f8fe53328eb0a0c12e49cf0df5261c06c5080e11385124589182cfd11)을 사용했다. documented mcp__cua_repl.js의 Codex IAB에서360×800/1280×900 각각 정상A→실패→정상B→실패→정상A와 주소없음→정상B를 화면 버튼으로 실제 실행했다. 전환 사이 navigation/reload는 없었고 stable 부모·key 구조와 보이는 부모 인스턴스1/변경 횟수0→14가 같은 mounted child의 src prop 변경을 연결한다(부모 counter는 제품 컴포넌트 직접 instrumentation이 아니다). 정상 IMG complete=true/naturalWidth223·alt/title, 실패/주소없음 SPAN role=img·aria-label/title·parent P, p 안 div0, page 가로 넘침없음 및 수집 browser warn/error0을 관찰했다. 독립 실제 screenshot15회(폭별7회+정상A 복원1회)를 즉시 원본 JPEG로 저장하고 호출·관찰·저장 시각/원본 크기/viewport/zoom/hash를 dev-04-attempt03-collection-*와 screenshot-manifest/smoke에 기록했다. 외부 fixture source/build receipt도 함께 보존했다. 정상A와1280×720 기본 viewport를 복원하고 임시 tab을 닫았으며 product9018/reference8765를 건드리지 않았다. 이는 isolated component-runtime 개발 검증으로, 기존 production3018 목록→상세/reload 근거와 구분하며 앱 E2E·독립 QA로 확대하지 않는다. 제품 코드·production build를 변경하거나 재실행하지 않았다. 검증 전용 제품 경로·DOM 상태 주입은 추가하지 않았다. SSR HTTP200 응답의 script 내용을 제외한 서버 HTML에 실제 정상/실패 이미지·제목·표·코드가 있다. 첫 SSR 측정은 streaming loading shell까지만 잘라 false였고 원본 응답을 보존한 corrected receipt가 후속 서버 HTML까지 확인한다. skipHtml/default URL 변환은 코드·설치 라이브러리만 검사했으며 공격 입력은 실행하지 않았다.

DEV-04 attempt01 당시 production은 http://127.0.0.1:3018, listener PID61320, wrapper PID59228, BUILD_ID FUJeijQv5DksiXTBVPCLA이었다. 당시 start stdout의 Ready와 실제 command/port는 dev-04-attempt01-start-receipt.json에 기록했고 실행 중 프로세스의 exitCode는 null로 남겼다. 이 프로세스·artifact는 attempt05에서 교체됐으며 현재 인계 상태를 뜻하지 않는다. build/start 각각 NEXT_PUBLIC_USE_MOCK_API=false, NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:9018, NEXT_PUBLIC_MOCK_AUTH_STATE=verified를 설정했다. attempt01에서는 기존 PID31308만 실제 command/port 확인 후 중지하여 artifact를 교체했고9018/8765는 유지했다. 당시 마지막 CUA에서 normal/auth-in 상태를 복원하고 임시 viewport를 해제했다. source snapshot은 ignored .next artifact/BUILD_ID와 분리했고 원본 source886698dcdd135c8e258b5262d6667fba7f2e9a804c5d7a1812c6a8c24b8a160e 및 next-env.d.ts 원래 bytes/hash를 유지한다.

보존된 기존44개 변경은 시작 후보17fd409d4d82f3438d9a0d02d4248e26fd3e9f211f7ed252d25751834a828dc6과49개 소유 경로를 대조했다. 이번 실제 편집은 공통 이미지·상세 소비/중복 제거·문서3개로 한정하고 나머지 기존 화면 코드는 바이트 그대로다. 보존 화면의 과거 실제 개발 근거는 시각 기준과 파일 해시 연결을 위한 역사 기록이며 새 테스트로 주장하지 않는다. api.md 정렬 설명은 POPULAR이나 enum/기존 구현은 VIEW_COUNT인 차이를 기록하고 API는 변경하지 않았다. 기본 Turbopack build, OS reduced-motion 변경, 실제 attachment 새 창 내용, 실제 backend/OAuth/AI/메일/권한/영속 저장은 이번 개발에서 실행하지 않았다. 이전 개발 관찰은 위 역사 절에만 남으며 새 실행이나 새 승인으로 재사용하지 않는다. 새 독립 QA-01~09는 개발 검수 PASS 이후 실행 전/결과 대기이고 Wiki는 독립 QA PASS 후 별도 writer가 갱신한다. synthetic fixture 검증과 실제 backend/OAuth/AI/메일/권한/영속 저장 검증은 구분하며 공격적 injection/security/fuzz/load QA는 사용자 결정대로 생략한다.

## 2026-10-05 DEV-04 당시 최종 검사와 인계의 역사 근거 (attempt06)

이 절은 DEV-04 attempt06 개발 제출 당시의 최종 검사·인계 이력이다. 아래 영수증의 실제 명령·exit code·시각·후보·artifact는 그 당시의 실제 근거로 보존하며 후속 QA 수리 후보의 새 검사나 현재 실행으로 읽지 않는다. RUN은 이 작업의 AgentFlow 실행 폴더이며 근거는 제품 소스에 포함하지 않는다.

- `02-development/dev-04-attempt06-result.json`: attempt06 제출 당시의 실제 결과, 문서 일치·보존 확인 및 역사 관찰과 새 artifact의 연결 근거.
- `02-development/dev-04-attempt06-type-receipt.json`, `02-development/dev-04-attempt06-lint-receipt.json`, `02-development/dev-04-attempt06-build-receipt.json`: 문서 동결 후 전체 후보에서 실행한 각 명령·환경·시각·exit code·stdout/stderr 경로 및 시작/종료 source hash.
- `02-development/dev-04-attempt06-build-artifact.json`: source snapshot에서 제외된 ignored `.next`의 BUILD_ID·manifest·CSS hash와 해당 build 영수증.
- `02-development/dev-04-attempt06-start-receipt.json`, `02-development/dev-04-attempt06-final-live-process.json`: 같은 환경으로 실행한 production3018의 Ready·실제 listener/command/PID·BUILD_ID와 Master 인계 상태. attempt06 당시 PID/BUILD_ID는 이 영수증이 기준이며 실행 중 exitCode는 null이다.

역사 attempt01/02의360/1280 목록→상세 navigation/reload·캡처와 attempt03의 isolated src 전환은 위 절에 보존한 당시 관찰이다. attempt06 artifact와의 당시 연결은 attempt06-result.json에 기록하는 변경 없는 애플리케이션 소스의 바이트 비교와 rebuild 전 보존한 attempt05 CSS에 대한 새 CSS의 실제 바이트 비교 결과에 한정한다. 실제 비교가 같을 때만 기존 렌더 관찰을 attempt06 artifact의 설명 근거로 연결하며 새 UI 실행을 주장하지 않는다. source candidate와 ignored `.next` artifact는 각각 hash/BUILD_ID 근거로 구분한다. 문서 전용 보완에는 새 전체 UI smoke가 필요하지 않다는 실제 DEV-04 검수 지시에 따라 attempt06에서는 브라우저·OS 검증을 추가하지 않았다. 독립 QA-01~09는 새 개발 검수 PASS 이후 별도 단계이며, 이후 결과는 RUN/03-qa와 QA gate 이후 Wiki에 기록한다. 실제 backend/OAuth/AI/메일/권한/영속 저장 미검증과 사용자 결정에 따른 공격적 QA 생략은 그대로 유지한다.

## 2026-10-05 독립 QA 후속 수리 및 새 검사·인계 (QA-REPAIR-01)

실제 독립 QA `03-qa/qa-attempt01-result.json`은 F-01로 FAIL이며 다른 미완료 관찰은 BLOCKED다. 최종 HTML `uiux-phase1-design.html` 659행의 `ic("arrow-up-right")`와 홈 강조 카드의 `ArrowRight`가 달랐으므로 `featured-project-card.tsx`의 import와 렌더를 기존 Lucide `ArrowUpRight`로 교체했다. 기존 `size-4`, strokeWidth 1.75, aria-hidden, 링크·동작·반응형 구조는 보존한다. 이번에 애플리케이션 소스가 변경되었으므로 위 attempt06의 변경 없는 소스·CSS에 기반한 역사 관찰 연결을 새 후보에 확대하지 않는다.

이 제품·문서 편집을 모두 완료한 뒤 새 전체 후보를 동결하고 동일한 명시 환경(NEXT_PUBLIC_USE_MOCK_API=false, NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:9018, NEXT_PUBLIC_MOCK_AUTH_STATE=verified)으로 실제 타입·린트·webpack build를 실행하여 새 artifact를 production3018로 인계한다. 실행 여부와 성공 여부는 이 예정 서술이 아니라 제출 전에 완성한 아래 RUN 상대 경로의 실제 영수증의 명령·UTC 시각·exit code·후보 hash를 기준으로 읽는다. transient PID·BUILD_ID를 소스 문서에 추가하지 않는다.

- `02-development/qa-repair-attempt01-result.json`: 후속 수리 제출과 실제 검사·인계·문서·보존 결과.
- `02-development/qa-repair-attempt01-candidate-manifest.json`: 모든 편집 후 동결한 전체 후보와 원본 snapshot.
- `02-development/qa-repair-attempt01-type-receipt.json`, `02-development/qa-repair-attempt01-lint-receipt.json`, `02-development/qa-repair-attempt01-build-receipt.json`: 동결 후 실제 타입·린트·webpack 명령·환경·시각·stdout/stderr·exit code 및 시작/종료 후보 hash.
- `02-development/qa-repair-attempt01-build-artifact.json`: 같은 후보로 생성한 ignored `.next` BUILD_ID·manifest hash와 build 영수증 연결.
- `02-development/qa-repair-attempt01-start-receipt.json`, `02-development/qa-repair-attempt01-final-live-process.json`: 새 artifact의 Ready·실제 listener/부모/wrapper·명령·BUILD_ID·Master 인계 근거. 실행 중 exitCode는 null이다.

원본 승인 7·8절과 설계 명세 12절·기타 파일·이전 성공/실패/QA·raw 근거는 그대로 보존한다. 과거 Codex IAB 관찰은 그 당시 surface의 역사 개발·isolated component 관찰이며 이후 컴퓨터 사용은 사용자 결정대로 Cua Driver만 사용한다. 이번 단일 아이콘 수리에는 개발 브라우저 smoke를 추가하지 않으며 실제 타입·린트·webpack·실행 근거로 개발 검수에 제출한다. 새 genuine Claude 개발 PASS와 360/768/1024/1280 화살표 관찰을 포함한 전체 독립 QA-01~09 및 Wiki는 이 수리 제출 시점에 대기다. 기존 미검증·synthetic fixture 한계와 공격적 QA 생략 결정을 유지한다.

## 2026-10-05 PR 제출 전 검토 및 검증

사용자 요청에 따라 현재 `feat/#18` 변경을 커밋·푸시하고 `main` 대상 PR을 생성·병합하기 전에 읽기 전용 코드 검토와 추가 검증을 수행했다. 이 기록은 이전 AgentFlow 개발 검수·독립 QA·Wiki 완료를 대신하지 않는다.

- 모바일 계정 메뉴를 연 상태에서 데스크톱 폭으로 전환하면 숨겨진 Radix 모달이 조작·스크롤을 잠그는 문제를 보완했다. 헤더에서 Tailwind `md`와 같은 `48rem` 미디어 조건 변경을 구독하여 메뉴를 닫고 구독을 정리한다.
- 홈·상세에서 조회·좋아요 수치가 누락되거나 null인 응답을 0으로 표시하도록 보완했다. 화면의 수치와 접근성 라벨에 같은 보정 값을 사용한다. API·저장 계약은 변경하지 않았다.
- 최종 애플리케이션 소스에서 `npx tsc --noEmit --incremental false`와 같은 로컬 TypeScript 실행, `npm run lint`, `npm run build -- --webpack`이 모두 exit 0이었다. 빌드는 기존 실행 산출물과 분리한 동일 소스 복사본에서 `NEXT_PUBLIC_USE_MOCK_API=true`, `NEXT_PUBLIC_MOCK_AUTH_STATE=verified`, 빈 API 기준 URL로 수행했다. 첫 드라이브 간 의존성 연결 시도는 검증 폴더 경로 해석 문제로 실패했고, 같은 드라이브의 독립 복사본 빌드가 성공했다. 기본 Turbopack 빌드는 실행하지 않았다.
- 실제 React 서버 렌더링에서 누락·null·0·양수 수치를 홈과 상세에 각각 전달한 8개 사례가 모두 통과했다. 임시 검증 스크립트는 제품 소스에 추가하지 않았다.
- 별도 production 서버의 Mock 로그인 상태에서 실제 브라우저로 360px 계정 메뉴 열기 → 768px 전환을 확인했다. 메뉴가 닫히고 body pointer-events가 none에서 auto로 복귀했으며 스크롤 잠금도 해제됐다. 768px에서 가로 넘침이 없고 마이페이지 링크로 이동할 수 있었으며 콘솔 오류·경고가 없었다.

이는 병합 전 추가 검증 범위이며 전체 독립 QA, 실제 백엔드·OAuth·저장 동작 검증은 미완료 상태를 유지한다. PR에서는 이슈 #18을 참조하고 미완료 검증을 완료로 표시하지 않는다.
