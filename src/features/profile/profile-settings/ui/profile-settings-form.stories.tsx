import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ScenarioControls, useScenarioReset } from "../../../../../.storybook/scenario-controls";
import { ProfileSettingsForm } from "./profile-settings-form";
import { existingProfile, getInitialProfile, initialProfiles, profileErrors, profileScenarios, type InitialProfile, type ProfileScenario } from "./profile-settings-form.story-fixtures";
import { disposeProfileScenario, expectProfileRequests, getProfileRequests, profileHandlers, releaseProfileResponse, resetProfileScenario, saveProfile, typeProfileField } from "./profile-settings-form.story-helpers";

type Args = { initialProfile: InitialProfile; scenario: ProfileScenario };

// 실제 Chromium 최초 error 검사에서 확인한 기존 제품 한계다. todo는 접근성 PASS가 아니다.
const errorAccessibility = {
  a11y: { test: "todo" },
  docs: { description: { story: "접근성 미완료(todo): 실제 제품 alert의 text-red-600(#e7000b)/bg-red-50(#fef2f2), 14px 일반 글자 대비가 4.36:1로 4.5:1에 미달합니다. color-contrast 규칙을 끄거나 제품 색을 덮지 않습니다. 동작 검증과 접근성 미완료를 구분합니다." } },
};

/** 초기 fixture와 응답 시나리오가 바뀌거나 명시적 초기화가 있을 때만 새 폼을 만든다. */
function ProfileScenarioInstance({ initialProfile, scenario }: Args) {
  useEffect(() => {
    resetProfileScenario(scenario);
    return disposeProfileScenario;
  }, [scenario]);
  return <ProfileSettingsForm profile={getInitialProfile(initialProfile)} />;
}

/** 자동 제출 없는 자유 조작 폼에 명시적 초기화와 지연 해제 도구를 제공한다. */
function ProfilePlayground(args: Args) {
  const { instanceKey, reset } = useScenarioReset();
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="mb-4 text-xl font-bold">프로필 설정 미리보기</h1>
      <ScenarioControls onReset={reset}>
        {args.scenario === "pending" ? <button type="button" className="rounded-md border px-3 py-2 text-sm" onClick={releaseProfileResponse}>대기 응답 완료</button> : null}
      </ScenarioControls>
      <ProfileScenarioInstance key={`${args.initialProfile}:${args.scenario}:${instanceKey}`} {...args} />
    </main>
  );
}

