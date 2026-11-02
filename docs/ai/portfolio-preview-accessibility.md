# 포트폴리오 미리보기 접근성 개선

## 목적과 범위

선택한 프로젝트의 기존 요약 미리보기를 키보드와 좁은 화면에서 사용할 수 있도록 개선한다. 대상은 `src/features/portfolio/portfolio-builder/ui/portfolio-builder.tsx`와 해당 Storybook 스토리다. 백엔드 API·저장·공개 정책은 이 작업에서 변경하지 않는다.

## 구현 내용과 완료 조건

- 기존 Radix Dialog를 사용해 대화상자의 제목과 모달 의미를 제공한다.
- 열 때 제목으로 포커스를 옮기고 Tab과 Shift+Tab이 대화상자 안에서 이동한다. 닫기 버튼·Escape·배경 클릭으로 닫으며 포커스를 미리보기 버튼으로 되돌린다.
- 배경 조작과 스크롤을 제한하고 닫은 뒤 정상 상태로 복원한다.
- 좁은 화면에서 제목과 닫기 버튼을 유지하며 내용 영역을 스크롤한다. 긴 제목과 본문, 빈 선택 및 많은 프로젝트를 확인한다.
- 다시 열어도 입력한 정보와 프로젝트 선택·순서가 유지된다.

## 검증 상태

2026-11-02, 짧은 경로의 소스 복사본에서 Node 24.18.0과 기존 의존성 연결을 사용했다.

- Storybook Chromium 기능 테스트: 29개 파일·285개 통과. 의존성 연결 대상이 Vite 허용 경로 밖이어서 첫 실행은 테스트 전에 실패했고, 복사본 설정에 해당 경로를 추가해 재실행했다.
- Storybook 화면: 데스크톱에서 미리보기와 Escape 닫기·버튼 포커스 복귀를 확인했고, 360·375px에서 열린 팝업을 확인했다. 빈 선택·긴 내용과 키보드 흐름은 Storybook 자동 테스트로 확인했다. 모바일 스크롤과 배경 클릭은 별도 수동 검증하지 않았다.
- 타입 검사와 변경 파일 린트, Storybook 빌드, webpack 앱 빌드 통과.
- 기본 Turbopack 앱 빌드는 검증 복사본의 `node_modules` 연결이 프로젝트 루트 밖을 가리켜 실패했다. 원본 경로의 기본 빌드는 이번에 실행하지 않았다.
- 개발 Storybook 서버를 켠 상태에서 빌드를 병행해 Windows 파일 감시의 EBUSY가 발생했다. 개발 화면 관찰과 성공한 정적 빌드 결과는 구분한다.
- 기존 시각 비교 대상에 이 팝업이 없어 `test:visual`은 실행하지 않았다.
- 실제 백엔드·로그인·저장·공개 권한: 이번 작업의 검증 범위 밖.

Storybook의 일부 기존 빌더 접근성 todo는 색상 대비와 목록 구조 등 별도 원인이 있으므로 미리보기 수정만으로 전체 해결로 표시하지 않는다.

## 2026-11-02 정상 설치와 모바일 잔여 개발 확인

위의 Node24.18·외부 의존성 연결·수동 미검증·기본 빌드 실패·EBUSY는 이전 작업의 이력이다. 이번 DEV-VERIFY-02는 승인된 인증 후보를 Node24.22.1/npm10.9.9와 짧은 실제 복사본 `D:/cp-auth-verify-20261102`의 자체 정상 `npm ci --include=dev --include=optional`에서 확인했다. 외부 node_modules 연결·Vite 허용 경로 수정·SUBST·개인 .env 복사를 사용하지 않았다. 미리보기 제품 파일은 이번 작업에서 수정하지 않았다.

| 화면 크기 | 개발 Storybook | HTTP 정적 Storybook |
|---|---|---|
| 360×640 | normal·long·empty 확인 | normal·long·empty 재관찰 확인 |
| 375×640 | normal·long·empty 확인 | normal·long·empty 재관찰 확인 |
| 375×480 | normal·long·empty 확인 | normal·long·empty 재관찰 확인 |
| 1280×900 | normal·long·empty 확인 | normal·long·empty 재관찰 확인 |

각 목록에서 제목 `모바일 검증 normal/long/empty`와 설명 `입력 보존과 선택 순서 확인`을 입력했다. normal/long은 3개를 선택하고 첫 항목을 아래로 옮겨 도서관 지도 → 캠퍼스 기록(또는 긴 제목) → 연구 노트 순서로 바꿨다. empty는 빈 선택 안내를 확인했다.

