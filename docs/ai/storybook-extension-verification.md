# Storybook 확장 개발 확인 — DEV-13

이 문서는 **2026-10-27 개발자 확인 시점**의 증거다. DEV13 최종 Claude 검수·전체 독립QA18개·Wiki 검수/게시·finish·문서 동기화·원본 전달의 완료 증거가 아니다. 이후 결과는 해당 run의 실제 승인·QA·문서 결과를 따른다. DEV01~12의 현재 승인 입력과 새 DEV13 검사를 구분하며 과거 UIUX/Storybook QA·57개·SKIPPED_QUOTA·WAITING_QUOTA·BLOCKED를 이번 PASS로 소급하지 않는다.

## 대상과 출처

- project: `93dc706e-ad02-493b-a5b6-859deff21fa9`
- run: `20261026/a8de601a-9535-49af-8854-38aca70ef90f_sb-ui`
- task/assignment/actor: DEV-13 / MA-9d0b2e34de6f0be297568aeb / /root/safe_dev13_01
- 입력 승인 hash: `412fefbaa1d4fb8df6e132969aa0dd9f655244a7445fe21cfbbdde3e930bc30b`
- 승인 제품 manifest SHA256: d2e589a70b376848f5eaac2f68e8aa07ed1f15d276eb34278d26569ecf932745. 명시 productFiles266개를 대조했고 Wiki4개는 읽기·복사 대상에서 제외했다. 자기 소유 문서5개 overlay는 별도 최종 hash로 기록한다.
- 증거 기준: run 아래 `02-development/DEV-13/attempt-01`. `context-read-proof-01.json`, `context-reread-02.json`은 필수 입력 실제 읽기·복원 hash를 보존한다. `dependency-read-proof-02.json`은 최종 accepted DEV01~12 전체 원문 읽기다. 후속 검증이 과거 원문의 결과를 대체하지 않는다.
- 이 candidate에는 독립 Git 루트가 없으며 scoped git status가 상위 저장소의 main/미추적 경로를 표시했다. 이를 원본 프로젝트의 clean Git 상태로 해석하지 않는다. 소스 보존은 명시266개 바이트/hash와 자기 소유 overlay로 확인한다.

## 실제 명령과 종료

Node24.22.1/npm10.9.9, Windows win32/x64. 아래 시각은 실제 실행 receipt의 ISO 8601 KST(+09:00)다. 각 이름의 `.receipt.json`에 절대 argv/cwd/PID, `.stdout.txt`/`.stderr.txt`에 원문을 보존했다. canonical은 앞선DEV12 clean설치가 확인된 동일lock을 재사용했다. 새 짧은 copy는 자체clean설치다.

| 증거 이름 | 실제 명령의 의미 | 종료 코드 | 시작 → 종료 |
|---|---|---:|---|
| node-version-01 | `node --version` | 0 | 2026-10-27T11:54:21.684+09:00 → 2026-10-27T11:54:21.849+09:00 |
| npm-version-01 | `npm --version` | 0 | 2026-10-27T11:54:22.034+09:00 → 2026-10-27T11:54:22.401+09:00 |
| types-01 | `npm exec -- tsc --noEmit --incremental false` | 0 | 2026-10-27T11:54:22.484+09:00 → 2026-10-27T11:54:29.483+09:00 |
| lint-01 | `npm run lint` | 0 | 2026-10-27T11:54:29.548+09:00 → 2026-10-27T11:56:33.697+09:00 |
| storybook-all-01 | `npm run test:storybook` | 0 | 2026-10-27T11:56:33.700+09:00 → 2026-10-27T11:59:28.864+09:00 |
| visual-all-01 | `npm run test:visual` | 0 | 2026-10-27T11:59:28.866+09:00 → 2026-10-27T12:00:08.214+09:00 |
| storybook-build-01 | `npm run build-storybook` | 0 | 2026-10-27T12:00:08.217+09:00 → 2026-10-27T12:00:49.226+09:00 |
| next-default-01 | `npm run build` | 1 | 2026-10-27T12:00:49.229+09:00 → 2026-10-27T12:02:01.878+09:00 |
| next-webpack-01 | `npm run build -- --webpack` | 0 | 2026-10-27T12:02:01.895+09:00 → 2026-10-27T12:03:08.920+09:00 |
| short-clean-ci-01 | `npm ci --prefer-offline` | 0 | 2026-10-27T11:55:47.175+09:00 → 2026-10-27T11:57:10.426+09:00 |
| short-next-default-01 | `npm run build` | 0 | 2026-10-27T11:57:10.489+09:00 → 2026-10-27T11:57:42.570+09:00 |

