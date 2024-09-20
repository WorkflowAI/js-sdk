export type ProviderErrorCode = 
  "max_tokens_exceeded" | 
  "failed_generation" | 
  "invalid_generation" | 
  "unknown_provider_error" | 
  "rate_limit" | 
  "server_overloaded" | 
  "invalid_provider_config" | 
  "provider_internal_error" | 
  "provider_unavailable" | 
  "read_timeout";

export type ErrorCode = 
  ProviderErrorCode | 
  "object_not_found" | 
  "no_provider_supporting_model" | 
  "provider_does_not_support_model" | 
  "model_does_not_support_mode" | 
  "invalid_run_properties" | 
  "internal_error" | 
  "bad_request";

export interface WorkflowAIApiError {
  error:{
    details?: Record<string, any>
    message?: string
    status_code?: number
    code?: ErrorCode
  }
  task_run_id?: string
}

export const extractError = (respJson: any): WorkflowAIApiError => {
    if (Object.keys(respJson).length === 0) {
      return { error: { message: "Default error message", status_code: 500, code: "internal_error" } };
    }
    try {
      return { error: { details: respJson.error.details, message: respJson.error.message, status_code: respJson.error.status_code, code: respJson.error.code } }
    } catch (e) {
      return { error: { details: respJson.detail } }
    }
  }