const meta = {
  title: "Features/Profile/ProfileSettingsForm",
  component: ProfilePlayground,
  args: { initialProfile: "undefined", scenario: "success" },
  argTypes: {
    initialProfile: { control: "select", options: initialProfiles, description: "undefined/null은 신규 빈 폼, existing은 가상 기존 프로필입니다. 변경 시만 새 폼으로 시작합니다." },
    scenario: { control: "select", options: profileScenarios, description: "로컬 MSW 응답. pending은 대기 응답 완료 버튼으로 해제합니다. 변경 시 요청 기록과 폼이 초기화됩니다." },
  },
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true, navigation: { pathname: "/mypage/settings" } },
    msw: { handlers: profileHandlers },
    docs: {
      story: { inline: false, height: 960 },
      description: { component: "실제 ProfileSettingsForm의 신규/기존 표시와 fetch→MSW 저장을 확인합니다. Playground는 자동 제출하지 않으며 Controls의 초기 프로필·시나리오 변경과 명시적 초기화만 remount합니다. 고정 사례의 play는 자동 입력/저장합니다. Docs는 iframe으로 분리하여 동일 input ID·handler·focus 간섭을 막습니다.\n\n계약 차이: api.md는 POST/PATCH userId query를 required로 명시하지만 현재 세션 기반 client는 query 없이 credentials:include로 호출합니다. 학년 미선택은 PATCH에서 null이지만 명세는 integer(1~6)로 기술합니다. 이 차이는 제품/API를 고치지 않고 관찰합니다. Mock 성공은 실제 서버 수용·세션·영속 저장의 증거가 아닙니다. 오류 응답은 명세의 success:false envelope를 사용하며, 명세에 없는 최상위 message를 만들어 성공시키지 않습니다." },
    },
  },
  /** 이전 스토리의 요청·pending과 라우터 호출을 초기화한다. */
  beforeEach() { resetProfileScenario(); return disposeProfileScenario; },
} satisfies Meta<typeof ProfilePlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const NewUndefined: Story = {
  /** undefined 초기값의 필수·선택 입력과 초기 무요청 상태를 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const label of ["이름", "닉네임", "전공", "프로필 이미지 URL", "자기소개"]) expect(canvas.getByLabelText(label)).toHaveValue("");
    expect(canvas.getByLabelText("학년")).toHaveValue("");
    expect(getProfileRequests()).toHaveLength(0);
    expect(getRouter().refresh).not.toHaveBeenCalled();
  },
};

export const NewNull: Story = { ...NewUndefined, args: { initialProfile: "null" } };

export const Existing: Story = {
  args: { initialProfile: "existing" },
  /** 공개 Profile fixture가 실제 폼의 모든 초기 필드에 표시되는지 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByLabelText("이름")).toHaveValue(existingProfile.name);
    expect(canvas.getByLabelText("닉네임")).toHaveValue(existingProfile.nickname);
    expect(canvas.getByLabelText("전공")).toHaveValue(existingProfile.major);
    expect(canvas.getByLabelText("학년")).toHaveValue("3");
    expect(canvas.getByLabelText("자기소개")).toHaveValue(existingProfile.bio);
    expect(getProfileRequests()).toHaveLength(0);
  },
};

export const RequiredValidation: Story = {
  parameters: errorAccessibility,
  /** 브라우저 필수 검증과 공백 trim 후 제품 오류를 실제 입력으로 구분한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nickname = canvas.getByLabelText("닉네임");
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    expect(nickname).toBeInvalid();
    expect(nickname).toHaveFocus();
    expect(getProfileRequests()).toHaveLength(0);
    await typeProfileField(canvasElement, "닉네임", "   ");
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    expect(canvas.getByRole("alert")).toHaveTextContent("닉네임을 입력해주세요.");
    expect(getProfileRequests()).toHaveLength(0);
    expect(getRouter().refresh).not.toHaveBeenCalled();
  },
};

export const CreateMinimal: Story = {
  /** 최소 신규 입력은 trim된 두 필드의 POST만 보내며 이후 저장은 PATCH로 바뀐다. */
  play: async ({ canvasElement }) => {
    await typeProfileField(canvasElement, "닉네임", "  캠퍼스 첫 프로필  ");
    await typeProfileField(canvasElement, "자기소개", "  함께 만드는 프로젝트  ");
    await saveProfile(canvasElement, "프로필 생성 완료");
    const create = { nickname: "캠퍼스 첫 프로필", bio: "함께 만드는 프로젝트" };
    await expectProfileRequests([{ method: "POST", body: create }]);
    expect(within(canvasElement).getByLabelText("닉네임")).toHaveValue(create.nickname);
    await saveProfile(canvasElement, "프로필 수정 완료", 2);
    await expectProfileRequests([{ method: "POST", body: create }, { method: "PATCH", body: { ...create, name: "", major: "", grade: null, profileImage: "" } }]);
  },
};

export const CreateAdditionalFields: Story = {
  /** 추가 필드를 포함한 신규 저장의 POST→PATCH 순서와 정확한 정규화 값을 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await typeProfileField(canvasElement, "닉네임", "  캠퍼스 추가  ");
    await typeProfileField(canvasElement, "이름", "  김 추가  ");
    await typeProfileField(canvasElement, "전공", "  컴퓨터 공학  ");
    await typeProfileField(canvasElement, "자기소개", "  디자인 & 개발 · 협업 😊  ");
    await userEvent.selectOptions(canvas.getByLabelText("학년"), "1");
    await saveProfile(canvasElement, "프로필 수정 완료");
    await expectProfileRequests([
      { method: "POST", body: { nickname: "캠퍼스 추가", bio: "디자인 & 개발 · 협업 😊" } },
      { method: "PATCH", body: { nickname: "캠퍼스 추가", bio: "디자인 & 개발 · 협업 😊", name: "김 추가", major: "컴퓨터 공학", grade: 1, profileImage: "" } },
    ]);
  },
};

export const WhitespaceOptionalFields: Story = {
  /** 선택 필드의 공백만 있는 입력은 trim 후 추가 PATCH를 만들지 않는다. */
  play: async ({ canvasElement }) => {
    await typeProfileField(canvasElement, "닉네임", "  최소 프로필  ");
    for (const label of ["이름", "전공", "자기소개"]) await typeProfileField(canvasElement, label, "   ");
    await saveProfile(canvasElement, "프로필 생성 완료");
    await expectProfileRequests([{ method: "POST", body: { nickname: "최소 프로필", bio: "" } }]);
    for (const label of ["이름", "전공", "자기소개"]) expect(within(canvasElement).getByLabelText(label)).toHaveValue("");
  },
};

