# 실제 Storybook 시각 회귀

Node 24.22.1 / npm 10.9.9와 lockfile 설치를 사용한다. 일반 기능 검사는 기존 `npm run test:storybook` 전체 프로젝트에 그대로 남아 있다. 이 폴더의 10개 wrapper 파일은 기존 제품 story·fixture·play와 전체 preview(Next mock, MSW, CSS, a11y)를 재사용하며 정확히 12개 화면만 별도 검사한다.

```sh
npm run test:visual
npm run test:visual:update
```

첫 명령은 종료형 비교이며 `--update=none`과 CI 모드로 **기준이 없거나 다르면 실패**한다. 두 번째 명령만 기준을 생성·갱신한다. 갱신 뒤에는 PNG를 직접 검토하고 첫 명령을 다시 실행한다. 일반 비교에 `--update=false`를 사용하지 않는다. Vitest 4.1.12는 update 옵션의 문자열을 해석하므로 명시적 `none`이 필요하다. `test:visual`에 갱신 옵션을 추가하면 runner가 거부한다.

기본 loopback 포트는 6221이다. 다른 작업과 겹치지 않을 때 검증된 정수 `STORYBOOK_TEST_PORT`로 변경할 수 있다. 공개 API/Google 설정은 기존 allowlist 경계를 유지한다. 실제 backend·OAuth·AI 호출 성공을 검사하지 않는다.

## 환경과 캡처

[manifest.json](manifest.json)에 정확한 story ID, viewport, 캡처 범위, 플랫폼·Chromium revision·locale·timezone·날짜·배율과 비교 설정이 있다. 기준은 `baselines/win32`, 실제 캡처/폰트 관찰은 `build/visual/current`, 차이는 `build/visual/diffs/win32`, 일반 실패 스크린샷은 `build/visual/failures`이다. build는 기존 Git 제외 대상이며 baseline PNG는 그 밖의 추적 대상이다.

body 전체와 portal을 함께 캡처한다. 긴 내용의 iframe 아래 영역이 흰색으로 잘리는 문제를 막기 위해 각 고정 높이 안에 전체 문서가 들어오는지도 검사한다. 내용이 더 길어지면 실패를 확인하고 의도된 변경인지 검토한 뒤 manifest와 viewport를 함께 조정한다. 가로 overflow나 제품 레이아웃을 숨기는 스타일은 없다. 모션·caret만 시각 검사에서 고정한다.

바깥 Playwright 페이지도 1600×2000으로 고정한다. Vitest 4.1.12는 작은 바깥 페이지에 iframe을 CSS transform으로 축소하므로 deviceScaleFactor=1만으로 PNG가 1:1이라고 보장되지 않는다. 실제 iframe data-scale=1을 매 상태에서 검사하고 PNG 픽셀 크기는 각 상태의 CSS viewport와 일치한다.

픽셀 비교는 threshold 0, 허용 불일치 0, includeAA true다. 실제 스타일 변경은 diff와 nonzero로 드러나야 한다. 기준 갱신으로 실패를 지우지 않는다. 다른 OS/Chromium은 별도 환경 변경으로 검토하고 해당 platform의 기준을 명시적으로 생성한 뒤 manifest와 생성 환경을 함께 기록한다. win32 PNG를 다른 플랫폼의 기준으로 복사하지 않는다.

날짜만 고정하고 실제 timer는 유지한다. screenshot assertion에는 실제 body의 Locator를 전달한다. 설치된 Vitest 4.1.12의 `expect.element(HTMLElement)` 경로는 screenshot 단일 assertion 설정을 건너뛰므로, 실패 대조가 반복되다 일반 테스트 timeout으로 끝나는 문제를 실제로 확인했다. Locator 경로에서는 원래 픽셀 차이와 actual/diff를 보고하고 종료한다.

## 폰트와 알려진 범위

[fonts.json](fonts.json)은 앱 CDN과 고정 v1.3.9의 바이트가 같은 9개 Pretendard WOFF2의 URL·SHA256 및 라이선스를 기록한다. 앱 globals.css는 수정하지 않는다. 시각 프로젝트에서만 CDN import를 제거하고 로컬 @font-face를 로드한다. document.fonts.ready/각 weight loaded에 더해 실제 제품 텍스트의 computed family·weight와 Chromium CDP의 custom font/postScriptName/glyphCount를 확인한다.

별도 font-specimen PNG는 100~900 weight의 한국어·영문·숫자·문장부호 렌더 증거이며 제품 baseline 12개에 포함되지 않는다. 제품 캡처와 폰트 specimen을 혼동하지 않는다.

Markdown 긴 내용, 열린 DropdownMenu, 열린 모바일 계정 메뉴, 프로필 오류의 기존 접근성 제한은 개별 todo로 유지한다. 시각 비교 12개 통과는 이 4개의 접근성 통과가 아니다. 나머지 8개는 기존 error 검사다. 기존 폼 이미지 삽입, 포트폴리오 축소 폭/미리보기, API query 계약 및 실제 서버 검증 한계도 그대로 남는다.

공식 자료와 설치 소스를 함께 확인했다: [Vitest 4 screenshot 설정](https://v4.vitest.dev/config/browser/expect), [Storybook 10.6 Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon), [Pretendard 공식 저장소](https://github.com/orioncactus/pretendard), [Chromium font usage](https://chromedevtools.github.io/devtools-protocol/tot/CSS/#method-getPlatformFontsForNode). 개발 결과의 원문·실패·PNG·해시와 별도 검수/QA 상태는 해당 AgentFlow run 증거를 따른다.

