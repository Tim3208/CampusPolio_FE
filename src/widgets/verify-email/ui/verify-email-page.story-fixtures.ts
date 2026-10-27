import type { UserApiResponse } from "@/entities/user";

export const emailUser = { id: 4210, email: "storybook@example.invalid", universityVerified: false } satisfies UserApiResponse;
export const schoolEmail = "storybook@syu.ac.kr";
export const verificationCode = "123456";
export const emailScenarios = ["ready", "user-pending", "signed-out", "already-verified", "user-error", "send-pending", "send-error", "send-unauthorized", "verify-pending", "verify-error", "verify-unauthorized", "resend-error"] as const;
export type EmailScenario = (typeof emailScenarios)[number];
export type EmailStoryArgs = { nextPath: string; scenario: EmailScenario };