기능은 **28파일273개**, 시각은 **10파일12개**가 실제 통과했다. 접근성 설정은 error180/todo93이며 todo를 접근성 PASS로 세지 않는다. 별도 시각의 error8/todo4도 같은 구분이다. 정적 Storybook index와 source ID가 일치한다.

기본 Next build는 긴 경로 `.next/server/chunks/ssr/...js.map`의 filesystem path length 초과로 exit1이다. 기본 package script·전역 설정을 바꾸지 않았다. webpack exit0과 짧은 실제 copy `C:/Users/Timteam/AppData/Local/Temp/cp-sb-dev13-build-a8de`의 자체 ci/default build exit0은 별도 결과다. SUBST/junction은 사용하지 않았다. 공개 tarball seed를 배정받았으나 seed 자체는 설치/감사 PASS가 아니다. clean ci는939개 추가/940개 감사, **21개 취약점(1 low/5 moderate/13 high/2 critical)**을 보고했다. audit fix는 하지 않았다. 생성 next-env는 원문 바이트를 보존 후 복원했다.

## 대표 화면과 실제 조작

직접 연 headless Chromium156.0.8078.4에서 로컬 개발6006/정적6007/별도내부Mock앱3123을 확인했다. 대표 manager/앱 viewport는1440×1000 CSS px이며 전체 페이지 PNG 높이는 콘텐츠에 따라 다르다. 이는 전체 독립QA18개나 모든 반응형 수동검사의 대체가 아니다.

| 범위 | 실제 확인 및 고유 근거 |
|---|---|
| 개발/정적 Button | label/outline/lg Controls 반영과 수동click1: `dev/static-button-controls-03.png`, `ui-storybook-observations-03.json`. disabled와 reset: `manual-observations-06.json`, `dev/static-button-reset-06.png`. |
| 개발/정적 Input | Controls→미리보기 반영, 120ms 간격 연속타이핑, 양쪽 DOM 값 `Controls 입력 예제 ABC`가100ms 간격3회 일치·focus true, 캡처 뒤3회 재확인, 초기화: `stable-input-observations-08.json`, `dev/static-stable-input-08.png`. 06의 즉시 raw/PNG는 channel 반영 전 중간 관찰이며 최신 동기화 성공 근거로 사용하지 않는다. |
| 개발/정적 Dialog·리뷰 | 같은 action close에서 닫기→본문 변경→재열기·Escape/trigger 복귀: `manual-observations-06.json`, `dev-dialog-reopen-06.png`, `static-dialog-reopen-06.png`. 리뷰는 Controls 반영을 기다린 뒤 body 없는 POST 503→재시도 200→reset을 확인했다. `review-viewport-observations-11.json`, `dev-review-retry-11.png`, `static-review-retry-11.png`이 최종 근거다. |
| 개발/정적 Docs | Button 목적/props/대표예제 실제 렌더: `dev/static-docs-03.png`, `ui-storybook-observations-03.json`. toolbar6폭 설정과 자동viewport는 별도source/manifest로 대조. |
| 내부Mock앱 | 실제 홈→목록list: `app-home-02.png`, `app-list-02.png`, `app-partial-observations-02.json`. trim검색 `  캠퍼스  `→`keyword=캠퍼스`, VIEW_COUNT/list, reload/back/forward의 URL/입력 유지, 실제`/projects/8`상세: `ui-app-observations-07.json`과`app-search/sort/detail-07.png`. |
| 실제 오류 reload | `/projects/0` 다시시도 후 document navigation GET1→2, 오류 화면 유지: `app-reload-error-07.png`/동일JSON. 실제backend404 또는 recovery성공이 아니다. |

