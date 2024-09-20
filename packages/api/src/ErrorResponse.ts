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
