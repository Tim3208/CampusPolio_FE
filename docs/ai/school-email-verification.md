# 학교 이메일 인증 상태와 복구

## 범위와 현재 상태

2026-11-02 DEV-AUTH-01의 실제 Claude 개발 PASS 이후 DEV-VERIFY-02가 같은 후보의 전체 명령과 개발·HTTP 정적 Storybook 화면을 확인한 개발 기록이다. 제품 변경은 [인증 화면](../../src/widgets/verify-email/ui/verify-email-page.tsx)과 같은 폴더의 stories·fixtures·helpers 4개 파일에 한정하며, 이 문서 작업은 문서 5개만 수정한다. 기존 FSD·public API, API client와 전역 스타일, 이전 포트폴리오 미리보기·유저 플로우 사용자 변경을 보존한다.

최종 독립 QA, 이 문서의 Claude 개발 검수, Claude Wiki 검수, finish·동기화·원본 전달은 이 개발 확인과 별도다. 실제 backend/OAuth·메일 수신·서버 세션·권한·영속 저장은 검증하지 않았다.

## 상태와 복구 동작

| 상태·입력 | 실제 화면과 처리 |
|---|---|
| 최초 사용자 조회 | 조회 중 안내와 비활성 입력을 표시한다. Strict Mode의 effect 재연결에서는 진행 중인 최초 요청을 공유한다. |
| 첫 사용자 GET non-401 실패 | 오류 안내와 `다시 불러오기`를 제공한다. 조회 오류를 이메일 입력 오류로 표시하지 않는다. |
| 재조회 대기·성공·재실패 | 이전 오류를 비우고 같은 재시도의 중복 GET을 막는다. 성공 시 사용자 ID와 기존 학교 이메일 초기화 규칙을 적용한다. 재실패는 새로고침 없이 다시 시도할 수 있다. |
| 발송 대기 | `코드 전송` 이름을 유지하고 해당 버튼에 spinner·aria-busy를 붙인다. 다른 인증 POST도 함께 잠근다. |
| 코드 단계 | 6칸 숫자 입력과 180초 `03:00` countdown을 유지한다. 코드 단계에서 이메일 form Enter는 새 send를 만들지 않는다. |
| 재발송 대기 | 0초에서만 `이메일이 오지 않았나요?`를 실행한다. 이 버튼에만 spinner를 붙이며 `인증 확인`이 재발송 처리로 보이지 않는다. |
| 인증 확인 대기 | `인증 확인` 이름과 해당 spinner를 유지하고 코드 입력을 잠근다. 응답 전에는 next 이동을 하지 않는다. |
| POST 오류·성공 | 오류 뒤 이메일·6자리 값·기존 단계와 타이머를 보존한다. 성공한 send/resend에서만 코드를 비우고 03:00과 첫 칸 초점을 준비한다. 확인 성공은 nextPath로 한 번 이동한다. |
| 00:01 → 00:00 | 1초에서는 재발송 불가, 만료 시 확인 불가·재발송 가능이다. handler에서도 만료 확인 POST를 차단한다. |
| 401·이미 인증된 사용자 | 최초/재조회 및 인증 POST의 401은 인증 화면과 next를 중첩 보존한 로그인 URL로 이동한다. 이미 인증된 사용자 조회는 nextPath로 이동한다. unmount 뒤 늦은 응답을 현재 화면에 반영하지 않는다. |

허용 이메일은 기존 대소문자 무관 `.ac.kr` 규칙이며 전송 전에 trim한다. `person@example.invalid`는 발송 불가이고, `  storybook@syu.ac.kr  `는 `storybook@syu.ac.kr`로 전송된다. 숫자 입력 뒤 다음 칸 이동, 비숫자 제거, 빈 칸 Backspace의 앞 칸 이동, 좌우 방향키와 Tab/Shift+Tab을 보존한다. 첫 칸에 `12a3456`을 붙여넣으면 `123456`을 6칸에 배분하고 마지막 칸에 초점을 둔다. 중간 칸 붙여넣기는 남은 칸 범위만 바꾼다.

