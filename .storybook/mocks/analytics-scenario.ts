const scriptSources: string[] = [];

/** 분석 스토리에서 요청한 스크립트 주소를 기록하고 원격 로딩을 대신한다. */
export function recordAnalyticsScript(source: string) {
  scriptSources.push(source);
}

/** 현재 스토리가 요청한 로컬 분석 스크립트 기록을 반환한다. */
export function getAnalyticsScriptSources() {
  return [...scriptSources];
}

/** 다음 스토리에 이전 분석 스크립트 기록을 남기지 않는다. */
export function resetAnalyticsScriptSources() {
  scriptSources.length = 0;
}
