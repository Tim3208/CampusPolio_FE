export type ApiResponse<TData = unknown> = {
  success: boolean
  data?: TData
  message?: string
}

export class ApiError<TData = unknown> extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: ApiResponse<TData>
  ) {
    super(message)
    this.name = "ApiError"
  }
}
