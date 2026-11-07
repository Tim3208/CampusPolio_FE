"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { getAnalyticsPage, getAnalyticsReferrer, isValidMeasurementId } from "./page-context";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

type GoogleAnalyticsProps = {
  measurementId: string;
  enabled: boolean;
  debugMode?: boolean;
};

/** 분석 설정이 있을 때만 Google 태그를 읽고 완료된 화면 이동을 한 번씩 집계한다. */
export function GoogleAnalytics({ measurementId, enabled, debugMode = false }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const initializedId = useRef<string | null>(null);
  const previousPath = useRef<string | null>(null);
  const previousLocation = useRef<string | null>(null);
  const active = enabled && isValidMeasurementId(measurementId);
  const trackedPath = !!pathname && getAnalyticsPage(`https://campus-polio.local${pathname}`) !== null;

  useEffect(() => {
    if (!isValidMeasurementId(measurementId)) return;

    // 제외 화면에 진입한 뒤에도 이미 로드된 태그가 참여 이벤트를 보내지 않게 한다.
    window[`ga-disable-${measurementId}`] = !active || !trackedPath;
    if (!active || !trackedPath || !pathname) {
      previousPath.current = null;
      return;
    }
    if (previousPath.current === pathname && initializedId.current === measurementId) return;

    const page = getAnalyticsPage(window.location.href);
    if (!page) return;
    const context = {
      ...page,
      page_referrer: getAnalyticsReferrer(
        previousLocation.current ?? document.referrer,
        window.location.origin,
      ),
    };

    window.dataLayer ??= [];
    window.gtag ??= function () {
      // Google 태그의 공식 큐 형식인 Arguments 객체를 유지한다.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };

    const needsInitialization = initializedId.current !== measurementId;
    if (needsInitialization) {
      window.gtag("js", new Date());
    }
    // 참여 시간 등 SDK의 후속 이벤트도 정리된 URL과 제목을 사용한다.
    window.gtag("set", context);
    if (needsInitialization) {
      window.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        ...(debugMode ? { debug_mode: true } : {}),
      });
      initializedId.current = measurementId;
      previousPath.current = null;
    }

    if (previousPath.current !== pathname) {
      window.gtag("event", "page_view", { ...context, send_to: measurementId });
      previousPath.current = pathname;
      previousLocation.current = page.page_location;
    }
  }, [active, debugMode, measurementId, pathname, trackedPath]);

  if (!active || !trackedPath) return null;

  return (
    <Script
      id="campuspolio-google-analytics"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
      referrerPolicy="origin"
    />
  );
}
