export type ProviderErrorCode =
  | 'failed_generation'
  | 'invalid_generation'
  | 'invalid_provider_config'
  | 'max_tokens_exceeded'
  | 'model_does_not_support_mode'
  | 'provider_internal_error'
  | 'provider_unavailable'
  | 'rate_limit'
  | 'read_timeout'
  | 'server_overloaded'
  | 'unknown_provider_error';

export type ErrorCode =
  | ProviderErrorCode
  | 'bad_request'
  | 'internal_error'
  | 'invalid_file'
  | 'invalid_run_properties'
  | 'model_does_not_support_mode'
  | 'no_provider_supporting_model'
  | 'object_not_found'
  | 'provider_does_not_support_model';

export interface WorkflowAIApiError {
  error: {
    details?: Record<string, unknown>;
    message?: string;
    status_code?: number;
    code?: ErrorCode;
  };
  task_run_id?: string;
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
    };
  }
  if ('error' in respJson) {
    return respJson as WorkflowAIApiError;
  } else if ('detail' in respJson) {
    const detailResp = respJson as { detail?: Record<string, unknown> };
    return { error: { details: detailResp.detail } } as WorkflowAIApiError;
  }
  return {} as WorkflowAIApiError;
};