- 제목과 닫기 버튼이 보이고, 이름이 있는 dialog의 제목에 처음 초점이 갔다. Tab/Shift+Tab은 대화상자 내부에 머물렀다.
- 실제 mouse wheel로 내용 영역의 끝에 도달해 마지막 연구 노트 또는 빈 안내를 확인했다. 긴 목록의 375×480에서는 내부 scrollTop 1226 / scrollHeight 1562 / clientHeight 336이었다. 해당 실제 PNG를 확인했다.
- 노출된 배경에서 wheel을 돌려도 원래 페이지 scrollY가 바뀌지 않았고 body overflow는 hidden이었다. 배경을 실제 클릭해 닫은 뒤 원래 scrollY와 trigger 초점, overflow 및 스크롤 가능 상태가 돌아왔다.
- 다시 열어 제목·설명 입력과 3개 선택·순서·`My Projects` 템플릿을 보존했다. Escape·닫기 버튼도 사용했으며 각 시나리오의 저장 POST/PATCH는 0회였다. 이 화면은 기존 프로젝트 요약 미리보기이며 입력한 포트폴리오 제목/설명을 새 템플릿 결과로 렌더링하는 기능을 추가한 것은 아니다.

초점 관찰은 시점을 구분한다. 최초 개발 12조합은 통과했고, 최초 정적 12조합에서는 마지막 닫기 버튼 직후의 즉시 초점 읽기 7건이 false였다. 배경 닫기·스크롤 복원·재열기 결과는 모두 통과한 상태였다. 원문 `browser-observations-03.json`을 그대로 보존했다. 새 정적 12조합은 닫힌 상태 뒤 최대 3초의 명시적 초점 복귀 대기로 재관찰했다. 이때도 즉시 읽기는 4건 false였지만 모두 트리거 초점으로 복귀했고, hidden 뒤 읽기/대기 경과는 7~24ms였다. `browser-observations-04.json`에 immediate 값·경과시간과 별도 PNG를 남겼다. 즉시 읽기와 비동기 복원 결과를 같은 관찰로 바꾸지 않았다.

정상 설치에서 타입·전체 린트·필터 없는 Storybook **29파일·297/297**·정적 Storybook·기본 `npm run build`(Next16.2.6 Turbopack)는 각각 exit0이었다. 기본 스크립트나 의존성은 바꾸지 않았고 webpack 대체 결과를 사용하지 않았다. 같은 폴더의 개발 서버와 build는 병행하지 않았다. build가 복사본 next-env.d.ts의 route-types import를 생성한 차이는 따로 보존하고 후보 바이트로 복원했다. 기존 시각 12개 대상 source·공통 CSS/설정/의존성에는 영향이 없어 `test:visual`은 미실행이며 기준 이미지도 불변이다.

이번 feat/#18 설치 audit43(2 low/26 moderate/13 high/2 critical)과 기존 빌더 대비·목록 todo는 남는다. 실제 서버 저장/공개 권한·OAuth·메일·세션·영속 저장은 미검증이다. 이는 개발 확인이며 최종 독립 QA·Claude 문서/Wiki 검수·finish·동기화·원본 전달은 별도다.

근거는 run `4f528cb3-3364-4db6-a171-44b1c18d1af9`의 `02-development/verify-attempt-01/`에 있다. [전체 명령 원문](<D:/97 Default/Desktop/File/06 Develop/99 etc/AgentFlow/projects/93dc706e-ad02-493b-a5b6-859deff21fa9/ai-log/20261102/4f528cb3-3364-4db6-a171-44b1c18d1af9_학교-인증-상태와-복구-개선/02-development/verify-attempt-01/commands-01.json>), [인증과 최초 미리보기 관찰](<D:/97 Default/Desktop/File/06 Develop/99 etc/AgentFlow/projects/93dc706e-ad02-493b-a5b6-859deff21fa9/ai-log/20261102/4f528cb3-3364-4db6-a171-44b1c18d1af9_학교-인증-상태와-복구-개선/02-development/verify-attempt-01/browser-observations-03.json>), [정적 초점 재관찰](<D:/97 Default/Desktop/File/06 Develop/99 etc/AgentFlow/projects/93dc706e-ad02-493b-a5b6-859deff21fa9/ai-log/20261102/4f528cb3-3364-4db6-a171-44b1c18d1af9_학교-인증-상태와-복구-개선/02-development/verify-attempt-01/browser-observations-04.json>), [학교 인증 및 검증 경계](school-email-verification.md)를 함께 읽는다.
