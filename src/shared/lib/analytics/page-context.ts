const pageTitles: Record<string, string> = {
  "/": "홈",
  "/login": "로그인",
  "/verify-email": "학교 이메일 인증",
  "/projects": "프로젝트 탐색",
  "/projects/new": "프로젝트 작성",
  "/portfolios/new": "포트폴리오 제작",
  "/mypage": "마이페이지",
  "/mypage/projects": "내 프로젝트",
  "/mypage/portfolios": "내 포트폴리오",
  "/mypage/settings": "프로필 설정",
  "/mypage/support": "고객 지원",
};

const campaignParameters = [
  "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content",
] as const;

/** URL에 섞인 사용자 입력 대신 알려진 화면 이름과 캠페인 정보만 만든다. */
export function getAnalyticsPage(location: string) {
  try {
    const url = new URL(location);
    if (!/^https?:$/.test(url.protocol)) return null;

    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    let pagePath = pathname;
    let title = pageTitles[pathname];

    if (/^\/projects\/\d+$/.test(pathname)) title = "프로젝트 상세";
    if (/^\/projects\/\d+\/edit$/.test(pathname)) title = "프로젝트 수정";
    if (!title && /^\/portfolios\/[^/]+$/.test(pathname)) {
      pagePath = "/portfolios/:slug";
      title = "포트폴리오 상세";
    }
    if (!title) return null;

    const pageUrl = new URL(pagePath, url.origin);
    for (const key of campaignParameters) {
      const value = url.searchParams.get(key);
      // 제어문자를 분석 파라미터에서 의도적으로 차단한다.
      if (value && value.length <= 100 && !/[@\u0000-\u001f\u007f]/.test(value)) {
        pageUrl.searchParams.set(key, value);
      }
    }

    return {
      page_location: pageUrl.href,
      page_title: `${title} | CampusPolio`,
    };
  } catch {
    return null;
  }
}

/** 외부 유입은 출처 도메인만, 내부 이동은 정리된 화면 경로만 남긴다. */
export function getAnalyticsReferrer(referrer: string, currentOrigin: string) {
  try {
    const url = new URL(referrer);
    if (!/^https?:$/.test(url.protocol)) return "";
    if (url.origin !== currentOrigin) return `${url.origin}/`;

    const page = getAnalyticsPage(referrer);
    if (!page) return "";
    const pageUrl = new URL(page.page_location);
    return `${pageUrl.origin}${pageUrl.pathname}`;
  } catch {
    return "";
  }
}

/** GA4 웹 스트림의 측정 ID 형식인지 확인한다. */
export function isValidMeasurementId(value: string) {
  return /^G-[A-Z0-9]+$/.test(value);
}