export const ExistingUpdate: Story = {
  args: { initialProfile: "existing" },
  /** 기존 프로필은 한 번의 PATCH로 수정하고 선택 필드 제거를 빈 문자열/null로 보낸다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await typeProfileField(canvasElement, "닉네임", "  수정 · O'Neil & <팀> 😊  ");
    for (const label of ["이름", "전공", "자기소개"]) await userEvent.clear(canvas.getByLabelText(label));
    await userEvent.selectOptions(canvas.getByLabelText("학년"), "");
    await saveProfile(canvasElement, "프로필 수정 완료");
    await expectProfileRequests([{ method: "PATCH", body: { nickname: "수정 · O'Neil & <팀> 😊", bio: "", name: "", major: "", grade: null, profileImage: "" } }]);
  },
};

export const InputBoundaries: Story = {
  /** HTML maxLength와 실제 학년 선택지 1~6을 넘는 입력이 UI에서 제한됨을 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [label, count] of [["닉네임", 30], ["이름", 30], ["전공", 50], ["자기소개", 500]] as const) {
      const input = await typeProfileField(canvasElement, label, "가".repeat(count) + "나");
      expect(input).toHaveAttribute("maxlength", String(count));
      expect(input).toHaveValue("가".repeat(count));
    }
    expect(canvas.getByText("500/500")).toBeVisible();
    const grade = canvas.getByLabelText("학년");
    expect(within(grade).getAllByRole("option").map(/** 선택지의 실제 값을 읽는다. */ (option) => option.getAttribute("value"))).toEqual(["", "1", "2", "3", "4", "5", "6"]);
    await userEvent.selectOptions(grade, "1");
    expect(grade).toHaveValue("1");
    await userEvent.selectOptions(grade, "6");
    await saveProfile(canvasElement, "프로필 수정 완료");
    await expectProfileRequests([
      { method: "POST", body: { nickname: "가".repeat(30), bio: "가".repeat(500) } },
      { method: "PATCH", body: { nickname: "가".repeat(30), bio: "가".repeat(500), name: "가".repeat(30), major: "가".repeat(50), grade: 6, profileImage: "" } },
    ]);
  },
};

export const InvalidImageUrl: Story = {
  /** 잘못된 URL은 브라우저 검증에서 차단하고 실제 저장 요청을 만들지 않는다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await typeProfileField(canvasElement, "닉네임", "이미지 확인");
    const image = await typeProfileField(canvasElement, "프로필 이미지 URL", "invalid-url");
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    expect(image).toBeInvalid();
    expect(getProfileRequests()).toHaveLength(0);
  },
};

/** 추가 필드 하나만 있어도 POST 뒤 PATCH가 필요함을 실제 조작으로 확인한다. */
function additionalFieldStory(field: "major" | "grade" | "profileImage"): Story {
  return {
    /** 다른 추가 필드는 비워 둔 채 각 생성 후 수정 조건을 따로 검증한다. */
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await typeProfileField(canvasElement, "닉네임", "단일 추가 필드");
      const body = { nickname: "단일 추가 필드", bio: "", name: "", major: "", grade: null as number | null, profileImage: "" };
      if (field === "major") {
        await typeProfileField(canvasElement, "전공", "  디자인  ");
        body.major = "디자인";
      } else if (field === "grade") {
        await userEvent.selectOptions(canvas.getByLabelText("학년"), "6");
        body.grade = 6;
      } else {
        body.profileImage = `${window.location.origin}/storybook/project-fixture.svg`;
        await typeProfileField(canvasElement, "프로필 이미지 URL", body.profileImage);
        expect(canvas.getByRole("img", { name: "프로필 이미지 미리보기" })).toBeVisible();
      }
      await saveProfile(canvasElement, "프로필 수정 완료");
      await expectProfileRequests([{ method: "POST", body: { nickname: "단일 추가 필드", bio: "" } }, { method: "PATCH", body }]);
    },
  };
}

