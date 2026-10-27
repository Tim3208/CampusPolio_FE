import { useReducer, type ReactNode } from "react";

/** 초기화 명령마다 새 인스턴스 번호를 만든다. */
function nextInstanceKey(value: number) {
  return value + 1;
}

/** 매 입력이 아닌 명시적인 초기화에서만 컴포넌트 인스턴스 키를 바꾼다. */
export function useScenarioReset() {
  const [instanceKey, reset] = useReducer(nextInstanceKey, 0);
  return { instanceKey, reset };
}

type ScenarioControlsProps = { onReset: () => void; children?: ReactNode };

/** 자유 조작 스토리에 키보드로 사용할 수 있는 초기화 버튼을 제공한다. */
export function ScenarioControls({ onReset, children }: ScenarioControlsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <button type="button" onClick={onReset} className="rounded-md border px-3 py-2 text-sm">
        시나리오 초기화
      </button>
      {children}
    </div>
  );
}
