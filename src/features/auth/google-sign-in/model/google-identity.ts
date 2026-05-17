export type GoogleCredentialResponse = {
  credential?: string
  select_by?: string
}

type GoogleInitializeOptions = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  ux_mode?: "popup" | "redirect"
}

type GoogleButtonOptions = {
  theme?: "outline" | "filled_blue" | "filled_black"
  size?: "large" | "medium" | "small"
  text?: "signin_with" | "signup_with" | "continue_with" | "signin"
  shape?: "rectangular" | "pill" | "circle" | "square"
  logo_alignment?: "left" | "center"
  width?: number
}

export type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize(options: GoogleInitializeOptions): void
      renderButton(parent: HTMLElement, options: GoogleButtonOptions): void
      cancel(): void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}
