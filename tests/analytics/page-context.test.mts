import assert from "node:assert/strict";
import test from "node:test";

import {
  getAnalyticsPage,
  getAnalyticsReferrer,
  isValidMeasurementId,
} from "../../src/shared/lib/analytics/page-context.ts";

const origin = "https://campus.example.invalid";

test("GA4 측정 ID만 허용하고 설정 실수와 삽입 문자열을 거부한다", () => {
  assert.equal(isValidMeasurementId("G-ABC1234567"), true);
  for (const value of ["", "G-", "UA-123456-1", "GTM-ABC123", "GT-ABC123", "g-abc123", " G-ABC1234567 ", "G-ABC123?x=1", 'G-ABC123"><script>']) {
    assert.equal(isValidMeasurementId(value), false, value);
  }
});

test("운영 화면은 고정 제목을 사용하고 query와 hash의 개인정보를 제거한다", () => {
  const paths = ["/", "/login", "/verify-email", "/projects", "/projects/new", "/portfolios/new", "/mypage", "/mypage/projects", "/mypage/portfolios", "/mypage/settings", "/mypage/support"];
  for (const path of paths) {
    const page = getAnalyticsPage(`${origin}${path}?email=student%40example.invalid&token=private&next=%2Fprojects%3Fkeyword%3Dstudent#private-code`);
    assert.ok(page, path);
    assert.equal(page.page_location, `${origin}${path}`);
    assert.ok(page.page_title.trim(), path);
    assert.equal(page.page_title, getAnalyticsPage(`${origin}${path}`)?.page_title);
    assert.doesNotMatch(JSON.stringify(page), /student|private|token|keyword/);
  }
});

test("숫자 프로젝트 경로를 허용하고 상세 제목에 식별자를 섞지 않는다", () => {
  for (const suffix of ["", "/edit"]) {
    const first = getAnalyticsPage(`${origin}/projects/42${suffix}?token=private`);
    const second = getAnalyticsPage(`${origin}/projects/999${suffix}`);
    assert.ok(first);
    assert.ok(second);
    assert.equal(first.page_location, `${origin}/projects/42${suffix}`);
    assert.equal(first.page_title, second.page_title);
  }
  assert.equal(getAnalyticsPage(`${origin}/projects/student%40example.invalid`), null);
  assert.equal(getAnalyticsPage(`${origin}/projects/student/edit`), null);
});

test("사용자 제목에서 생성되는 포트폴리오 slug를 마스킹한다", () => {
  const first = getAnalyticsPage(`${origin}/portfolios/student%40example.invalid?keyword=student#secret`);
  const second = getAnalyticsPage(`${origin}/portfolios/private-student-name`);
  assert.ok(first);
  assert.ok(second);
  assert.equal(first.page_location, `${origin}/portfolios/:slug`);
  assert.equal(first.page_title, second.page_title);
  assert.doesNotMatch(JSON.stringify(first), /student|secret|keyword/);
  assert.equal(getAnalyticsPage(`${origin}/portfolios/new`)?.page_location, `${origin}/portfolios/new`);
});

test("개발 화면과 알 수 없는 경로, 지원하지 않는 URL을 수집하지 않는다", () => {
  for (const location of [
    `${origin}/user-flows#actions/private`,
    `${origin}/user-flows/nested`,
    `${origin}/api/users/me`,
    `${origin}/unknown/student%40example.invalid`,
    `${origin}/projects/42/private`,
    "javascript:alert(1)",
    "file:///projects",
    "ftp://campus.example.invalid/projects",
    "not a URL",
    "/projects",
    "",
  ]) {
    assert.equal(getAnalyticsPage(location), null, location);
  }
  assert.equal(getAnalyticsPage("http://campus.example.invalid/projects")?.page_location, "http://campus.example.invalid/projects");
});

test("허용한 캠페인 정보만 보존하고 검색어, 인증값, 임의 query를 제거한다", () => {
  const query = new URLSearchParams({
    utm_source: "campus_newsletter",
    utm_medium: "email",
    utm_campaign: "autumn_showcase",
    utm_id: "campaign_42",
    utm_term: "project",
    utm_content: "header",
    keyword: "student@example.invalid",
    tags: "private-name",
    code: "123456",
    next: "/mypage/settings",
    custom: "private",
  });
  const page = getAnalyticsPage(`${origin}/projects?${query}#private`);
  assert.ok(page);
  const result = new URL(page.page_location);
  assert.deepEqual(Object.fromEntries(result.searchParams), {
    utm_source: "campus_newsletter",
    utm_medium: "email",
    utm_campaign: "autumn_showcase",
    utm_id: "campaign_42",
    utm_term: "project",
    utm_content: "header",
  });
  assert.equal(result.hash, "");
});

test("이메일 형태와 제어문자 또는 100자를 넘는 캠페인 값은 제외한다", () => {
  for (const value of ["student@example.invalid", "campaign\nprivate", "campaign\tprivate", "campaign\u0000private", "x".repeat(101)]) {
    const query = new URLSearchParams({ utm_source: value, utm_medium: "referral" });
    const page = getAnalyticsPage(`${origin}/?${query}`);
    assert.ok(page);
    const result = new URL(page.page_location);
    assert.equal(result.searchParams.has("utm_source"), false, JSON.stringify(value));
    assert.equal(result.searchParams.get("utm_medium"), "referral");
  }
  const allowed = "x".repeat(100);
  assert.equal(new URL(getAnalyticsPage(`${origin}/?utm_source=${allowed}`)!.page_location).searchParams.get("utm_source"), allowed);
});

test("외부 유입 경로는 출처만 남기고 경로, 인증정보, query를 제거한다", () => {
  assert.equal(
    getAnalyticsReferrer("https://search.example.invalid/profile/student?q=private&token=secret#private", origin),
    "https://search.example.invalid/",
  );
  assert.equal(getAnalyticsReferrer("https://user:password@search.example.invalid/private", origin), "https://search.example.invalid/");
});

test("내부 이전 페이지는 캠페인 정보를 제거하고 포트폴리오 slug를 마스킹한다", () => {
  assert.equal(getAnalyticsReferrer(`${origin}/projects?keyword=student&utm_source=campaign#private`, origin), `${origin}/projects`);
  assert.equal(getAnalyticsReferrer(`${origin}/portfolios/private-student?token=secret`, origin), `${origin}/portfolios/:slug`);
  assert.equal(getAnalyticsReferrer(`${origin}/user-flows`, origin), "");
  assert.equal(getAnalyticsReferrer(`${origin}/unknown/private`, origin), "");
});

test("유입 주소가 비었거나 비정상이면 이전 페이지를 비워둔다", () => {
  for (const referrer of ["", "not a URL", "/projects", "javascript:alert(1)", "file:///projects", "ftp://search.example.invalid/private"]) {
    assert.equal(getAnalyticsReferrer(referrer, origin), "", referrer);
  }
});