## 접근성

- 성공·조회·POST 처리와 만료 전환은 `role=status`, 오류는 `role=alert`의 atomic 안내로 전달한다.
- 매초 변하는 MM:SS는 live 영역 밖에 있다. countdown의 연속 tick에서 status 문구를 반복 갱신하지 않고 만료 전환만 알린다.
- 이메일 hint/이메일 오류는 이메일 입력, 코드 hint/상태/코드 오류와 만료는 코드 그룹과 각 칸의 aria-describedby에 연결한다. 잘못된 이메일 또는 코드 오류·만료에 필요한 aria-invalid를 표시한다.
- 코드 입력 이름은 `1번째 인증번호`부터 `6번째 인증번호`다. 처리 중에도 기존 동작 이름을 읽을 수 있으며 label·placeholder·footer·상태와 오류의 글자 대비를 개선했다.
- 인증 28개 스토리의 설정은 모두 a11y `error`다. 전체 앱의 다른 slice에 남은 todo를 해결했다는 의미는 아니다. 실제 스크린 리더 음성 청취는 수행하지 않았다.

## API 계약과 현재 구현 차이

기준은 [api.md](../../api.md), [이메일 API](../../src/features/auth/email-verification/api/email-verification.ts), [사용자 API](../../src/entities/user/api/get-current-user.ts), [공통 client](../../src/shared/api/client.ts)다.

| 요청 | 명세·현재 요청과 확인 범위 |
|---|---|
| GET `/api/users/me` | 명세 설명은 세션 기반이며 schema의 query `userId`는 required다. 현재 client는 query를 생략한다. Mock의 실제 GET 기록도 query 없음이다. 어느 서버 정책이 맞는지 추측하거나 이번 작업에서 계약을 바꾸지 않았다. |
| POST `/api/auth/email/send`, `/resend` | required query `userId`와 required JSON body의 email을 유지한다. 명세 설명에는 실제 SMTP 대신 서버 로그로 코드를 출력한다고 적혀 있다. 현재 서버 실행이나 실제 메일 수신을 확인한 결과는 아니다. |
| POST `/api/auth/email/verify` | required query `userId`, required body email·code를 유지한다. code schema는 문자열·6자리 숫자 pattern이다. 성공 시 universityVerified 변경은 명세 설명이며 여기서는 MSW 응답과 router mock을 확인했다. |
| 응답·오류 | success/data envelope와 EmailAuthResponse.message 및 UserMeResponse의 id/email/universityVerified를 대조했다. 기존 오류 fixture는 HTTP 400/401/404와 success:false/data.message를 사용한다. 공통 client는 top-level message가 없는 HTTP 오류에 기본 문구 `요청을 처리하지 못했습니다.`를 표시한다. GET의 UserMeResponse는 data.message를 정의하지 않으므로 해당 오류 fixture를 실제 서버 오류 schema 수용의 증거로 확대하지 않는다. resend의 명세는 200 응답만 열거하며 추가 실패 상태를 이번에 명세에 보충하지 않았다. |

다음은 가상 사용자 4210의 기존 Storybook 요청 예다. 실제 계정이나 메일 발송 결과가 아니다.

```text
POST /api/auth/email/send?userId=4210
POST /api/auth/email/resend?userId=4210
```

```json
{ "email": "storybook@syu.ac.kr" }
```

```text
POST /api/auth/email/verify?userId=4210
```

```json
{ "email": "storybook@syu.ac.kr", "code": "123456" }
```

nextPath가 `/projects/new`인 401의 기존 로그인 이동 예는 `/login?next=%2Fverify-email%3Fnext%3D%252Fprojects%252Fnew`다. URL 검증과 router mock 호출은 실제 로그인·세션 복구 성공과 별도다.

## Storybook 사용과 격리

`Widgets/VerifyEmail/VerifyEmailPage/Playground`를 열어 scenario를 바꾸거나 `시나리오 초기화`를 누른다. `send-pending`에서 학교 이메일을 입력하고 `코드 전송`을 누르면 대기를 관찰할 수 있다. `대기 응답 완료`가 해당 응답을 해제한다. `179초 진행`과 `1초 진행`은 제품의 1초 countdown callback만 제어하며 제품 timeout은 180초 그대로다.

