# Storybook 사용 안내

2026-10-27 DEV-14 수리의 개발 확인과 실제 Claude 개발 승인을 반영한 현재 사용 안내다. **28개 파일·273개 기능 스토리**, 별도 **10개 wrapper 파일·12개 시각 비교**, 접근성 **error 180 / todo 93** 집계는 유지된다. 입력 echo·폼 이미지·선택 제목의 수리와 실패 이력은 [QA 수리 1차 검증 기록](storybook-qa-recovery-01-verification.md)을 따른다. 전체 독립 QA 21개·DEV-15 문서 검수·Wiki·finish·문서 동기화·원본 전달은 이 문서 작성 시점의 후속 단계다. 과거 [DEV-13 확장 개발 확인](storybook-extension-verification.md), [확장 계획](storybook-adoption-plan.md), 아래 2026-10-24 도입 기록은 당시 사실로 보존한다.

## 현재 설치와 실행

[.nvmrc](../../.nvmrc)의 **Node 24.22.1**, [package.json](../../package.json)의 **npm 10.9.9**를 사용한다. 기존 Next 16.2.6, React 19.2.4, Storybook/Next Vite/Vitest·Docs·a11y addon 10.6.3, Vite 8.3.5, Vitest 4.1.12, Playwright 1.64.1, MSW 2.15.0과 addon 3.0.3은 lockfile 기준이다. 실행별 런타임을 사용할 수 있으며 사용자 전역 설치를 바꿀 필요는 없다.

```sh
node --version
npm --version
npm ci
npm exec -- playwright install chromium
npm run storybook
```

개발 서버는 `http://localhost:6006`이며 계속 실행된다. Chromium은 Playwright 관리 버전으로 준비한다. 종료형 검사는 별도 터미널에서 실행한다. 검사 포트를 직접 지정할 때는 이미 실행 중인 서버와 겹치지 않게 한다.

```sh
npm exec -- tsc --noEmit --incremental false
npm run lint
npm run test:storybook
npm run test:visual
npm run build-storybook
npm run build
```

일반 `test` 스크립트는 없다. `test:storybook`은 전체 기능 프로젝트, `test:visual`은 별도 시각 프로젝트다. 기능 검사 기본 포트는 **6211**, 개발 서버는 **6006**, 시각 기본 포트는 **6221**이다. 검사 포트를 바꾸는 PowerShell 예제는 `$env:STORYBOOK_TEST_PORT='6223'; npm run test:storybook`이다. 1024~65535의 정수만 전달되며 개발 서버 포트 설정과는 별개다. 종료 후 `Remove-Item Env:STORYBOOK_TEST_PORT`로 해당 셸의 값을 지운다.

정적 산출물 `build/storybook`은 HTTP로 제공한다. 다음은 별도 HTTP 서버 도구를 해당 실행에만 준비하는 예제다. DEV-13 실제 확인에서는 같은 폴더를 읽는 전용 로컬 Node HTTP 서버를 사용했다.

```sh
npx --yes http-server@14.1.1 build/storybook -a 127.0.0.1 -p 6007 -c-1
```

`http://127.0.0.1:6007`에서 확인한다. `file://`는 MSW worker와 자산 검증 방법이 아니다. 기본 앱 빌드는 계속 `next build`다. 긴 Windows 중앙 경로에서 Turbopack 경로 길이 오류가 재현되었으며, 별도 `npm run build -- --webpack`과 허용된 짧은 실제 복사본의 자체 `npm ci --prefer-offline` 후 변경 없는 기본 빌드는 통과했다. 대체 결과로 긴 경로 기본 빌드 실패를 지우지 않는다.

## 자유 조작과 고정 자동 검사

Controls는 **현재 미리보기의 args**를 바꾼다. 제품 컴포넌트의 기본값이나 저장소 파일을 저장하지 않는다. 제품 기본값 변경은 실제 소스 변경·검증, 스토리 기본값 변경은 해당 `args` 변경이 필요하다. Playground는 수동 사용을 위한 상태이며, 고정 스토리의 `play`는 진입하면서 입력·클릭·요청을 자동 실행할 수 있다. 예를 들어 리뷰 `Success`는 자동 요청 후 결과를 보여주지만 `Playground`는 사용자가 `리뷰 요청`을 눌러야 요청한다.

| 현재 예제 | 실제로 해볼 조작과 결과 |
|---|---|
| `Shared/Button/Playground` | label을 `저장하기`, variant를 `outline`, size를 `lg`로 바꾸면 해당 모습으로 바뀐다. disabled를 켜면 클릭할 수 없다. showIcon으로 아이콘을 전환하고 버튼 클릭 횟수를 확인한다. `시나리오 초기화`는 Controls 기본값과 횟수를 복원한다. |
| `Shared/Input/Playground` | Controls value를 `QA 시작`으로 바꾸고 입력 끝에 ` ABC123가나다XYZ`를 연속 입력한다. 늦은 manager 반영이 최신 입력을 덮지 않으며 양쪽 값이 `QA 시작 ABC123가나다XYZ`로 일치한다. DEV-14는 개발/정적 manager 각 3개 새 페이지에서 80ms/키 입력 후 1.5초 대기하여 같은 DOM·focus를 확인했다. 외부 Controls 변경과 `시나리오 초기화`, 재방문도 확인했다. invalid/errorMessage로 오류 설명을 확인한다. |
| 두 `ProjectCard/Playground` | 제목·작성자·조회 수·태그·정상/누락/실패 이미지를 바꾼다. 홈 카드와 탐색 카드의 도메인 타입을 합치지 않는다. |
| `Shared/MarkdownViewer/Playground` | Markdown 원문과 부모 폭을 바꾼다. 긴 표·코드는 내부 스크롤과 문서 전체 넘침을 따로 본다. 부모의 overflow를 숨겨 문제를 가리지 않는다. |
| `Features/ProjectEditor/ErrorDialog/Playground` | `오류 안내 열기` → Escape → description을 `새 본문`으로 변경 → 같은 action으로 다시 연다. 본문 편집마다 remount하지 않는다. `시나리오 초기화`로 원래 문구·열림 상태·콜백 기록을 복원한다. |
| `ProjectTagFilterSheet/Playground` | tags·keyword·view를 바꾸고 필터를 열어 선택 후 취소한다. 취소는 URL을 바꾸지 않으며 적용은 router push 한 번이다. 초기 props 변경·명시적 초기화만 재설정 기준이다. |
| `ProjectReviewPanel/Playground` | scenario `pending` → `리뷰 요청` → `응답 완료`, 또는 `retry` → 요청의 503 오류 → `재시도`의 200 결과를 확인한다. 요청은 body 없는 `POST /api/projects/4205/review`이며 실제 AI 호출이 아니다. 초기화·다른 시나리오·재방문은 이전 요청을 정리한다. |