export const MajorOnlyCreate: Story = additionalFieldStory("major");
export const GradeOnlyCreate: Story = additionalFieldStory("grade");
export const ImageOnlyCreate: Story = additionalFieldStory("profileImage");

export const Pending: Story = {
  args: { initialProfile: "existing", scenario: "pending" },
  /** 제어된 저장 지연 동안 버튼이 비활성화되어 반복 클릭 요청이 추가되지 않음을 확인한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(getProfileRequests()).toHaveLength(1));
    const pending = canvas.getByRole("button", { name: "저장 중" });
    expect(pending).toBeDisabled();
    // disabled의 실제 이벤트 차단을 확인하며 CSS pointer-events 검사는 이 두 조작에만 생략한다.
    await userEvent.click(pending, { pointerEventsCheck: 0 });
    await userEvent.click(pending, { pointerEventsCheck: 0 });
    expect(getProfileRequests()).toHaveLength(1);
    expect(getRouter().refresh).not.toHaveBeenCalled();
  },
};

export const PendingSuccess: Story = {
  ...Pending,
  /** 지연 저장을 수동 해제하면 성공 안내와 단 한 번의 refresh가 발생한다. */
  play: async (context) => {
    await Pending.play?.(context);
    const canvas = within(context.canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "대기 응답 완료" }));
    await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent("프로필 수정 완료"));
    expect(getRouter().refresh).toHaveBeenCalledTimes(1);
    expect(canvas.getByRole("button", { name: "저장" })).toBeEnabled();
  },
};

/** HTTP 오류별 현재 안내와 입력 보존/무 refresh를 자동으로 확인하는 사례를 만든다. */
function errorStory(scenario: keyof typeof profileErrors, initialProfile: InitialProfile = "existing"): Story {
  return {
    args: { initialProfile, scenario },
    parameters: errorAccessibility,
    /** 오류 응답은 UI 메시지만 확인하고 서버 세션·권한 성공으로 해석하지 않는다. */
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await typeProfileField(canvasElement, "닉네임", "  보존할 입력  ");
      await userEvent.click(canvas.getByRole("button", { name: "저장" }));
      await waitFor(() => expect(canvas.getByRole("alert")).toHaveTextContent(profileErrors[scenario]));
      expect(canvas.getByLabelText("닉네임")).toHaveValue("  보존할 입력  ");
      expect(getProfileRequests()).toHaveLength(1);
      expect(getProfileRequests()[0].method).toBe(initialProfile === "existing" ? "PATCH" : "POST");
      expect(getRouter().refresh).not.toHaveBeenCalled();
    },
  };
}

export const BadRequest: Story = errorStory("error400");
export const Unauthorized: Story = errorStory("error401");
export const NotFound: Story = errorStory("error404");
export const Conflict: Story = errorStory("error409", "null");
export const ServerFailure: Story = errorStory("error503");

export const RetrySuccess: Story = {
  args: { initialProfile: "existing", scenario: "retry" },
  /** 실패 후 입력을 수정해 재시도하면 새 값을 저장하고 refresh는 성공 때만 실행한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    expect(getRouter().refresh).not.toHaveBeenCalled();
    await typeProfileField(canvasElement, "닉네임", "재시도 성공");
    await saveProfile(canvasElement, "프로필 수정 완료");
    const base = { name: existingProfile.name, nickname: existingProfile.nickname, bio: existingProfile.bio, major: existingProfile.major, grade: 3, profileImage: "" };
    await expectProfileRequests([{ method: "PATCH", body: base }, { method: "PATCH", body: { ...base, nickname: "재시도 성공" } }]);
  },
};

export const CreateFallback: Story = {
  args: { scenario: "fallback" },
  /** 서버 메시지가 없을 때 신규 최소 입력의 생성 안내 fallback을 확인한다. */
  play: async ({ canvasElement }) => {
    await typeProfileField(canvasElement, "닉네임", "생성 기본 안내");
    await saveProfile(canvasElement, "프로필이 생성되었습니다.");
    await expectProfileRequests([{ method: "POST", body: { nickname: "생성 기본 안내", bio: "" } }]);
  },
};

