# 로컬 작업의 main 통합 검증

2026-11-02, [이슈 #24](https://github.com/Tim3208/CampusPolio_FE/issues/24)와 [PR #25](https://github.com/Tim3208/CampusPolio_FE/pull/25)의 개발 확인 기록이다. 기존 Storybook 커밋 `c19cc41`·`ecd3726`과 미커밋 유저 플로우·학교 이메일 인증·포트폴리오 미리보기 개선을 최신 main `b06deea`와 통합했다. 과거 각 작업의 검증 기록은 당시 결과로 보존한다.

## 통합 범위

- Storybook 기반·기능/접근성 스토리·시각 기준·PR 검사 환경
- `/user-flows`의 정적 검토 목록과 독립형 공유 HTML
- 학교 인증의 진행·중복 요청 차단·사용자 조회 복구 및 접근성
- 포트폴리오 요약 미리보기의 모달·초점·스크롤 처리
- 편집기의 업로드 후 이미지 삽입과 오류 대화상자 수리

Next 16.4.3·sharp 0.35.5·shadcn 4.23.0과 Sentry 11.8.0을 유지했다. Sentry 초기화와 전역 오류 수집 파일은 main과 동일하다. Storybook의 현재 설치 안내만 최신 Next 버전으로 맞추고 과거 실행 버전은 변경하지 않았다.

## 개발 검증

Windows의 짧은 독립 체크아웃에서 Node **24.22.1 / npm 10.9.9**, lockfile의 Chromium을 사용했다. 개인 `.env`를 복사하지 않았으며 사용자 전역 설치를 바꾸지 않았다.

| 검사 | 결과 |
|---|---|
| `npm ci --prefer-offline --no-audit --no-fund` | 통과. 설치 종료 시 미사용 선택 의존성 디렉터리 정리 경고가 있었지만 exit 0이며 후속 전체 검사도 통과했다. |
| `tsc --noEmit --incremental false`·전체 ESLint | 통과 |
| `test:storybook` | 29개 파일·297/297 통과. 다른 slice에 남은 접근성 todo의 해결을 뜻하지 않는다. |
| `test:visual` | 10개 파일·12/12 통과. 픽셀 허용치 0·기준 자동 갱신 차단 유지 |
| `build-storybook` | 정적 빌드 통과 |
| 기본 `next build` | Next 16.4.3 Turbopack 통과. `/user-flows` 정적 생성 확인. API/Google ID 빈 값·Mock=true·auth=unverified·DSN 미설정 |
| 독립 HTML 재생성 | 두 번 생성한 SHA-256 동일. 현재 크기·해시는 [공유 안내](user-flow-standalone.md)에 기록 |
| 오프라인 실제 화면 | 360·1440px에서 검색·필터·조건 왕복·초점·주소 복원·키보드 조작 통과. 실행 오류·외부 요청·가로 넘침 없음 |

원격 첫 실행의 workflow 문법 오류는 job-level env에서 사용할 수 없는 `runner.temp` 표현식 때문이었다. 브라우저 경로를 실행 단계에서 `RUNNER_TEMP`로 계산해 `GITHUB_ENV`에 기록하도록 수정했다. 다음 실행에서 새 설치·타입·린트·297개 기능 테스트가 통과했고, 시각 비교 5개만 실패했다.

시각 차이 5개는 모두 SVG fixture의 PC 기본 글꼴 문구에 한정됐으며 그 밖의 제품 픽셀은 동일했다. 저장소의 Pretendard 1.3.9 Regular로 글자를 윤곽선으로 고정하고 기존 title·도형·라이선스를 보존했다. 영향받은 PNG 5개를 각각 검토·갱신한 뒤 일반 비교 12/12를 다시 확인했다. 상세는 [시각 검증 안내](../../tests/visual/README.md)를 따른다. 최종 원격 검사와 병합 상태는 PR의 최신 체크·커밋을 기준으로 확인한다.

로컬 검사 로그와 화면은 검증 체크아웃의 Git 제외 `build/`에 보관했다. 실제 backend/OAuth·메일·AI·서버 권한·영속 저장과 운영 Sentry 대시보드의 신규 수신은 이번 Mock/화면 검사에서 검증하지 않았다.

## 보안 경고

| 2026-11-02 npm audit | 배포 의존성 | 전체 의존성 |
|---|---|---|
| 현재 main | 중간 5 | 낮음 2·중간 23·높음 0 |
| 통합 후보 | 중간 5 | 낮음 2·중간 26·높음 0 |

과거 lock을 단순 병합할 때 발생했던 Babel·react-router 등의 버전 회귀를 제거하고 main 기반으로 재해석했다. 남은 경고와 Storybook의 추가 3건은 Sentry/개발 도구의 glob·minimatch 경로다. 10월 28일 검사 이후 공개된 경고와 당시 결과를 구분하며, 강제 메이저 다운그레이드나 보안 예외를 적용하지 않았다. [기존 이슈 #22의 재점검 기록](https://github.com/Tim3208/CampusPolio_FE/issues/22#issuecomment-6578149803)에서 계속 추적한다.
