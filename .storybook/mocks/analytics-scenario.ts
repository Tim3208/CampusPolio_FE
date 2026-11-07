const scriptSources: string[] = [];
const scriptModels = new Map<string, {
  commandsAtLoad: unknown[][];
  model: ReturnType<typeof createAnalyticsInitializationModel>;
}>();
const cleanups: Array<() => void> = [];

type AnalyticsParameters = Record<string, unknown>;
type ObservedPageView = {
  source: "automatic" | "manual";
  parameters: AnalyticsParameters;
};

/** 새 Google 태그가 첫 js/config/event/get 전에 초기화하는 규칙만 로컬로 재현한다. */
export function createAnalyticsInitializationModel(defaultContext: AnalyticsParameters) {
  const globalSettings: AnalyticsParameters = {};
  let initializationSettings: AnalyticsParameters | null = null;
  const pageViews: ObservedPageView[] = [];

  /** set은 선행 적용하고, 초기화 명령은 config 본문보다 먼저 자동 조회를 판단한다. */
  function consume(command: readonly unknown[]) {
    if (command[0] === "set") {
      if (typeof command[1] === "string") globalSettings[command[1]] = command[2];
      else if (command[1] && typeof command[1] === "object") Object.assign(globalSettings, command[1]);
      return;
    }
    if (!["js", "config", "event", "get"].includes(String(command[0]))) return;

    if (initializationSettings === null) {
      initializationSettings = { ...globalSettings };
      if (globalSettings.send_page_view !== false) {
        pageViews.push({ source: "automatic", parameters: { ...defaultContext, ...globalSettings } });
      }
    }
    // 신규 목적지는 gtm.init으로 시작하므로 뒤에 오는 config로 초기 조회를 취소할 수 없다.
    if (command[0] === "event" && command[1] === "page_view") {
      const parameters = command[2] && typeof command[2] === "object" ? command[2] : {};
      pageViews.push({ source: "manual", parameters: { ...defaultContext, ...globalSettings, ...parameters } });
    }
  }

  /** 현재까지 관찰한 초기 설정과 조회를 복사해 테스트에 제공한다. */
  function snapshot() {
    return {
      initializationSettings: initializationSettings === null ? null : { ...initializationSettings },
      pageViews: pageViews.map((pageView) => ({ ...pageView, parameters: { ...pageView.parameters } })),
    };
  }

  return { consume, snapshot };
}

/** 브라우저 큐의 Arguments 명령을 SDK 모형이 읽을 배열로 변환한다. */
function readCommand(command: unknown) {
  return Array.from(command as ArrayLike<unknown>);
}

/** 분석 스토리에서 요청한 스크립트 주소를 기록하고 원격 로딩을 대신한다. */
export function recordAnalyticsScript(source: string) {
  scriptSources.push(source);
  // Next Script와 같이 동일 SDK의 재마운트를 새 초기화로 취급하지 않는다.
  if (scriptModels.has(source)) return;

  const dataLayer = window.dataLayer ??= [];
  const commandsAtLoad = dataLayer.map(readCommand);
  const model = createAnalyticsInitializationModel({
    page_location: window.location.href,
    page_title: document.title,
    page_referrer: document.referrer,
  });
  for (const command of commandsAtLoad) model.consume(command);
  scriptModels.set(source, { commandsAtLoad, model });

  const previousPush = Object.getOwnPropertyDescriptor(dataLayer, "push");
  const originalPush = dataLayer.push;
  /** SDK 로딩 뒤 이어지는 SPA 명령도 같은 초기화 상태로 소비한다. */
  dataLayer.push = function (...commands: unknown[]) {
    const length = originalPush.apply(this, commands);
    for (const command of commands) model.consume(readCommand(command));
    return length;
  };
  cleanups.push(/** 다음 스토리에 큐 관찰 함수를 남기지 않는다. */ () => {
    if (previousPush) Object.defineProperty(dataLayer, "push", previousPush);
    else Reflect.deleteProperty(dataLayer, "push");
  });
}

/** 현재 스토리가 요청한 로컬 분석 스크립트 기록을 반환한다. */
export function getAnalyticsScriptSources() {
  return [...scriptSources];
}

/** 스크립트를 읽기 전의 준비 상태와 초기화 모형의 조회 결과를 반환한다. */
export function getAnalyticsScriptObservations() {
  return [...scriptModels.values()].map(({ commandsAtLoad, model }) => ({
    commandsAtLoad: commandsAtLoad.map((command) => [...command]),
    ...model.snapshot(),
  }));
}

/** 다음 스토리에 이전 분석 스크립트 기록을 남기지 않는다. */
export function resetAnalyticsScriptSources() {
  for (const cleanup of cleanups) cleanup();
  cleanups.length = 0;
  scriptModels.clear();
  scriptSources.length = 0;
}