자동화 초안의 중복 link/heading, combobox를 link로 찾은 오류, `sort` 대신 실제 `filterType`을 기다려야 했던 오류, 비동기 반영·이동 완료 전 관찰은 원문 오류와 중간 결과를 보존했다. 리뷰09는 실제 503→200 요청을 했지만 성공 버튼 이름을 잘못 기다렸고, 리뷰10은 scenario 반영 전 클릭했다. 최종07/08/11로 정정하며 제품 실패나 실제 통과로 왜곡하지 않는다. Storybook 기능273 자동검사와 대표 수동 조작은 다른 범위다.

## 시각 12개와 폰트

[시각 manifest](../../tests/visual/manifest.json), [실행 안내](../../tests/visual/README.md), [폰트 출처/해시](../../tests/visual/fonts.json)를 따른다. `visual-inventory-01.json`에 기준/actual SHA256과 실제 PNG헤더 크기를 보존했고 모두 각 CSS viewport와 일치한다. `visual-<storyId>.png/json`·`visual-<storyId>-font-probe.json`·`visual-font-specimen.png/json`은 이번 실행 산출물을 별도 복사해 보존한 증거다. font-specimen은12개 기준에 포함되지 않는다.

win32/x64 OS10.0.26200, Node24.22.1/npm10.9.9, Chromium revision1248/156.0.8078.4, DSF1, outer1600×2000, iframeScale1, ko-KR/Asia/Seoul, fixture2026-10-26T12:00:00+09:00. Pretendard1.3.9 로컬9굵기는 앱CDN과 같은바이트이며 loaded/computed/CDP customFont·postScriptName·glyphCount를 검사한다. 실제body Locator·portal포함·fullcontent·threshold0/mismatch0/includeAA true다. 일반 비교에서 baseline을 갱신하지 않았다.

| 원본 story ID | CSS px 폭×높이 | 접근성 설정 |
|---|---:|---|
| `widgets-home-projectcard--normal` | 1280×900 | error |
| `widgets-home-projectcard--long-content` | 375×900 | error |
| `widgets-projectcollection-projectcard--failed-thumbnail` | 375×900 | error |
| `shared-markdownviewer--long-content` | 768×1500 | todo |
| `shared-sheet--bottom` | 375×900 | error |
| `shared-dropdownmenu--normal` | 375×900 | todo |
| `widgets-projectcollection-projectcollectionpage--grid-first-page` | 1280×1400 | error |
| `widgets-projectcollection-projectcollectionpage--list-first-page` | 375×1800 | error |
| `widgets-project-projectdetailpage--normal` | 1440×1500 | error |
| `widgets-header-appheader--mobile-menu` | 375×900 | todo |
| `features-profile-profilesettingsform--required-validation` | 768×1200 | todo |
| `features-project-projectreviewpanel--failure` | 375×900 | error |

초기DEV11의 축소/하단잘림 PNG, HTMLElement screenshot timeout, `--update=false`오해와 정정 증거는 이 최종 비교로 소급하지 않는다. 현재일반비교는 `--update=none`+CI이며 명시갱신만 `test:visual:update`다. 실제 변경/누락 대조·전체glyph 검증 등 독립QA 요구는 유지된다. windows-2025 원격실행은 하지 않았고 로컬세부OS와 동일하다고 단정하지 않는다.

## 개별 접근성 todo

아래93개ID는 현재 실행설정의 미완료 목록이다. source별 beforeEach도 반영했다. metadata 복제 전 공유참조 및 AST만의 추출/편집beforeEach누락은 `inventory-corrections-03.json`으로 정정했고 이전파일은 보존했다. 최종 `runtime-story-inventory-final-03.json`은273개 전체ID·argTypes·설정·사유와 그룹별수를 담는다. todo는 전역rule해제가 아니며 기능pass로 접근성pass를 만들지 않는다. Source의 설명에 포함된 당시DEV관찰도 그 시점의 근거다.

