import { useEffect, useRef } from "react";
import type { ScriptProps } from "next/script";
import { subscribeGoogleScript } from "./google-scenario";

/** 원격 script 태그 없이 지정된 Google 시나리오의 로컬 콜백만 실행한다. */
export default function StorybookScript({ src, onLoad, onReady, onError }: ScriptProps) {
  const callbacks = useRef({ onLoad, onReady, onError });
  useEffect(() => { callbacks.current = { onLoad, onReady, onError }; });
  useEffect(() => {
    if (src !== "https://accounts.google.com/gsi/client") {
      throw new Error(`Storybook에서 허용하지 않은 Script: ${src}`);
    }
    return subscribeGoogleScript((state) => {
      if (state === "loaded") {
        callbacks.current.onLoad?.(new Event("load"));
        callbacks.current.onReady?.();
      } else if (state === "error") {
        callbacks.current.onError?.(new Error("Storybook local SDK load failure"));
      }
    });
  }, [src]);
  return null;
}