모달·Sheet·메뉴는 iframe의 `document.body` portal까지 확인한다. 닫기/Escape/외부 클릭/재열기 및 trigger focus 복귀는 해당 컴포넌트가 지원하는 실제 동작을 검증한다. 독립 오류 Dialog의 focus 복귀 성공은 disabled 저장 버튼에서 열린 제품 폼의 focus 복귀 보장을 뜻하지 않는다.

## Docs와 폭 설정

각 meta의 Autodocs에서 목적, props/argTypes, 대표 상태와 제한을 읽는다. `Shared/Button/Docs`의 variant·size 옵션 표와 예제는 현재 meta에서 생성된다. 문구를 자유롭게 바꾸며 사용하는 기본 진입점은 Playground Canvas다. Docs의 iframe 분리는 상태 경계를 만들지만 브라우저 focus 경쟁을 자동으로 해결하지는 않는다.

편집기/RichMarkdownEditor, PortfolioBuilder, 이메일/Google의 최종 DEV-08/09/10 스토리는 **실제 부모가 Docs일 때** 고정 play를 생략해 수동 초기 예제로 보여준다. Canvas와 Vitest의 자동 play는 유지된다. 다른 모든 Docs도 자동 조작이 없다고 일반화하지 않는다. 재방문·refresh와 서로 다른 예제에서 입력/요청/타이머가 독립인지 확인한다.

toolbar에는 **360 / 375 / 768 / 1024 / 1280 / 1440 CSS px** 프리셋이 있다. 이것을 제공한다는 사실과 자동 검사가 여섯 폭을 전부 실행했다는 사실은 다르다. 기능 play는 자기 viewport 설정, 시각 테스트는 아래 manifest의 각 폭·높이를 사용한다. 컴포넌트 부모 폭도 화면 폭과 별도다.

## 새 스토리 작성 예제

대상 옆 `*.stories.tsx`를 만들고 실제 제품 컴포넌트를 재사용한다. 가상 도메인 fixture는 같은 slice 옆 `*.story-fixtures.ts`에서 공개 타입에 `satisfies`하도록 작성한다. 다른 slice는 public API, 같은 slice는 상대 import를 쓴다. 제품 props를 테스트 편의로 추가하지 않는다.

