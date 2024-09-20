export type ProviderErrorCode =
  | 'max_tokens_exceeded'
  | 'failed_generation'
  | 'invalid_generation'
  | 'unknown_provider_error'
  | 'rate_limit'
  | 'server_overloaded'
  | 'invalid_provider_config'
  | 'provider_internal_error'
  | 'provider_unavailable'
  | 'read_timeout'

export type ErrorCode =
  | ProviderErrorCode
  | 'object_not_found'
  | 'no_provider_supporting_model'
  | 'provider_does_not_support_model'
  | 'model_does_not_support_mode'
  | 'invalid_run_properties'
  | 'internal_error'
  | 'bad_request'

export interface WorkflowAIApiError {
  error: {
    details?: Record<string, unknown>
    message?: string
    status_code?: number
    code?: ErrorCode
  }
  task_run_id?: string
}

export const extractError = (respJson: unknown): WorkflowAIApiError => {
  if (
    typeof respJson !== 'object' ||
    respJson === null ||
    Object.keys(respJson).length === 0
  ) {
    return {
      error: {
        message: 'Default error message',
        status_code: 500,
        code: 'internal_error',
      },
    }
  }
  try {
    const errorResp = respJson as {
      error?: {
        details?: Record<string, unknown>
        message?: string
        status_code?: number
        code?: ErrorCode
      }
    }
    return {
      error: {
        details: errorResp.error?.details,
        message: errorResp.error?.message,
        status_code: errorResp.error?.status_code,
        code: errorResp.error?.code,
      },
    }
  } catch (_) {
    const detailResp = respJson as { detail?: Record<string, unknown> }
    return { error: { details: detailResp.detail } }
  }
}