| 정확한 story ID | 현재 원인·범위 |
|---|---|
| `features-auth-googlesigninbutton--missing-configuration` | color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `features-auth-googlesigninbutton--script-failure` | color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `features-auth-googlesigninbutton--missing-credential` | color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `features-auth-googlesigninbutton--bad-request` | color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `features-auth-googlesigninbutton--unauthorized` | color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `features-auth-googlesigninbutton--server-failure` | color-contrast: 실제 제품 오류 문구 #e7000b/#fde5e7 대비 3.98이 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `features-portfolio-portfoliobuilder--playground` | 진입 시 저장·선택·미리보기를 자동 실행하지 않는다. Controls 또는 초기화 버튼으로만 새 시나리오를 시작한다.  접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--empty` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--load-error` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--long-content` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--selection-and-preview` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--preview-open` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. 미리보기 프로젝트 순번 text-slate-200 대비 위반. dialog 역할/focus trap/Escape/복귀는 제품에 없는 수동 확인 한계. |
| `features-portfolio-portfoliobuilder--validation-boundaries` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--minimal-save` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--single-project-save` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. |
| `features-portfolio-portfoliobuilder--ordered-save` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. |
| `features-portfolio-portfoliobuilder--saving` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--create-failure` | create 단계의 HTTP 400 실패. 이전 요청은 취소/rollback하지 않고 이후 요청과 이동만 중단하는 현재 제품 동작이다.  접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. |
| `features-portfolio-portfoliobuilder--info-failure` | info 단계의 HTTP 400 실패. 이전 요청은 취소/rollback하지 않고 이후 요청과 이동만 중단하는 현재 제품 동작이다.  접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. |
| `features-portfolio-portfoliobuilder--projects-failure` | projects 단계의 HTTP 400 실패. 이전 요청은 취소/rollback하지 않고 이후 요청과 이동만 중단하는 현재 제품 동작이다.  접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. |
| `features-portfolio-portfoliobuilder--order-failure` | order 단계의 HTTP 400 실패. 이전 요청은 취소/rollback하지 않고 이후 요청과 이동만 중단하는 현재 제품 동작이다.  접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. |
| `features-portfolio-portfoliobuilder--visibility-failure` | visibility 단계의 HTTP 400 실패. 이전 요청은 취소/rollback하지 않고 이후 요청과 이동만 중단하는 현재 제품 동작이다.  접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. 선택 카드 날짜 및 선택 순번에도 color-contrast 위반이 있다. |
| `features-portfolio-portfoliobuilder--retry-success` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-portfolio-portfoliobuilder--file-preview-and-reset` |   접근성 미완료(todo): color-contrast: 제목/설명 글자 수의 #90a1b9/white 대비 2.63:1 &lt; 4.5:1. list: 단계 ol의 직계 span. 제품 수정은 이 story 작업 범위 밖. |
| `features-profile-profilesettingsform--required-validation` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다. |
| `features-profile-profilesettingsform--bad-request` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다. |
| `features-profile-profilesettingsform--unauthorized` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다. |
| `features-profile-profilesettingsform--not-found` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다. |
| `features-profile-profilesettingsform--conflict` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다. |
| `features-profile-profilesettingsform--server-failure` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다. |
| `features-profile-profilesettingsform--partial-create-failure` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다.  POST 성공 뒤 PATCH 실패 시 현재 폼은 hasProfile을 바꾸지 않습니다. 재시도는 POST부터 다시 시작합니다. rollback이나 서버 중복 생성 안전성을 보장하지 않으며 실제 서버에서는 409가 가능하다는 기존 경계입니다. |
| `features-profile-profilesettingsform--reset-and-focus` | 접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다. |
| `features-project-projecteditorform--playground` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--edit-loaded` |  업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--publish` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--draft` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--private-save` |  업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--edit-save` |  업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--validation` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--tags-boundary` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--saving` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--unauthorized` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--unverified` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--forbidden-edit` |  업로드된 파일 문구: #62748e/#f1f5f9, 대비 4.34:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--save-error` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--retry` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--files-allowed` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--file-size-boundary` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--unsupported-files` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--inline-image-known-limitation` | 제품 결함 재현(삽입 성공 아님): JPG/JPEG/PNG 업로드 API와 성공 문구는 발생하지만 isUploading=true/contentEditable=false 동안 ref.insertImage가 호출되어 실제 본문 img/Markdown은 추가되지 않는다. 제품 수리·QA 예외가 아니며 독립 RichMarkdownEditor 삽입 성공과 구분한다. 업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--upload-pending-known-limitation` | 업로드 지연/disabled 복구는 검증되지만 완료 문구와 달리 본문 삽입은 실패하는 제품 한계다. 이 사례의 동작 검증을 이미지 삽입 PASS로 집계하지 않는다. 업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--upload-error` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projecteditorform--reset` |  업로드된 파일 문구 4.34:1 및 공개 등록 설명 #62748e/#dbeafe 3.90:1 &lt; 4.5:1. 기존 ProjectEditorForm 색상은 DEV-08 수정 범위 밖. 접근성 미완료(todo)이며 동작 검증 통과와 구분. |
| `features-project-projectreviewpanel--success` |  scrollable-region-focusable: 리뷰 코드 pre.max-h-48의 키보드 접근이 없다. 리뷰 제품 UI 수정은 DEV-01 범위 밖이다. |
| `features-project-projectreviewpanel--retry-success` |  scrollable-region-focusable: 재시도 성공 리뷰 코드 pre.max-h-48의 키보드 접근이 없다. 리뷰 제품 UI 수정은 DEV-01 범위 밖이다. |
| `shared-button--variants` |  color-contrast: destructive 버튼의 #e7000b/#fde5e7 대비 3.98:1이 4.5:1에 미달한다. 제품 색상 변경은 DEV-01 범위 밖이다. |
| `shared-dropdownmenu--normal` | 접근성 미완료(todo): aria-hidden-focus. 기본 modal 메뉴가 열린 동안 Radix가 숨긴 #storybook-root(독립 iframe) 또는 렌더 Vitest의 div 요소(data-aria-hidden=true, aria-hidden=true)에 focusable trigger가 남습니다. 실제 Enter/Space/방향키·Escape·외부 닫기와 focus 복귀는 play로 별도 확인합니다. 안정된 열린 상태에서도 재현한 DEV-02 menu-diagnostic.json/PNG 및 stories-02 원문 근거이며 접근성 PASS가 아닙니다. modal 동작이나 axe rule은 변경하지 않습니다. |
| `shared-dropdownmenu--long-item` | 접근성 미완료(todo): aria-hidden-focus. 기본 modal 메뉴가 열린 동안 Radix가 숨긴 #storybook-root(독립 iframe) 또는 렌더 Vitest의 div 요소(data-aria-hidden=true, aria-hidden=true)에 focusable trigger가 남습니다. 실제 Enter/Space/방향키·Escape·외부 닫기와 focus 복귀는 play로 별도 확인합니다. 안정된 열린 상태에서도 재현한 DEV-02 menu-diagnostic.json/PNG 및 stories-02 원문 근거이며 접근성 PASS가 아닙니다. modal 동작이나 axe rule은 변경하지 않습니다. |
| `shared-markdownviewer--headings-and-lists` |  label: GFM의 disabled checkbox에 접근 가능한 이름이 없다. Markdown 제품 렌더러 수정은 DEV-01 범위 밖이다. |
| `shared-markdownviewer--long-content` |  label 및 scrollable-region-focusable: GFM checkbox 이름과 .campus-markdown-table/pre의 키보드 접근이 없다. 제품 렌더러 수정은 DEV-01 범위 밖이다. |
| `widgets-mypage-mypageportfoliospage--normal` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '썸네일 없음'의 #62748e/#e2e8f0 대비 3.86:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageportfoliospage--public` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageportfoliospage--private` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '썸네일 없음'의 #62748e/#e2e8f0 대비 3.86:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageportfoliospage--long-content` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '썸네일 없음'의 #62748e/#e2e8f0 대비 3.86:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageportfoliospage--relative-times` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '썸네일 없음'의 #62748e/#e2e8f0 대비 3.86:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageportfoliospage--playground` | 자동 play 없이 portfolios와 errorMessage를 바꾸고 카드를 조작합니다. Controls 변경은 미리보기 props만 바꾸며 서버 데이터나 제품 기본값을 저장하지 않습니다.  접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '썸네일 없음'의 #62748e/#e2e8f0 대비 3.86:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--normal` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--settings-isolation` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--published` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--draft` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--failed-image` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--long-content` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--relative-times` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageprojectspage--playground` | 자동 play 없이 projects/errorMessage Controls로 표시를 바꿉니다. 상세·수정 요청은 Actions에서 확인할 수 있으며 목록은 전달한 props 그대로 유지됩니다.  접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageshell--projects` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '태그 없음'의 #62748e/#f1f5f9 대비 4.34:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-mypage-mypageshell--portfolios` |   접근성 미완료(todo): aria-allowed-role: 기존 article 요소의 role=link가 허용되지 않습니다. color-contrast: '썸네일 없음'의 #62748e/#e2e8f0 대비 3.86:1이 4.5:1에 미달합니다. DEV-06 stories-02 Chromium 검사에서 확인했습니다. 제품 수리는 스토리 작업 범위 밖이며 접근성 PASS로 집계하지 않습니다. |
| `widgets-project-projectdetailpage--long-content` | 긴 제목·첨부명·표·코드. 표와 코드는 내부 스크롤이어야 하며 전체 문서 넘침을 숨기지 않습니다. 접근성 미완료(todo): 실제 error 검사에서 .campus-markdown-table과 pre의 scrollable-region-focusable 위반을 확인했습니다. 기존 MarkdownViewer의 키보드 접근 문제이며 제품 수정은 이 스토리 작업 소유 범위 밖입니다. 동작 통과와 접근성 미완료를 구분합니다. |
| `widgets-verifyemail-verifyemailpage--playground` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. UNIVERSITY EMAIL label #8ec5ff/#ffffff 대비 1.81도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--email-validation` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--user-loading` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--signed-out` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. UNIVERSITY EMAIL label #8ec5ff/#ffffff 대비 1.81도 관찰했습니다. 오류 문구 #e7000b/#fef2f2 대비 4.36도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--already-verified` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. UNIVERSITY EMAIL label #8ec5ff/#ffffff 대비 1.81도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--user-failure` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. UNIVERSITY EMAIL label #8ec5ff/#ffffff 대비 1.81도 관찰했습니다. 오류 문구 #e7000b/#fef2f2 대비 4.36도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--send-pending` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. button-name: 로딩 아이콘으로 대체된 submit/인증 확인 버튼에 접근 가능한 이름이 없습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--send-failure` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. UNIVERSITY EMAIL label #8ec5ff/#ffffff 대비 1.81도 관찰했습니다. 오류 문구 #e7000b/#fef2f2 대비 4.36도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--send-unauthorized` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. UNIVERSITY EMAIL label #8ec5ff/#ffffff 대비 1.81도 관찰했습니다. 오류 문구 #e7000b/#fef2f2 대비 4.36도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--code-keyboard` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--timer-and-resend` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--resend-failure` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. 오류 문구 #e7000b/#fef2f2 대비 4.36도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--verify-pending` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. button-name: 로딩 아이콘으로 대체된 submit/인증 확인 버튼에 접근 가능한 이름이 없습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--verify-failure` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. 오류 문구 #e7000b/#fef2f2 대비 4.36도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--verify-unauthorized` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. 오류 문구 #e7000b/#fef2f2 대비 4.36도 관찰했습니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |
| `widgets-verifyemail-verifyemailpage--verify-success` | color-contrast: 실제 제품의 6-DIGIT CODE #cad5e2/#ffffff 대비 1.48 및 footer #cad5e2/#f8fafc 대비 1.42가 4.5:1에 미달합니다. DEV-10 story-01 실제 Chromium error 검사에서 확인했습니다. 제품 변경은 이 TODO 소유 범위 밖이며 todo는 접근성 통과가 아닙니다. |

## 계약 차이·미검증·후속 gate

[사용 안내의 현재 계약 차이](storybook-guide.md#환경-격리와-실제-앱-경계)에 POPULAR/VIEW_COUNT, 필수userId query/client생략, grade null/integer, Profile POST→추가PATCH실패 재시도, Portfolio 로컬미리보기/저장썸네일·미리보기키보드·360px제목한계, RTE링크prompt/이미지callback과 폼이미지누락, 통합Dialog focus, Header mock메뉴닫힘, 이메일180초와 Google로컬double을 구체적으로 기록했다. 명세나제품계약을 문서만으로수정하지 않는다.

실제backend/OAuth/AI/메일·권한/영속저장/외부SDK성공, 원격CI실행, 공개호스팅/push/PR/merge/배포/원본전달은 수행하지 않았다. [PR workflow](../../.github/workflows/storybook.yml)의작성·로컬검사와 실제원격run은다르다. 개발자확인, DEV13의진짜Claude, 전체독립QA18개, Wiki/Claude/게시, finish/COMPLETE, 별도documentation결과·동기화, 원본전달은 각각후속증거가필요하다. 이문서의미실행표현은개발기록시점에한정되며후속완료여부는해당run증거로갱신판단한다.