`resend-pending`은 발송 → 코드 입력 → 179초/1초 진행 → 재발송 → 대기 응답 완료 순서로 확인한다. `user-retry-pending`은 첫 조회 오류 → 다시 불러오기 → 대기 응답 완료 뒤 학교 이메일과 발송 가능 상태로 복구된다. `send-error`·`verify-error`·`resend-error`의 첫 실패 뒤 같은 입력으로 다시 요청하면 다음 응답이 성공한다. 고정 Failure/UserRecovery 스토리는 play 안에서 성공 재시도/후속 발송까지 진행하므로, 오류 자체를 오래 관찰하려면 Playground를 사용한다.

기존 16개 story ID를 모두 보존하고 총 28개로 확장했다. 지연 send/verify/resend의 단일 POST, 완료 후 초점·코드·타이머, 사용자 복구/재실패/401/기인증, Strict Mode, pending reset과 재발송 reset을 실제 제품 컴포넌트로 검사한다. 요청·pending promise·제어 interval·spy는 reset/unmount/종료 때 정리한다. Docs의 실제 부모 iframe에서는 자동 play를 생략하고, Canvas/Vitest에서는 고정 play를 실행한다. Storybook은 개인 .env를 읽지 않는 기존 allowlist·envDir:false와 fetch→MSW 경계를 유지한다.

## 2026-11-02 개발 검증

run `4f528cb3-3364-4db6-a171-44b1c18d1af9`의 `02-development/verify-attempt-01/`에 원문과 실제 PNG가 있다. 이 결과를 독립 QA나 원본 전달 완료로 해석하지 않는다.

| 실제 실행·관찰 | 이번 결과 |
|---|---|
| 실행별 Node/npm·Chromium | Node 24.22.1 / npm 10.9.9 / Chromium 156.0.8078.4. 전역 설치 변경 없음. |
| 자체 정상 설치 | `npm ci --include=dev --include=optional` exit 0, 939 packages. 짧은 실제 복사본 자체 node_modules이며 junction/symlink/SUBST·외부 의존성 연결을 쓰지 않았다. 개인 .env는 복사하지 않았다. |
| 타입·전체 린트 | `npm exec -- tsc --noEmit --incremental false`, `npm run lint` 각각 exit 0. |
| 필터 없는 전체 기능 | `npm run test:storybook` exit 0, 29개 파일·297/297 통과. 과거 285개 결과를 재사용하지 않았다. 인증 28개 error 설정은 유지된다. |
| 현재 접근성 실행 설정 | index/loadStory metadata와 전역 5개·편집 폼 21개 beforeEach ID 매핑을 합친 error 218 / todo 79. 기능 PASS와 다른 slice의 todo 미완료를 구분한다. |
| 정적 Storybook·기본 앱 build | `npm run build-storybook`, 변경 없는 `npm run build`(Next 16.2.6 Turbopack) 각각 exit 0. webpack 대체 성공을 사용하지 않았다. 앱 빌드 환경은 API/Google ID 빈 값·Mock=true·auth=unverified였다. |
| 인증 실제 화면 | 개발·HTTP 정적 각각 360/375/1280 CSS px, 기본·사용자 조회 대기/오류·send/verify/resend 대기/오류·조회 복구·만료의 11상태, 총 66개 PNG. 해당 최종 화면 axe 위반 0·문서 가로 넘침 0. |
| 기존 미리보기 잔여 확인 | normal/long/empty × 360×640·375×640·375×480·1280×900 × 개발/정적, 24조합 통과. 실제 wheel 내부 끝 스크롤·배경 휠 고정·배경 클릭/Escape/닫기·Tab/Shift+Tab·원래 페이지 스크롤/트리거 초점 복원·재열기 입력/선택/순서/My Projects 보존·저장 POST/PATCH 0. [상세](portfolio-preview-accessibility.md) |
| 시각 회귀 영향 | 기존 12개 manifest의 source와 이번 diff를 대조했다. 인증과 빌더 미리보기는 대상에 없고 공통 CSS·설정·의존성·대상 source/baseline도 불변이므로 `test:visual` 미실행. 기준 자동 갱신 없음. |
| 입력 바이트 | 실행 전 candidate↔복사본 287개 입력 동일. 검사 후 build가 복사본 next-env.d.ts의 .next/dev/types를 .next/types로 생성한 차이를 따로 보존하고 candidate bytes로 복원했다. 후보의 해당 파일은 수정하지 않았다. 최종 문서 반영 뒤 288개 입력 동일성을 다시 확인했다. |
| 문서 링크·구조 | 새 로컬 링크·명령·파일과 Markdown 구조를 확인했다. 기존 보조 디자인 스킬의 두 링크는 원본 로컬 파일은 있으나 candidate 스냅샷에는 없어 별도 제약으로 기록한다. |
| 설치 audit | 이 feat/#18 lockfile의 43건(2 low/26 moderate/13 high/2 critical). 의존성 업데이트는 범위 밖이며 main의 별도 보안 갱신 결과로 바꾸어 기록하지 않는다. |