export const UpdateFallback: Story = {
  args: { initialProfile: "existing", scenario: "fallback" },
  /** 기존 저장에서 서버 메시지가 없으면 저장 기본 안내가 표시된다. */
  play: async ({ canvasElement }) => { await saveProfile(canvasElement, "프로필이 저장되었습니다."); },
};

export const CreateThenPatchFallback: Story = {
  args: { scenario: "fallback" },
  /** 생성과 추가 수정 모두 메시지가 없을 때 최종 저장 기본 안내가 표시된다. */
  play: async ({ canvasElement }) => {
    await typeProfileField(canvasElement, "닉네임", "추가 기본 안내");
    await typeProfileField(canvasElement, "이름", "김 추가");
    await saveProfile(canvasElement, "프로필이 저장되었습니다.");
    expect(getProfileRequests().map(/** 실제 요청 순서를 읽는다. */ (request) => request.method)).toEqual(["POST", "PATCH"]);
  },
};

export const CreateMessageFallback: Story = {
  ...CreateThenPatchFallback, args: { scenario: "create-message-fallback" },
  /** PATCH 메시지만 없으면 앞선 생성 응답의 안내를 유지한다. */
  play: async ({ canvasElement }) => {
    await typeProfileField(canvasElement, "닉네임", "생성 안내 유지");
    await typeProfileField(canvasElement, "이름", "김 추가");
    await saveProfile(canvasElement, "프로필 생성 완료");
    expect(getProfileRequests().map(/** 실제 요청 순서를 읽는다. */ (request) => request.method)).toEqual(["POST", "PATCH"]);
  },
};

export const PartialCreateFailure: Story = {
  args: { scenario: "patch-failure" },
  parameters: { ...errorAccessibility, docs: { description: { story: `${errorAccessibility.docs.description.story}\n\nPOST 성공 뒤 PATCH 실패 시 현재 폼은 hasProfile을 바꾸지 않습니다. 재시도는 POST부터 다시 시작합니다. rollback이나 서버 중복 생성 안전성을 보장하지 않으며 실제 서버에서는 409가 가능하다는 기존 경계입니다.` } } },
  /** 생성 후 수정 실패에서도 입력을 보존하고 현 구현의 재시도 POST 반복 경계를 드러낸다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await typeProfileField(canvasElement, "닉네임", "부분 생성");
    await typeProfileField(canvasElement, "이름", "추가 정보");
    const first = [{ method: "POST", body: { nickname: "부분 생성", bio: "" } }, { method: "PATCH", body: { nickname: "부분 생성", bio: "", name: "추가 정보", major: "", grade: null, profileImage: "" } }];
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await expectProfileRequests(first);
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await expectProfileRequests([...first, ...first]);
    expect(getRouter().refresh).not.toHaveBeenCalled();
  },
};

export const ResetAndFocus: Story = {
  args: { initialProfile: "existing", scenario: "retry" },
  parameters: errorAccessibility,
  /** 연속 입력은 같은 노드를 유지하고 명시적 reset만 초기 fixture와 요청 횟수를 복원한다. */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = await typeProfileField(canvasElement, "닉네임", "연속 입력 유지");
    await userEvent.type(input, " 확인");
    expect(input).toHaveFocus();
    expect(canvas.getByLabelText("닉네임")).toBe(input);
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    await userEvent.click(canvas.getByRole("button", { name: "시나리오 초기화" }));
    expect(canvas.getByLabelText("닉네임")).not.toBe(input);
    expect(canvas.getByLabelText("닉네임")).toHaveValue(existingProfile.nickname);
    expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    expect(getProfileRequests()).toHaveLength(0);
    expect(getRouter().refresh).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "저장" }));
    await waitFor(() => expect(canvas.getByRole("alert")).toBeVisible());
    expect(getProfileRequests()).toHaveLength(1);
  },
};