다음은 **아직 추가하지 않은** `src/shared/ui/button-example.stories.tsx` 예제다. `Playground`는 수동 클릭, `ClickOnce`만 자동 클릭한다. 273개 현재 집계에는 포함하지 않는다.

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Shared/ButtonExample",
  component: Button,
  tags: ["autodocs"],
  args: { children: "예제 저장", variant: "outline", onClick: fn() },
  argTypes: { children: { control: "text" } },
  parameters: {
    docs: { description: { component: "실제 Button의 수동 클릭과 고정 콜백 검사 예제입니다." } },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const ClickOnce: Story = {
  /** 실제 버튼의 한 번 클릭이 콜백 한 번으로 이어지는지 검사한다. */
  async play({ canvasElement, args }) {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "예제 저장" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
```

입력은 `useArgs` 동기화 또는 안정된 local controlled 상태를 사용한다. 내용 변경마다 `key`를 바꾸지 않으며 초기화/시나리오 전환에만 새 인스턴스를 만든다. `beforeEach`에서 spy·handler·스크롤·pending promise·timer를 초기화하고 반환 cleanup에서 정리한다. 전역 `window.prompt`와 SDK double도 복원한다. RTE는 실제 Chromium의 contenteditable/selection/execCommand를 검사하며 execCommand를 mock하지 않는다.

새 예제를 작성했다면 타입·린트 및 `npm run test:storybook -- src/shared/ui/button-example.stories.tsx`로 조사할 수 있다. 통합 확인에서는 필터 없는 전체 테스트와 정적 빌드·실제 화면 확인을 수행한다. MSW의 Method/URL/query/body와 응답은 [api.md](../../api.md), 현재 client와 실제 fixture를 대조한다. 누락 handler는 최종 차단되며 afterEach에서 테스트 실패가 되어야 한다.

## 환경 격리와 실제 앱 경계

Storybook runner는 환경 allowlist, `envDir:false`, 명시 define과 전용 Next 설정으로 개인 환경 파일과 API/OAuth 설정을 분리한다. 기본 공개 값은 API·Google ID가 빈 값, Mock=false, auth=unverified다. Google 지정 시나리오만 명백한 가상 ID·로컬 SDK double을 사용한다. 실제 SDK/OAuth/메일/AI 호출 성공은 검증 대상이 아니다.

Storybook 라우터 spy의 URL·refresh 호출은 실제 Next 전환·SSR 재조회·document reload가 아니다. 별도 내부 Mock 앱은 `NEXT_PUBLIC_USE_MOCK_API=true`, API·Google ID 빈 값으로 로컬 Next 서버를 실행하여 홈→목록→상세, URL/뒤로·앞으로/새로고침과 오류 다시시도를 확인한다. 내부 Mock 역시 실제 로그인·백엔드 권한·영속 저장을 증명하지 않는다.

현재 계약 차이와 미완료 상태:

- 정렬: OpenAPI 설명의 `POPULAR`와 실제 enum/client `VIEW_COUNT`가 다르다. `/projects?keyword=campus&filterType=VIEW_COUNT&view=list`는 현재 UI URL 예제이며 API 계약을 `POPULAR`로 바꾸지 않는다. 조건 변경은 page 0, 페이지 이동은 조건 유지, 전체 초기화는 view 유지다.
- 프로필·포트폴리오: 명세의 필수 `userId` query와 세션을 전제로 생략하는 현재 client가 다르다. 프로필 grade의 `null`과 명세 integer도 차이다. 프로필 POST 성공→추가 PATCH 실패 후 재시도는 POST부터 반복된다. Mock 성공은 서버 수용·rollback·중복 안전의 근거가 아니다.
- RTE: 링크는 `window.prompt` URL 입력/취소, 이미지는 별도 버튼 callback과 controlled `ref.insertImage` 경로다. 현재 제품 폼은 업로드 응답 후 실제 DOM이 편집 가능해진 뒤 이미지를 삽입한다. 성공/지연 완료 후 본문 img의 alt/src와 같은 이미지 Markdown이 저장 `PATCH.content`에 남는다. 업로드 중 편집·도구·파일·저장 disabled, 완료 후 focus/selection·후속 편집, 오류 후 재시도와 reset을 확인했다. 같은 URL 이미지를 문단 중간에 추가해도 기존 이미지의 노드·alt를 보존한다. 아래 legacy 스토리 안내와 [실제 PNG부터 저장 요청까지의 근거](storybook-qa-recovery-01-verification.md#폼-이미지와-동일-url-회귀)를 참고한다.
- 편집 폼 오류 Dialog: 비활성 저장 버튼 뒤 열림/닫힘에서 BODY focus 잔류가 있다. 독립 Dialog trigger 복귀와 구분한다. 파일은 PDF/MD/JPG/JPEG/PNG, 50×1024×1024 bytes 경계, multipart `file` 등 현재 계약을 사용한다. 새 rollback·발행/중복 보장을 만들지 않는다.
- PortfolioBuilder: 파일 선택은 로컬 object URL 미리보기이며 서버 업로드가 아니다. 저장 thumbnail은 첫 유효 프로젝트 썸네일이다. 교체·해제·unmount에서 URL revoke를 확인한다. create→조건부 정보 PATCH→projects add/remove→order→visibility false 및 slug 이동을 로컬 요청으로 확인한다. 미리보기에는 dialog role/focus trap/Escape/외부 클릭/trigger 복귀 보장이 없고 닫기 버튼은 동작한다. 현재 선택 목록의 컨테이너가 400px 미만이면 위/아래/해제 버튼을 둘째 행에 배치한다. 360/375 CSS px 화면에서 제목 칸 104/119px·14px 글자와 세 버튼이 유지됐고, 일반 제목 두 개를 읽을 수 있었다. 긴 제목은 앞부분과 말줄임으로 식별하며 전체 문서 넘침은 없었다. 순서 변경·해제·미리보기 동작과 원래 넓은 배치는 유지한다.
- 헤더: 설치된 Next Link mock의 preventDefault→onClick 순서가 Radix 메뉴 선택 후 닫힘을 막을 수 있다. 실제 앱 링크 이동·닫힘과 별도로 확인한다. 열린 메뉴의 `aria-hidden-focus`/`region` 관찰은 닫힌 상태 addon 통과와 다르다.
- 이메일: 6자리 코드, 180초를 `03:00 → 00:01 → 00:00`으로 표시하고 0초 후 검증 차단·재전송 활성화, 재전송 후 코드/03:00 reset을 검증한다. 가상 Google token/ID와 MSW 성공은 실제 credential·메일 발송·OAuth 성공이 아니다.

## QA 수리 후 사용과 DEV-13 관찰 구분

`Features/Project/ProjectEditorForm/Playground`에서 mode `create` 또는 `edit`, scenario `success` 또는 `upload-pending`을 선택한다. 본문에 커서를 놓고 `이미지 삽입`으로 유효한 PNG를 선택한다. 지연 시나리오에서는 `지연 응답 완료`를 누른 뒤 본문의 실제 이미지와 후속 입력을 확인하고 임시 저장 또는 수정 저장의 로컬 MSW 요청 기록에서 같은 Markdown을 확인한다. 실제 서버 업로드·영속 저장의 성공 증거는 아니다.

`InlineImageKnownLimitation`과 `UploadPendingKnownLimitation`은 수리 전 관찰에서 유래한 이름과 story ID를 유지한다. 현재 Canvas/play는 이미지 부재를 기대하지 않으며 실제 삽입 DOM·이미지 크기·저장 Markdown을 검증한다. 지연 스토리는 업로드 중 disabled와 완료 후 selection·후속 편집도 확인한다. ID는 `features-project-projecteditorform--inline-image-known-limitation`, `features-project-projecteditorform--upload-pending-known-limitation`이다. Docs에서는 기존처럼 고정 play를 생략한다. JPG/JPEG는 기존 확장자 경로, 실제 PNG는 190 bytes·96×64 이미지로 검증했으며 접근성 todo 원인은 별도다.

다음은 **2026-10-27 DEV-13 작성 당시 원문**이다. 당시 Input 관찰은 120ms 입력과 짧은 안정 확인이었고, 뒤의 QA attempt-01에서 80ms 입력 6회 중 5회 문자 누락이 확인됐다. 폼 이미지와 360px 제목 관찰도 수리 전 사실이다. 현재 수리 결과로 과거부터 성공했다고 해석하지 않는다.

<details>
<summary>DEV-13 당시 범위·Input 안내·이미지·선택 제목 관찰 원문</summary>

2026-10-27 DEV-13 개발 확인 기준이다. **28개 파일·273개 기능 스토리**, 별도 **10개 wrapper 파일·12개 시각 비교**가 있다. 기능 테스트 성공은 접근성 미완료 상태의 해결이나 실제 서버 성공을 뜻하지 않는다. 정확한 범위·실행 시각·제한은 [확장 개발 확인 기록](storybook-extension-verification.md), 원래 제안은 [확장 계획](storybook-adoption-plan.md), 시각 실행 계약은 [시각 테스트 안내](../../tests/visual/README.md)를 따른다. 이 문서 아래의 2026-10-24 도입 기록은 당시 사실로 보존한다.

| 당시 예제 | 당시 사용 안내 |
|---|---|
| `Shared/Input/Playground` | value를 `캠퍼스 기록`으로 바꾸고 입력 칸 끝에 ` ABC`를 연속 입력한다. Controls와 값이 동기화되고 입력 중 focus가 유지된다. invalid/errorMessage로 오류 설명을 확인하고 초기화한다. |

- RTE: 링크는 `window.prompt` URL 입력/취소, 이미지는 별도 버튼 callback과 controlled `ref.insertImage` 경로다. 독립 RTE는 실제 DOM 이미지와 onChange Markdown을 확인한다. 제품 편집 폼은 업로드 성공 응답/문구 후에도 업로드 중 `contentEditable=false`인 삽입 시점 때문에 DOM img=0·저장 Markdown 이미지 누락이 관찰됐다. `InlineImageKnownLimitation`/`UploadPendingKnownLimitation` 테스트 성공은 이미지 삽입 성공이 아니다.
- PortfolioBuilder: 파일 선택은 로컬 object URL 미리보기이며 서버 업로드가 아니다. 저장 thumbnail은 첫 유효 프로젝트 썸네일이다. 교체·해제·unmount에서 URL revoke를 확인한다. create→조건부 정보 PATCH→projects add/remove→order→visibility false 및 slug 이동을 로컬 요청으로 확인한다. 미리보기에는 dialog role/focus trap/Escape/외부 클릭/trigger 복귀 보장이 없고 닫기 버튼은 동작한다. 360px 선택 카드 제목 칸이 사실상 0폭인 현상은 문서 전체 overflow=0과 별도의 가독성 한계다.

</details>

## 접근성 집계 읽기

공통 `a11y.test='error'`를 유지한다. 실제 loadStory metadata와 전역 beforeEach 5개, 편집 폼 beforeEach 21개 ID 매핑을 합친 실행 설정은 **지원 error 180개 / 개별 todo 93개**다. 273개 기능 테스트의 pass와 todo의 접근성 미완료를 분리한다. 수동 조작 후 열린 메뉴/성공 코드 영역은 초기 상태의 검사 범위 밖일 수 있다. 시각 12개 중 error 8/todo 4는 별도 집계다. 정확한 ID별 todo 원인과 실행 설정은 [개발 확인 기록](storybook-extension-verification.md#개별-접근성-todo)에 있다.

## 시각 기준 비교와 갱신

[manifest.json](../../tests/visual/manifest.json)에 정확한 12개 story ID·source·export·CSS viewport·baseline이 있다. [fonts.json](../../tests/visual/fonts.json)은 Pretendard 공식 v1.3.9/앱 CDN과 같은 바이트의 WOFF2 9굵기 SHA256과 OFL 출처를 보존한다. 앱 CSS를 변경하지 않고 시각 프로젝트에서만 로컬 폰트를 사용한다. font-specimen은 별도 폰트 증거로 12개 baseline 수에 포함하지 않는다.

기준 환경은 win32/x64, 관찰 OS 10.0.26200, Chromium revision1248 / 156.0.8078.4, DSF1, outer1600×2000/iframeScale1, locale ko-KR, Asia/Seoul, fixture `2026-10-26T12:00:00+09:00`이다. 실제 timer는 유지하고 motion/caret만 고정한다. threshold0·허용 불일치0·includeAA=true다. 실제 body Locator로 portal 포함 전체를 캡처하며 PNG 픽셀 크기는 각 CSS viewport와 1:1이다.

| 파일 위치 | 역할 |
|---|---|
| `tests/visual/baselines/win32` | 추적 기준 PNG 12개 |
| `build/visual/current` | 실제 PNG·폰트 렌더/로드 관찰 |
| `build/visual/diffs/win32` | actual/reference/diff 등 차이 증거 |
| `build/visual/failures` | 일반 테스트 실패 화면 |

1. 기존 기준 비교는 `npm run test:visual`이다. runner가 `--update=none`과 `CI=true`를 강제하여 기준 누락/차이는 실패한다. `--update=false`는 이 버전의 올바른 옵션이 아니다.
2. 처음 기준이 필요한 새 상태 또는 의도된 UI 변경은 원인·변경 source·manifest·폰트/환경을 검토한다. 실제/diff와 원래 기준을 보존한다. 실패를 없애기 위한 자동 갱신은 하지 않는다.
3. 승인된 의도적 변경에만 `npm run test:visual:update`로 생성/갱신한다. 생성 PNG의 한글·영문·숫자·문장부호, portal, 긴 표/코드·하단 내용과 크기를 직접 검토한다.
4. `npm run test:visual`을 다시 실행하여 비교가 통과하고 일반 비교 중 기준 hash가 바뀌지 않는지 확인한다. source/환경/PNG/검사 로그를 함께 제출한다.
5. 다른 OS/Chromium은 환경 변경으로 검토하고 해당 platform 기준을 명시적으로 새로 생성한다. manifest와 생성 환경을 갱신하며 win32 PNG를 다른 플랫폼 폴더에 복사해 통과시키지 않는다. Windows CI 이미지도 로컬 세부 build와 동일하다고 단정하지 않는다.

## PR workflow와 상태

[.github/workflows/storybook.yml](../../.github/workflows/storybook.yml)은 pull_request에 windows-2025, contents:read, concurrency 취소, 30분 제한을 사용한다. actions SHA가 고정돼 있으며 checkout의 credential persistence를 끈다. `.nvmrc` Node와 실행별 npm10.9.9 → clean ci → Chromium → 타입 → 린트 → 전체273 기능 → 12시각 비교 → 정적 Storybook → 기본 Next build 순서다. 일반 비교만 실행하고 기준을 자동 생성하지 않는다. `if: always()`로 `build/` 로그·실패 화면·시각 diff·정적 결과를 보존한다.

**아래 문단은 DEV-13 작성 시점의 gate 기록이다.** 현재 DEV-14는 실제 Claude 개발 PASS를 받았으며, DEV-15 문서와 후속 전체 독립 QA 21개·Wiki·finish·동기화·전달의 결과는 별도다.

워크플로 작성·로컬 검증과 **원격 CI 실제 실행은 다르다**. DEV-13 작성 시점 원격 실행은 하지 않았다. clean 설치 audit21(1 low/5 moderate/13 high/2 critical), 긴 경로 기본 빌드 실패, 접근성 todo, 제품 동작 한계는 남는다. DEV01~12 실제 Claude 승인과 DEV13 개발자 확인, 후속 DEV13 Claude 검수·전체 독립 QA·Wiki 검수/게시·finish·문서 동기화·원본 전달은 각각 별도 gate다. 이후 상태는 해당 run의 실제 증거와 Wiki를 확인한다.

## 현재 스토리 범위

아래는 개발 시점 실제 Storybook index와 현재 source의 집계다. 각 행은 한 `*.stories.tsx` 파일이다. 수치는 상태 수이며 품질 점수가 아니다.

| 대상 / source | 전체 | error 설정 | todo 설정 |
|---|---:|---:|---:|
| [Features/Auth/GoogleSignInButton](../../src/features/auth/google-sign-in/ui/google-sign-in-button.stories.tsx) | 12 | 6 | 6 |
| [Features/Portfolio/PortfolioBuilder](../../src/features/portfolio/portfolio-builder/ui/portfolio-builder.stories.tsx) | 18 | 0 | 18 |
| [Features/Profile/ProfileSettingsForm](../../src/features/profile/profile-settings/ui/profile-settings-form.stories.tsx) | 28 | 20 | 8 |
| [Features/ProjectEditor/ErrorDialog](../../src/features/project/project-editor/ui/project-editor-error-dialog.stories.tsx) | 14 | 14 | 0 |
| [Features/Project/ProjectEditorForm](../../src/features/project/project-editor/ui/project-editor-form.stories.tsx) | 23 | 2 | 21 |
| [Features/Project/RichMarkdownEditor](../../src/features/project/project-editor/ui/rich-markdown-editor.stories.tsx) | 10 | 10 | 0 |
| [Features/Project/ProjectReviewPanel](../../src/features/project/project-review/ui/project-review-panel.stories.tsx) | 8 | 6 | 2 |
| [Features/Project/ProjectTagFilterSheet](../../src/features/project/project-search-filter/ui/project-tag-filter-sheet.stories.tsx) | 12 | 12 | 0 |
| [Shared/Button](../../src/shared/ui/button.stories.tsx) | 8 | 7 | 1 |
| [Shared/DropdownMenu](../../src/shared/ui/dropdown-menu.stories.tsx) | 4 | 2 | 2 |
| [Shared/Input](../../src/shared/ui/input.stories.tsx) | 6 | 6 | 0 |
| [Shared/MarkdownViewer](../../src/shared/ui/markdown-viewer.stories.tsx) | 6 | 4 | 2 |
| [Shared/Sheet](../../src/shared/ui/sheet.stories.tsx) | 7 | 7 | 0 |
| [Widgets/Header/AppHeader](../../src/widgets/header/ui/app-header.stories.tsx) | 9 | 9 | 0 |
| [Widgets/Home/HomePageSkeleton](../../src/widgets/home/ui/home-page-skeleton.stories.tsx) | 1 | 1 | 0 |
| [Widgets/Home/HomePage](../../src/widgets/home/ui/home-page.stories.tsx) | 3 | 3 | 0 |
| [Widgets/Home/ProjectCard](../../src/widgets/home/ui/project-card.stories.tsx) | 7 | 7 | 0 |
| [Widgets/Mypage/MypageNav](../../src/widgets/mypage/ui/mypage-nav.stories.tsx) | 8 | 8 | 0 |
| [Widgets/Mypage/MypagePortfoliosPage](../../src/widgets/mypage/ui/mypage-portfolios-page.stories.tsx) | 8 | 2 | 6 |
| [Widgets/Mypage/MypageProjectsPage](../../src/widgets/mypage/ui/mypage-projects-page.stories.tsx) | 10 | 2 | 8 |
| [Widgets/Mypage/MypageShell](../../src/widgets/mypage/ui/mypage-shell.stories.tsx) | 4 | 2 | 2 |
| [Widgets/ProjectCollection/ProjectCard](../../src/widgets/project-collection/ui/project-card.stories.tsx) | 9 | 9 | 0 |
| [Widgets/ProjectCollection/ProjectCollectionPage](../../src/widgets/project-collection/ui/project-collection-page.stories.tsx) | 17 | 17 | 0 |
| [Widgets/ProjectCollection/ProjectCollectionSkeleton](../../src/widgets/project-collection/ui/project-collection-skeleton.stories.tsx) | 1 | 1 | 0 |
| [Widgets/ProjectCollection/ProjectListItem](../../src/widgets/project-collection/ui/project-list-item.stories.tsx) | 8 | 8 | 0 |
| [Widgets/Project/ProjectDetailPage](../../src/widgets/project/ui/project-detail-page.stories.tsx) | 15 | 14 | 1 |
| [Widgets/Project/ProjectDetailSkeleton](../../src/widgets/project/ui/project-detail-skeleton.stories.tsx) | 1 | 1 | 0 |
| [Widgets/VerifyEmail/VerifyEmailPage](../../src/widgets/verify-email/ui/verify-email-page.stories.tsx) | 16 | 0 | 16 |

## 2026-10-24 도입 이력 보존

아래 문서의 Node25·9파일57개·CI 미포함 및 DEV-06 결과는 **당시 도입 단계 기록**이다. 현재 명령·범위는 이 문서 위쪽을 따른다. 과거 UIUX/Storybook QA, SKIPPED_QUOTA, WAITING_QUOTA, 두 BLOCKED 실행을 이번 개발 승인으로 소급 변경하지 않는다.


<details>
<summary>당시 Storybook 도입 원문 펼치기</summary>

# Storybook 사용 안내

## 목적과 범위

공통 UI와 주요 기능의 상태를 실제 제품 컴포넌트로 독립 재현한다. Next.js 앱의 기존 FSD, 확정 디자인과 API 계약을 유지하며 제품 props를 스토리 때문에 확장하지 않는다. HomePage 스토리는 fixture를 받는 UI이며 `app/page.tsx`의 서버 조회·SSR 성공을 증명하지 않는다. 실제 backend·Google SDK/OAuth·AI 서비스, 공개 호스팅·CI 추가는 이 도입 범위에 포함되지 않는다.

## 설치와 실행

저장소 루트에서 실행한다. Storybook 10에는 npm 10 이상이 필요하다. 개발 확인 호스트는 Node `v25.9.0`, npm `10.9.9`를 사용했다. 호스트 전역 npm이 오래되면 아래처럼 해당 실행에만 npm을 지정한다. 전역 설치를 바꿀 필요는 없다.

```sh
npm exec --yes --package=npm@10.9.9 -- npm ci
npx playwright install chromium
npm run storybook
```

개발 주소는 `http://localhost:6006`이다. `storybook`은 계속 실행되는 개발 서버이며 종료형 테스트가 아니다. 브라우저에 보이는 스토리의 `play`가 실행되므로 성공/실패/재시도 스토리는 자동으로 해당 상태에 진입한다. Pending은 이동/종료까지 응답을 기다린다. 오류 dialog의 Close/Login/VerifyEmail과 필터 InitialList/InitialGrid는 수동 확인에 적합하다.

```sh
npm run test:storybook
npm run build-storybook
npx --yes http-server@14.1.1 build/storybook -p 6007 -c-1
```

`test:storybook`은 Vitest의 `storybook` 프로젝트를 실제 headless Chromium으로 전체 실행하고 종료한다. 정적 산출물은 `build/storybook`이며 위 서버의 `http://localhost:6007`에서 연다. `file://`로 열면 worker와 자산을 정상 검증할 수 없다. 위 정적 서버는 별도 실행 예시다. DEV-06은 동일 폴더를 읽는 로컬 HTTP 서버로 검증했다. Chromium 실행 파일은 Playwright가 관리하며 시스템 Chrome 설치와 별개다.

| 고정 개발 도구 | 버전 |
|---|---|
| Storybook / @storybook/nextjs-vite / @storybook/addon-vitest | 10.6.3 |
| Vite | 8.3.5 |
| Vitest / @vitest/browser / @vitest/browser-playwright | 4.1.12 |
| Playwright | 1.64.1 |
| MSW / msw-storybook-addon | 2.15.0 / 3.0.3 |
| 기존 Next.js / React·ReactDOM | 16.2.6 / 19.2.4 |

실제 해석된 모든 의존성은 `package-lock.json`이 기준이다. 초기 DEV-01에서 npm 10의 install이 Arborist `edgesOut` 오류를 내어 npm 11.21.1로 lockfile을 생성했고, 이후 npm 10.9.9의 clean `ci`로 재현했다. 이를 npm 10 install 성공으로 해석하지 않는다.

## 스토리 위치와 상태

9개 `*.stories.tsx`, 57개 스토리다. 경로는 저장소 루트 기준이며 각 파일은 대상 컴포넌트 옆에 있다. export 이름은 Storybook에서 공백을 넣은 라벨로 표시된다.

| 파일 | export와 확인 상태 |
|---|---|
| `src/shared/ui/button.stories.tsx` | Default, Variants(6), Sizes(12), Disabled, WithIcon, IconOnly, KeyboardFocus — 7개 |
| `src/shared/ui/markdown-viewer.stories.tsx` | HeadingsAndLists, LongContent(넓은 표·코드·긴 링크), NormalImage, FailedImage — 4개 |
| `src/widgets/home/ui/project-card.stories.tsx` | 정상, 긴 제목·작성자, 작성자 없음, null 썸네일, 로드 실패, 큰 수치 — 6개 |
| `src/widgets/project-collection/ui/project-card.stories.tsx` | 정상, 설명 없음, users 없음, tags 없음, 다수 태그, 긴 제목·태그, null 썸네일, 로드 실패 — 8개 |
| `src/features/project/project-editor/ui/project-editor-error-dialog.stories.tsx` | Null; Close/Login/VerifyEmail의 표시·Primary·Keyboard, LoginDismiss/VerifyEmailDismiss — 12개 |
| `src/widgets/home/ui/home-page.stories.tsx` | Normal(분야·전체·슬라이더), Empty(두 배열 모두 빈 상태), QueryError(refresh 1회) — 3개 |
| `src/widgets/home/ui/home-page-skeleton.stories.tsx` | Loading — 1개 |
| `src/features/project/project-search-filter/ui/project-tag-filter-sheet.stories.tsx` | InitialList, InitialGrid, DraftAndReset, CancelWithClose/Escape/OutsideClick, ApplyList/Grid/EmptyGrid, Keyboard — 10개 |
| `src/features/project/project-review/ui/project-review-panel.stories.tsx` | BeforeRequest, Pending, Success, EmptyLists, Failure, RetrySuccess — 6개 |

예를 들어 `http://localhost:6006/?path=/story/shared-button--default`에서 실제 Button과 안전한 공개 환경·App Router mock 검증을 확인한다. `Widgets/Home/HomePage`의 Normal을 선택하면 카테고리와 실제 슬라이더 동작 후 전체/처음 상태로 돌아온다. 필터 ApplyList는 keyword trim, 반복 tags, list/VIEW_COUNT 보존과 page=0 생략을 다음 명시 URL에 대해 검증한다.

```text
/projects?keyword=story+book&tags=%EA%B3%B5%ED%95%99&tags=%EC%8B%9C%EA%B0%81+%EB%94%94%EC%9E%90%EC%9D%B8&filterType=VIEW_COUNT&view=list
```

라우터 mock 호출은 실제 페이지 이동·서버 조회 성공과 구분한다. mock은 query props를 갱신하지 않으므로 재열기 조건은 전달한 fixture다.

## 스토리·fixture·play 추가

1. 대상 옆에 CSF 3 `*.stories.tsx`를 만든다. `.storybook/main.ts`가 `src/**/*.stories.tsx`를 찾는다. 제품 컴포넌트는 이동하지 않는다.
2. 같은 slice 내부는 상대 import, 다른 slice 타입·기능은 기존 public `index.ts`, 공통 shared 모듈은 기존 허용 직접 import를 사용한다. [공통 규칙](../../AGENTS.md)을 따른다. 새 함수와 play/decorator에는 한글 JSDoc을 작성한다.
3. 현재 도메인 타입에 `satisfies`하는 가상 fixture를 같은 폴더의 `*.story-fixtures.ts`에 둔다. 실제 사용자 정보·비밀값을 사용하지 않고 타입 cast로 잘못된 데이터를 숨기지 않는다.
4. 정상·null·실제 이미지 실패와 빈 데이터·오류를 분리한다. 정상 이미지는 `.storybook/test-support.ts`의 `localProjectImage`(`/storybook/project-fixture.svg`)를 사용한다. null은 이미지 요청 없음, 실패는 없는 로컬 URL의 404와 제품 fallback을 확인한다. 카드 부모는 실제 사용 폭을 반영하고 overflow를 숨겨 문제를 가리지 않는다.
5. `storybook/test`의 `fn`, `expect`, `userEvent`, `within`, `waitFor`로 사용자가 하는 조작과 결과를 검증한다. 아래 예제는 별도 파일 `src/shared/ui/button-example.stories.tsx`로 추가할 수 있다. 같은 폴더의 실제 Button만 사용한다.

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "Shared/ButtonExample",
  component: Button,
  args: { children: "예제 버튼", onClick: fn() },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Click: Story = {
  /** 실제 버튼 한 번 클릭이 콜백 한 번으로 이어지는지 확인한다. */
  async play({ canvasElement, args }) {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "예제 버튼" }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
```

추가 후 `npm run test:storybook`과 타입·lint를 실행하고 개발/정적 화면을 확인한다. 예제만 조사할 때는 `npm run test:storybook -- src/shared/ui/button-example.stories.tsx`로 실행할 수 있으나 통합 검증에서는 필터 없이 전체를 실행한다. 확인용 예제를 제거하면 기존 57개로 돌아간다.

상태가 있는 UI는 `render(args, context)`에서 `key={context.id}`로 새 인스턴스를 만들고 `beforeEach`에서 spy·스크롤·가변 fixture를 초기화한다. 지연 handler·timer·promise는 반환 cleanup에서 정리한다. 기본 spy 기록은 공통 preview가 초기화한다. 기존 filter/home/review의 실제 예제를 따른다. Radix Sheet/Dialog portal은 canvas 외부이므로 `within(canvasElement.ownerDocument.body)`에서 찾고, Escape·바깥 클릭·포커스 복귀는 비동기 완료를 기다린다.

## MSW 2와 addon 3

CSF 3 스토리는 `msw-storybook-addon/csf3`의 `mswLoader(createMockWorker)`를 공통 preview에서 사용한다. 다른 버전의 `initialize()` 예제를 섞지 않는다. `createMockWorker`가 전용 worker를 시작하고 addon이 스토리별 handler를 재설정한다. `parameters.msw.handlers`에 `http`/`HttpResponse` handler를 넣는다. worker는 `.storybook/public/mockServiceWorker.js`로만 제공되며 제품 `public`에서 활성화하지 않는다.

실제 리뷰 예제는 `project-review-panel.story-helpers.ts`의 `createReviewScenario`와 각 스토리의 `scenarioParameters`다. 고정 프로젝트 ID `4205`의 body 없는 `POST /api/projects/4205/review`를 처리한다. 성공은 `{ success: true, data: ProjectReview }`, 실패는 HTTP 503 및 `{ success: false, message }`다. 정상/빈 목록 fixture는 public `ProjectReview` 타입을 따른다. Pending은 제어된 대기, 나머지 요청은 350ms 지연이며 cleanup에서 남은 대기를 로컬 응답으로 끝낸다. 재시도는 같은 스토리에서 503→200, 재방문하면 횟수 0으로 시작한다. MSW가 빈 body도 stream으로 재구성하므로 요청 byte 문자열 `""`와 실제 wire body를 구분한다.

처리되지 않은 `/api`는 공통 최종 handler가 `HttpResponse.error()`로 차단하고 기록한다. 전역 `afterEach`의 `assertNoUnhandledApiRequests`가 제품에서 오류를 catch한 경우도 테스트 실패로 만든다. 정상 자산·폰트·Storybook 내부 모듈과 의도된 리뷰 503은 이 누락 handler 오류와 다르다. 홈의 두 picsum CTA URL은 해당 스토리 handler가 로컬 SVG로 응답해 외부 사진 결과에 의존하지 않는다.

## 개인 환경과 앱 Mock 분리

`run.mjs`는 OS·브라우저 실행에 필요한 환경만 전달한다. Storybook dev/build/test는 다음 네 값을 고정한다. Vite `envDir:false`, 명시 define과 전용 `.storybook/next.config.mjs`는 Next Vite 플러그인의 루트 개인 환경 파일 탐색도 차단한다. 개인 `.env.local`을 읽거나 복사해서 Storybook을 설정하지 않는다.

| 환경변수 | Storybook 고정값 |
|---|---|
| NEXT_PUBLIC_API_BASE_URL | 빈 문자열 |
| NEXT_PUBLIC_GOOGLE_CLIENT_ID | 빈 문자열 |
| NEXT_PUBLIC_USE_MOCK_API | false |
| NEXT_PUBLIC_MOCK_AUTH_STATE | unverified |

제품 `apiRequest`는 내부 Mock을 fetch보다 먼저 확인한다. Storybook은 이를 끄고 실제 fetch→MSW 경로를 검증한다. 별도 앱 개발 프로세스의 화면 확인은 내부 Mock=true를 사용한다. 개인 설정을 변경하지 않는 PowerShell 예시는 다음과 같다.

```powershell
$env:NEXT_PUBLIC_API_BASE_URL=''
$env:NEXT_PUBLIC_GOOGLE_CLIENT_ID=''
$env:NEXT_PUBLIC_USE_MOCK_API='true'
$env:NEXT_PUBLIC_MOCK_AUTH_STATE='unverified'
npm run dev
```

별도 터미널에서 실행하고 종료 후 닫는다. 홈→탐색→Mock 프로젝트 상세를 확인하며 리뷰 요청·로그인은 실행하지 않는다. 앱에서 Pretendard CDN과 기존 CTA 사진을 가져올 수 있으므로 자산 네트워크와 실제 API 검증을 구분한다.

## 진단과 검증 범위

`viteFinal.optimizeDeps.include`는 기존 항목을 보존하면서 `lucide-react`, `next/link`, `react-markdown`, `remark-gfm`을 명시한다. DEV-02의 첫 실행에서 지연 의존성 발견→재최적화/새로고침→import 실패가 있었기 때문이다. DEV-01 attempt02의 변경 전 cold baseline도 57/57이었으므로 실패가 항상 재현된다는 뜻은 아니다. 새 지연 의존성을 추가하면 첫 실행을 다시 확인한다. 재실행 통과만으로 앞선 실패 기록을 삭제하지 않는다.

의도된 이미지 404와 리뷰 503 진단, Storybook 내부 deprecation/의존성 `use client` 빌드 경고를 신규 pageerror와 구분한다. npm audit 경고는 별도 의존성 문제이며 `audit fix`로 제품 의존성을 임의 갱신하지 않는다. 화면 배치는 375/768/1440 CSS px, 키보드·portal, 실패→정상·스토리 재방문/refresh를 확인한다. 표·코드 내부 스크롤과 문서 전체 넘침도 구분한다.

아래 확인 기록은 DEV-06 개발 단계의 증거다. 최종 독립 QA, Wiki 검수와 원본 전달·배포의 상태는 해당 run 증거와 Wiki에서 확인한다. 실제 Claude quota에 대한 사용자 예외로 개발 검수는 `SKIPPED_QUOTA`이며, 실제 planning PASS와 구분한다. 엔진의 `WAITING_QUOTA`를 COMPLETE로 바꾸었다는 의미가 아니다.

## DEV-06 개발 단계 확인 기록

2026-10-24 KST, run `19dbc232-db6d-44d2-9c29-b737c276695e`의 개발 시도01 기록이다. 시작 후보는 `b5126204620b8b07dde66ec5baacf48b8157fdc3be9775ab0d78b4ca3cb40cf4`이며 이후 변경은 이 가이드·루트 README·docs/ai/README의 세 문서뿐이다. 로그·원본 캡처는 run의 `02-development/DEV-06-attempt01`에 보존했다. 이 표는 개발 확인 시점의 결과이며 이후 독립 QA·검수·전달 상태를 대신하지 않는다.

| 실제 실행/관찰 | 결과와 한계 |
|---|---|
| npm 10.9.9 `npm ci` | exit 0, lockfile 재현. audit 19개(2 low/5 moderate/10 high/2 critical), 수정하지 않음 |
| clean install 직후 `npm run test:storybook` | optimizer cache 없음에서 첫 전체 실행, 9개 파일 57/57 PASS, exit 0. 재최적화 reload/import 실패 없음 |
| `npx tsc --noEmit --incremental false`, `npm run lint` | 각각 exit 0. TypeScript 5.9.3, Tailwind 4.3.0 |
| `npm run build-storybook` | exit 0, 정적 index 57개. 의존성 `use client` directive 경고 보존 |
| `npx playwright install chromium` | exit 0, Chromium 156.0.8078.4 / Playwright 관리 revision 1248 사용 |
| 개발 6006 / 정적 6007 실제 Chromium | 각 16개 캡처, 9개 대표 파일·375/768 Markdown·리뷰 상태 이동·필터 refresh 확인. lang=ko, Pretendard 선언/로드 및 primary #1e40af, 자산/worker 200. pageerror 0, 의도된 리뷰 503 콘솔 진단 각 2개 |
| 기본 `npm run build` (`next build`) | exit 1. 긴 중앙 작업 경로의 Turbopack filesystem path-length 오류. DEV-01 변경 전·후와 같은 종류이며 기본 빌드 PASS로 기록하지 않음 |
| 같은 후보를 임시 SUBST S:에서 기본 build | exit 1. 짧은 cwd는 확인했으나 Tailwind 의존성 탐색이 원래 경로를 반환해 S: root 외부 경로 오류. 소스/설정 수정 없이 진단 후 해당 mapping 제거 |
| 별도 `npm run build -- --webpack` | exit 0. 기본 Turbopack 결과와 구분하는 호환성 확인이며 build 스크립트는 `next build` 유지 |
| 별도 `next dev --webpack --port 3106`, 내부 Mock=true | 실제 링크로 홈→탐색→리스트 보기→/projects/1, 제목·본문·자료·리뷰 패널 표시 확인. localhost에서 4개 캡처, pageerror/console error/API/OAuth 요청 0. Next 서버의 새 HTTP 200 렌더이며 Storybook prop UI 검증과 별개 |

앱의 첫 브라우저 harness는 숨겨진 모바일 검색 링크를 선택해 timeout했다. 실제 보이는 ‘전체 프로젝트 보기’ 링크로 수정한 후 흐름을 완료했고 제품 코드는 변경하지 않았다. 127.0.0.1 주소에서는 Next의 dev-origin/HMR handshake 진단이 관찰되어 원문을 보존했다. 같은 앱을 기본 localhost 주소로 확인했을 때 console error는 0이었다. 원본 개인 환경은 읽거나 복사하지 않았고, 생성된 `next-env.d.ts`는 실행 전 바이트로 복원했다. 소유 개발/정적/앱 서버와 임시 mapping은 종료했다.

표의 결과는 로컬 fixture·Mock 및 해당 호스트의 관찰이다. 실제 backend/OAuth/AI, 운영 SSR 계약, 공개 배포와 main 병합을 검증한 결과로 확대하지 않는다. 최종 독립 QA와 Wiki·전달의 판단 근거는 같은 run의 후속 증거를 확인한다.

</details>