정적 미리보기의 최초 즉시 초점 읽기 7건 false와 별도 최대 3초 대기 재관찰 12/12 통과(7~24ms)는 미리보기 문서와 browser-observations-03/04.json에 각각 구분한다.

첫 화면 관찰 harness는 고정 Failure와 UserRecovery play가 이미 성공 재시도/후속 발송까지 진행한 뒤의 상태를 잘못 기다려 중단했다. 두 부분 실행과 중단·정정 원문을 남기고, 수동 Playground로 오류/복구 화면을 유지하는 새 관찰에서 위 결과를 얻었다. 제품 동작 실패로 집계하지 않으며 이전 관찰 파일을 덮어쓰지 않았다.

실제 backend/OAuth·실제 메일/서버 로그·세션·권한·영속 저장·운영 SSR·원격 CI·배포는 미검증이다. 이후 별도 actor의 전체 독립 QA와 각 Claude gate·Wiki·finish·동기화 후 Master가 전달 직전 원본을 재대조해야 한다. 원본의 예기치 않은 사용자 변경은 덮어쓰지 않고 병합/충돌 확인하며, 전달 후 변경 파일 hash와 범위 밖 기존 변경 보존을 다시 확인한다.

[이번 실행 원문](<D:/97 Default/Desktop/File/06 Develop/99 etc/AgentFlow/projects/93dc706e-ad02-493b-a5b6-859deff21fa9/ai-log/20261102/4f528cb3-3364-4db6-a171-44b1c18d1af9_학교-인증-상태와-복구-개선/02-development/verify-attempt-01/commands-01.json>), [실제 화면·조작](<D:/97 Default/Desktop/File/06 Develop/99 etc/AgentFlow/projects/93dc706e-ad02-493b-a5b6-859deff21fa9/ai-log/20261102/4f528cb3-3364-4db6-a171-44b1c18d1af9_학교-인증-상태와-복구-개선/02-development/verify-attempt-01/browser-observations-03.json>), [정적 초점 재관찰](<D:/97 Default/Desktop/File/06 Develop/99 etc/AgentFlow/projects/93dc706e-ad02-493b-a5b6-859deff21fa9/ai-log/20261102/4f528cb3-3364-4db6-a171-44b1c18d1af9_학교-인증-상태와-복구-개선/02-development/verify-attempt-01/browser-observations-04.json>), [파일 비교·전달 manifest](<D:/97 Default/Desktop/File/06 Develop/99 etc/AgentFlow/projects/93dc706e-ad02-493b-a5b6-859deff21fa9/ai-log/20261102/4f528cb3-3364-4db6-a171-44b1c18d1af9_학교-인증-상태와-복구-개선/02-development/verify-attempt-01/handoff-manifest-02.json>)를 근거로 사용한다. 인증 수정 자체의 이전 개발 근거는 같은 run의 `02-development/auth-attempt-01/`에 별도로 보존한다.

