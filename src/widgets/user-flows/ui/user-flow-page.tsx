"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, ListFilter, Search, Sparkles, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import type { ConditionFlow, FlowEvidence, FlowStatus, UserFlow, UserFlowCatalog } from "../model/types";
import { userFlowCatalog } from "../model/user-flow-data";

const tabs = [
  { id: "actions", label: "사용자 행동" },
  { id: "conditions", label: "조건별 흐름" },
  { id: "ideas", label: "새 아이디어" },
] as const;
type TabId = (typeof tabs)[number]["id"];
type Location = { tab: TabId; item?: string };
const statuses: FlowStatus[] = ["구현됨", "미구현", "확인 필요"];
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-main-10";

/** 구현 상태를 색과 문구로 함께 표시한다. */
function StatusBadge({ status }: { status: FlowStatus }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", status === "구현됨" ? "bg-emerald-50 text-emerald-800" : status === "미구현" ? "bg-amber-50 text-amber-900" : "bg-slate-100 text-slate-700")}>
      {status === "구현됨" ? <Check className="size-3" aria-hidden="true" /> : status === "확인 필요" ? <CircleHelp className="size-3" aria-hidden="true" /> : <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
      {status}
    </span>
  );
}

/** 검토한 커밋에 고정된 코드·기획 근거를 새 탭으로 연다. */
function EvidenceList({ evidence, catalog }: { evidence: FlowEvidence[]; catalog: UserFlowCatalog }) {
  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <p className="text-xs font-semibold text-slate-600">확인한 근거</p>
      <ul className="mt-2 space-y-2">
        {evidence.map((source) => (
          <li key={`${source.path}:${source.line}`}>
            <a href={`${catalog.repositoryUrl}/blob/${source.revision ?? catalog.revision}/${source.path}#L${source.line}`} target="_blank" rel="noreferrer" className={cn("inline-flex max-w-full items-start gap-1.5 text-xs text-main-10 underline-offset-4 hover:underline", focusClass)}>
              <span className="min-w-0"><span className="font-medium">{source.label}</span><span className="mt-0.5 block break-all text-slate-600">{source.path}:{source.line}</span></span>
              <ArrowUpRight className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="sr-only"> (새 탭)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 행동과 기대 결과를 좁은 화면에서도 읽을 수 있게 나란히 표시한다. */
function ActionSentence({ action, result }: { action: string; result: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-1.5 text-left text-sm leading-6 sm:flex-row sm:items-start sm:gap-3">
      <span className="min-w-0 font-semibold text-slate-900 sm:w-[42%]">{action}</span>
      <ArrowRight className="mt-1 hidden size-4 shrink-0 text-slate-400 sm:block" aria-hidden="true" />
      <span className="flex min-w-0 items-start gap-1.5 text-slate-600 sm:flex-1"><ArrowDown className="mt-1 size-3.5 shrink-0 text-slate-400 sm:hidden" aria-hidden="true" />{result}</span>
    </span>
  );
}

/** 성공 흐름 아래에서 상태와 근거를 접거나 펼친다. */
function FlowDisclosure({ id, open, onToggle, summary, children }: { id: string; open: boolean; onToggle: () => void; summary: ReactNode; children: ReactNode }) {
  return (
    <article className={cn("min-w-0", open && "bg-slate-50/70")} data-flow-id={id}>
      <h3>
        <button id={`flow-${id}`} type="button" aria-expanded={open} aria-controls={`detail-${id}`} onClick={onToggle} className="flex w-full min-w-0 items-start gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-main-10 sm:px-5">
          <span className="min-w-0 flex-1">{summary}</span>
          <ChevronDown className={cn("mt-1 size-4 shrink-0 text-slate-600 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden="true" />
        </button>
      </h3>
      <div id={`detail-${id}`} aria-labelledby={`flow-${id}`} hidden={!open} className="px-4 pb-5 sm:px-5">{open && children}</div>
    </article>
  );
}

/** URL의 탭과 항목을 검증하고 유효한 위치만 복원한다. */
function readLocation(catalog: UserFlowCatalog): Location {
  try {
    const [tab, item] = decodeURIComponent(window.location.hash.slice(1)).split("/");
    if (!tabs.some((entry) => entry.id === tab)) return { tab: "actions" };
    const entries = tab === "actions" ? catalog.flows : tab === "conditions" ? catalog.conditions : catalog.ideas;
    return { tab: tab as TabId, item: entries.some((entry) => entry.id === item) ? item : undefined };
  } catch {
    return { tab: "actions" };
  }
}

/** 사용자 행동과 조건별 기대 결과를 검색 가능한 검토 목록으로 표시한다. */
export function UserFlowPage({ catalog = userFlowCatalog }: { catalog?: UserFlowCatalog }) {
  const uid = useId();
  const [tab, setTab] = useState<TabId>("actions");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [focusTarget, setFocusTarget] = useState<string>();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const needle = query.trim().toLocaleLowerCase("ko");

  useEffect(() => {
    /** 브라우저의 뒤로·앞으로 이동과 직접 연결한 항목을 복원한다. */
    function restoreLocation() {
      const location = readLocation(catalog);
      setTab(location.tab);
      setQuery("");
      setArea("all");
      setStatus("all");
      if (location.item) {
        setExpanded((previous) => new Set(previous).add(location.item!));
        setFocusTarget(location.item);
      }
    }
    restoreLocation();
    window.addEventListener("hashchange", restoreLocation);
    window.addEventListener("popstate", restoreLocation);
    return () => {
      window.removeEventListener("hashchange", restoreLocation);
      window.removeEventListener("popstate", restoreLocation);
    };
  }, [catalog]);

  useEffect(() => {
    if (!focusTarget) return;
    const handle = window.requestAnimationFrame(() => {
      const target = document.getElementById(`flow-${focusTarget}`);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center", behavior: "auto" });
      setFocusTarget(undefined);
    });
    return () => window.cancelAnimationFrame(handle);
  }, [focusTarget, tab, query, area, status]);

  /** 이동한 탭과 항목을 주소에 남겨 새로고침과 브라우저 탐색을 지원한다. */
  function recordLocation(nextTab: TabId, item?: string) {
    const hash = `#${nextTab}${item ? `/${encodeURIComponent(item)}` : ""}`;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  }

  /** 조건 또는 원래 행동으로 이동하면서 숨김 필터를 해제하고 해당 항목에 초점을 둔다. */
  function navigate(nextTab: TabId, item?: string) {
    setTab(nextTab);
    setQuery("");
    setArea("all");
    setStatus("all");
    recordLocation(nextTab, item);
    if (item) {
      setExpanded((previous) => new Set(previous).add(item));
      setFocusTarget(item);
    }
  }

  /** 방향키와 Home·End 키로 탭을 선택하고 키보드 초점을 옮긴다. */
  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    navigate(tabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  }

  /** 선택한 항목의 상세를 펼치거나 접고 직접 연결할 주소를 기록한다. */
  function toggleItem(id: string) {
    const isOpen = expanded.has(id);
    setExpanded((previous) => {
      const next = new Set(previous);
      if (isOpen) next.delete(id);
      else next.add(id);
      return next;
    });
    recordLocation(tab, isOpen ? undefined : id);
  }

  /** 검색어와 선택한 범위에 해당하는 사용자 행동을 고른다. */
  function matchesFlow(flow: UserFlow) {
    return (area === "all" || flow.area === area) && (status === "all" || flow.status === status) && `${flow.action} ${flow.result} ${flow.statusNote}`.toLocaleLowerCase("ko").includes(needle);
  }

  /** 검색어와 구현 상태에 해당하는 조건별 흐름을 고른다. */
  function matchesCondition(condition: ConditionFlow) {
    return (status === "all" || condition.status === status) && `${condition.title} ${condition.summary} ${condition.cases.map((entry) => `${entry.when} ${entry.result}`).join(" ")}`.toLocaleLowerCase("ko").includes(needle);
  }

  /** 검색 및 범위 선택을 초기화해 전체 목록을 다시 표시한다. */
  function clearFilters() {
    setQuery("");
    setArea("all");
    setStatus("all");
  }

  const visibleFlows = catalog.flows.filter(matchesFlow);
  const visibleConditions = catalog.conditions.filter(matchesCondition);
  const visibleIdeas = catalog.ideas.filter((idea) => `${idea.title} ${idea.action} ${idea.result} ${idea.reason}`.toLocaleLowerCase("ko").includes(needle));
  const resultCount = tab === "actions" ? visibleFlows.length : tab === "conditions" ? visibleConditions.length : visibleIdeas.length;

  return (
    <main className="min-w-0 flex-1 bg-[#F5F8FB] text-slate-900">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-9 xl:px-12">
        <header className="mb-5 max-w-4xl">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2"><h1 className="text-3xl font-bold tracking-tight md:text-4xl">유저 플로우</h1><span className="text-xs text-slate-600">검토 기준 {catalog.reviewedAt}</span></div>
        </header>

        <div role="tablist" aria-label="유저 플로우 보기" className="mb-6 flex gap-1 border-b border-slate-200">
          {tabs.map((entry, index) => (
            <button key={entry.id} ref={(element) => { tabRefs.current[index] = element; }} type="button" role="tab" id={`${uid}-tab-${entry.id}`} aria-controls={`${uid}-panel-${entry.id}`} aria-selected={tab === entry.id} tabIndex={tab === entry.id ? 0 : -1} onClick={() => navigate(entry.id)} onKeyDown={(event) => handleTabKey(event, index)} className={cn("-mb-px inline-flex min-h-12 items-center gap-2 border-b-2 px-3 text-sm font-semibold sm:px-5", tab === entry.id ? "border-main-10 text-main-10" : "border-transparent text-slate-600 hover:text-slate-900", focusClass)}>
              {entry.label}<span className="hidden rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 sm:inline">{entry.id === "actions" ? catalog.flows.length : entry.id === "conditions" ? catalog.conditions.length : catalog.ideas.length}</span>
            </button>
          ))}
        </div>
        {tabs.filter((entry) => entry.id !== tab).map((entry) => <div key={entry.id} role="tabpanel" id={`${uid}-panel-${entry.id}`} aria-labelledby={`${uid}-tab-${entry.id}`} hidden />)}

        <div className="flex min-w-0 items-start gap-8">
          {tab === "actions" && <nav aria-label="행동 영역" className="sticky top-24 hidden w-44 shrink-0 lg:block">
            <p className="mb-3 px-3 text-xs font-semibold text-slate-600">사용자 여정</p>
            <button type="button" aria-pressed={area === "all"} onClick={() => setArea("all")} className={cn("mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm", area === "all" ? "bg-white font-semibold text-main-10 shadow-sm" : "text-slate-600 hover:bg-white/70", focusClass)}>전체 행동<span className="text-xs tabular-nums">{catalog.flows.length}</span></button>
            {catalog.areas.map((entry) => <button key={entry.id} type="button" aria-pressed={area === entry.id} onClick={() => setArea(entry.id)} className={cn("mb-1 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm", area === entry.id ? "bg-white font-semibold text-main-10 shadow-sm" : "text-slate-600 hover:bg-white/70", focusClass)}>{entry.title}<span className="text-xs tabular-nums">{catalog.flows.filter((flow) => flow.area === entry.id).length}</span></button>)}
          </nav>}

          <section role="tabpanel" id={`${uid}-panel-${tab}`} aria-labelledby={`${uid}-tab-${tab}`} tabIndex={0} className={cn("min-w-0 flex-1", focusClass)}>
            {tab !== "actions" && <h2 className="sr-only">{tab === "conditions" ? "조건별 흐름 목록" : "새 아이디어 목록"}</h2>}
            <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row">
              <label className="relative min-w-0 flex-1"><span className="sr-only">플로우 검색</span><Search className="pointer-events-none absolute top-3 left-3.5 size-4 text-slate-600" aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="행동이나 결과 검색" className="h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white pr-10 pl-10 text-sm outline-none placeholder:text-slate-600 focus:border-main-10 focus:ring-2 focus:ring-main-10/20" />{query && <button type="button" aria-label="검색어 지우기" onClick={() => setQuery("")} className={cn("absolute top-1 right-1 grid size-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100", focusClass)}><X className="size-4" aria-hidden="true" /></button>}</label>
              {tab !== "ideas" && <label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3"><ListFilter className="size-4 shrink-0 text-slate-600" aria-hidden="true" /><span className="sr-only">구현 상태 필터</span><select value={status} onChange={(event) => setStatus(event.target.value)} className={cn("h-10 min-w-0 flex-1 bg-transparent pr-1 text-sm text-slate-700", focusClass)}><option value="all">모든 구현 상태</option>{statuses.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></label>}
              {tab === "actions" && <label className="lg:hidden"><span className="sr-only">행동 영역 선택</span><select value={area} onChange={(event) => setArea(event.target.value)} className={cn("h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700", focusClass)}><option value="all">전체 행동</option>{catalog.areas.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select></label>}
            </div>

            {tab === "actions" ? (
              <p role="status" aria-live="polite" className="sr-only">{resultCount}개 행동{query && <> · “{query}” 검색 결과</>}</p>
            ) : (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><p role="status" aria-live="polite">{resultCount}개 {tab === "conditions" ? "조건" : "아이디어"}{query && <> · “{query}” 검색 결과</>}</p><p>{tab === "conditions" ? "조건에서 관련 행동으로 바로 돌아갈 수 있어요" : "기존 기획에 포함되지 않은 추가 제안이에요"}</p></div>
            )}

            {resultCount === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><Search className="mx-auto size-6 text-slate-600" aria-hidden="true" /><h2 className="mt-4 text-base font-semibold">일치하는 플로우가 없어요</h2><p className="mt-2 text-sm text-slate-600">검색어나 선택한 조건을 바꿔보세요.</p><Button type="button" variant="outline" size="md" className="mt-5" onClick={clearFilters}>전체 목록 보기</Button></div>}

            {tab === "actions" && catalog.areas.map((entry) => {
              const flows = visibleFlows.filter((flow) => flow.area === entry.id);
              if (!flows.length) return null;
              return <section key={entry.id} aria-labelledby={`${uid}-area-${entry.id}`} className="mb-7"><div className="mb-3 flex items-center gap-2"><h2 id={`${uid}-area-${entry.id}`} className="text-base font-bold">{entry.title}</h2><span className="text-xs text-slate-600">{flows.length}</span></div><div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {flows.map((flow) => <div key={flow.id}><FlowDisclosure id={flow.id} open={expanded.has(flow.id)} onToggle={() => toggleItem(flow.id)} summary={<><span className="mb-2 flex items-center gap-2"><span className="text-[11px] font-medium text-slate-600">{flow.id}</span><StatusBadge status={flow.status} /></span><ActionSentence action={flow.action} result={flow.result} /></>}>
                  <p className="border-l-2 border-slate-300 pl-3 text-sm leading-6 text-slate-700">{flow.statusNote}</p>
                  {flow.states.length > 0 && <div className="mt-5"><h4 className="text-xs font-semibold text-slate-600">함께 확인할 상태</h4><ul className="mt-2 space-y-2">{flow.states.map((state, index) => <li key={`${state.kind}-${index}`} data-state-origin={state.origin} className="rounded-lg border border-slate-200 bg-white p-3"><div className="mb-1 flex items-center gap-2"><span className="text-xs font-semibold text-slate-700">{state.kind}</span><span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", state.origin === "제안" ? "bg-violet-50 text-violet-800" : "bg-slate-100 text-slate-600")}>{state.origin}</span></div><p className="text-sm leading-6 text-slate-700">{state.when}<span className="mx-1.5 text-slate-400" aria-label="이면">→</span>{state.result}</p></li>)}</ul></div>}
                  <EvidenceList evidence={flow.evidence} catalog={catalog} />
                </FlowDisclosure>{flow.conditionIds.length > 0 && <div className={cn("flex flex-wrap gap-x-4 gap-y-2 px-4 pb-4 text-xs sm:px-5", expanded.has(flow.id) && "bg-slate-50/70")} aria-label={`${flow.action}의 조건 링크`}>{flow.conditionIds.map((id) => { const condition = catalog.conditions.find((item) => item.id === id); return condition ? <a key={id} href={`#conditions/${id}`} onClick={(event) => { event.preventDefault(); navigate("conditions", id); }} className={cn("inline-flex items-center gap-1 font-medium text-main-10 underline-offset-4 hover:underline", focusClass)}>조건: {condition.title}<ArrowUpRight className="size-3" aria-hidden="true" /></a> : null; })}</div>}</div>)}
              </div></section>;
            })}

            {tab === "conditions" && resultCount > 0 && <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">{visibleConditions.map((condition) => <FlowDisclosure key={condition.id} id={condition.id} open={expanded.has(condition.id)} onToggle={() => toggleItem(condition.id)} summary={<><span className="mb-2 flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-slate-900">{condition.title}</span><StatusBadge status={condition.status} /></span><span className="block text-left text-sm leading-6 text-slate-600">{condition.summary}</span></>}>
              <p className="mb-4 border-l-2 border-slate-300 pl-3 text-sm leading-6 text-slate-700">{condition.statusNote}</p>
              <ul className="space-y-2">{condition.cases.map((entry, index) => <li key={index} data-state-origin={entry.origin} className="rounded-lg border border-slate-200 bg-white p-3"><span className={cn("mb-2 inline-block rounded px-1.5 py-0.5 text-[11px] font-medium", entry.origin === "제안" ? "bg-violet-50 text-violet-800" : "bg-slate-100 text-slate-600")}>{entry.origin}</span><ActionSentence action={entry.when} result={entry.result} /></li>)}</ul>
              <div className="mt-5"><h4 className="text-xs font-semibold text-slate-600">관련 사용자 행동</h4><ul className="mt-2 space-y-2">{catalog.flows.filter((flow) => flow.conditionIds.includes(condition.id)).map((flow) => <li key={flow.id}><a href={`#actions/${flow.id}`} onClick={(event) => { event.preventDefault(); navigate("actions", flow.id); }} className={cn("inline-flex items-start gap-1 text-sm font-medium text-main-10 underline-offset-4 hover:underline", focusClass)}>{flow.action}<ArrowUpRight className="mt-1 size-3 shrink-0" aria-hidden="true" /></a></li>)}</ul></div><EvidenceList evidence={condition.evidence} catalog={catalog} />
            </FlowDisclosure>)}</div>}

            {tab === "ideas" && resultCount > 0 && <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">{visibleIdeas.map((idea) => <FlowDisclosure key={idea.id} id={idea.id} open={expanded.has(idea.id)} onToggle={() => toggleItem(idea.id)} summary={<><span className="mb-2 flex items-center gap-2 text-left"><Sparkles className="size-3.5 text-violet-700" aria-hidden="true" /><span className="text-sm font-semibold text-slate-900">{idea.title}</span><span className="rounded bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-800">제안</span></span><ActionSentence action={idea.action} result={idea.result} /></>}><p className="text-sm leading-7 text-slate-700">{idea.reason}</p></FlowDisclosure>)}</div>}
          </section>
        </div>
        <footer className="mt-8 border-t border-slate-200 pt-5 text-xs leading-6 text-slate-600">기획·코드 검토 시점의 목록입니다. 확정되지 않은 동작은 각 항목의 설명에서 확인할 수 있습니다.</footer>
      </div>
    </main>
  );
}
