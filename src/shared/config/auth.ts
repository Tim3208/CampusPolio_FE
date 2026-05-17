export const authApiPaths = {
  login: "/api/auth/login",
  me: "/api/users/me",
  logout: "/api/auth/logout",
  sendEmailCode: "/api/auth/email/send",
  verifyEmailCode: "/api/auth/email/verify",
  resendEmailCode: "/api/auth/email/resend",
} as const
