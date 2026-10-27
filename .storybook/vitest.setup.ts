import { afterEach } from "vitest";
import { assertNoUnhandledApiRequests } from "./test-support";

// addon-vitest 10.6이 addon-a11y를 포함한 전체 preview annotation을 자동 제공한다.
afterEach(assertNoUnhandledApiRequests);
