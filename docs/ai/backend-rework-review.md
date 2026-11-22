# 백엔드 리워크 API 교체 TODO 검수 기록

## 결과

**2026-11-09 KST, Claude Opus 5.5 / high 최종 PASS. 남은 필수 문서 수정 없음.**

대상은 [API 교체 TODO](backend-rework-todo.md), [최신 api.md](../../api.md), README·설계 문서 목차·유저 플로우 안내의 연결 문구다. 실제 API 연동 구현이나 백엔드 동작에 대한 PASS가 아니다.

| 검수 | 결과 | 조치 |
|---|---|---|
| 1차 · 21:19~21:24 KST | `PASS_WITH_NOTES`, P1 1건 | 포트폴리오 제작 화면의 실제 서버 조회 파일을 점검 대상에 추가 |
| 수정 후 재검수 · 21:26~21:27 KST | `PASS`, 필수 수정 없음 | P1 해소와 권고 반영을 실제 파일에 대조해 확인 |

두 번 모두 로컬 Claude Code `2.1.312`에서 **`--model claude-opus-5-5 --effort high`**로 실행했다. 반환된 `modelUsage`의 실제 모델도 `claude-opus-5-5`였고 실행 종료 코드는 0, 결과는 `is_error: false`, 권한 거절은 없었다. Read/Glob/Grep만 허용한 읽기 전용 검수이며 파일 수정은 작업자가 수행했다.

## 지적사항과 반영

| 항목 | 확인 근거 | 반영 |
|---|---|---|
| **P1 · 포트폴리오 제작 서버 조회 누락** | `src/widgets/portfolio/ui/portfolio-create-page.tsx`가 cookie를 전달해 `getMyProjects`를 호출하며, `src/app/portfolios/new/page.tsx`는 widget을 렌더링만 함 | A-03·A-05·B-02·B-05에 실제 조회 파일 명시. `/portfolios/new` 만료 후 직접 진입·새로고침·cookie 없음 검증 추가 |
| 권고 · 200 응답 설명 차이 | login/logout/slug 조회의 200 description이 `OK`로 변경 | schema 변경과 구분해 1절에 기록 |
| 권고 · 숫자 slug 처리 | 기존 `/portfolios/{portfolioId}`와 `/portfolios/{slug}`의 URL 모양이 같고 Mock의 숫자 ID 검사가 slug GET보다 앞섬 | 숫자 slug 허용·method별 라우팅 확인과 Mock 오판 회귀를 기존 확인 사항에 추가. 새 URL/정책은 확정하지 않음 |
| 권고 · Mock DTO 불일치 | `getMockProjectsPage`가 `MockProject` 전체를 반환해 명세 밖 필드를 제공하고 `role`은 없음 | V-01에 `thumbnail/role` 및 API DTO·UI 보정 데이터 구분 명시 |

B-02~B-07의 체크박스도 개별 작업으로 나눴으며 모두 미완료 상태다. 재검수는 위 변경과 근거에 집중했고 저장소 전체 검사를 반복하지 않았다.

1차 검수 결과의 ‘필수 userId query 16곳’은 검수자의 집계 오류였다. 명세를 파싱하면 **15개 operation**이며 재검수에서도 15개로 정정했다. TODO 본문에는 잘못된 집계가 없었다. 1차 원문은 감사 근거로 보존하고 이 기록과 재검수 결과에 정정을 남긴다.

## 문서 검증

| 검사 | 결과 |
|---|---|
| 첨부와 `api.md`의 JSON 의미 동일성 | 일치. 값·계약 변경 없이 들여쓰기만 정리 |
| 전체 의미 차이 | 11개 JSON pointer 변경. refresh 추가·test-login 제거, login/logout/slug 응답 설명·오류 선언, 내 프로젝트 tags 삭제로 한정 |
| 경로·operation·schema 집계 | 전후 23 / 30 / 72로 동일 |
| 내부 `$ref` 해석 | 117개 모두 존재하는 대상을 참조 |
| 문서 링크·대상 파일 | 신규 문서의 상대 링크와 파일 경로 확인. 묶어 쓴 라우트 경로도 펼쳐 확인 |
| Markdown·변경 범위 | 표·체크박스·제목·공백 검사 및 `git diff --check` 통과. 제품 코드 변경 없음 |

JSON 검사는 구문·의미 동일성·내부 참조 확인이며, API의 실제 응답이나 모든 OpenAPI 제약을 검증한 것은 아니다. Claude의 1차 검수는 명세 주요 구간과 코드 대조를 수행했고 첨부 해시/JSON 동일성 재계산은 작업자의 검증 결과를 참조했다. 스토리 전체 assertion과 포트폴리오 API 전체 구현을 별도로 정밀 검수한 것은 아니다.

제품 코드를 수정하지 않아 타입·lint·build·Storybook·시각 비교는 실행하지 않았다. 실제 OAuth·JWT 쿠키·refresh·권한·메일·AI·파일 업로드 역시 미검증이다. 쿠키 속성, 만료 오류, 필수 userId, 태그 제공 범위 등의 계약 질문과 제품 구현은 TODO에 남아 있다.

## 로컬 원문 근거

원문과 실행 정보는 Git에서 제외되는 `build/api-rework-20261109/`에 보관한다. 저장소에는 이 검수 요약과 TODO를 남긴다.

- 구명세: `baseline-api.json` — 커밋 `ca4916a16e2f4ca4eab2baed9139a2a77585b58e`의 원문.
- 비교/검증: `spec-comparison.json`, `semantic-diff.json`, `document-validation.json`.
- 1차: `claude-review-prompt.txt`, `claude-review-run.json`, `claude-review.stdout.jsonl`, `claude-review.stderr.log`, `claude-review-result.json`, `claude-review-result.md`.
- 재검수: 위와 같은 구분의 `claude-rereview-*`, `claude-rereview.stdout.jsonl`, `claude-rereview.stderr.log`.
- 1차 stdout SHA-256: `2418e61dae5ba4466a0acfc6c3a7fae80098b0f3586bc982f9f805e6be7ad947`.
- 재검수 stdout SHA-256: `b272169d7b4365d242dfa17e3a63b6c9c031cee78ea959e911fd68f8f305b680`.
