import type { UserApiResponse } from "@/entities/user";

export const googleUser = { id: 4211, email: "google-story@example.invalid", universityVerified: true } satisfies UserApiResponse;
export const fakeCredential = "storybook-invalid-credential-not-a-real-token";
export const googleScenarios = ["missing", "waiting", "script-error", "ready", "no-credential", "pending", "bad-request", "unauthorized", "server-error", "verified", "unverified"] as const;
export type GoogleScenario = (typeof googleScenarios)[number];
export type GoogleStoryArgs = { nextPath: string; scenario: GoogleScenario };

