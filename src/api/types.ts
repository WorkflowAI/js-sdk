import { components, operations } from './generated/openapi.js';
import { RequestRetryInit } from './utils/retriableFetch.js';

// Properly exporting types otherwise they are not accessible in the client

type Schema = components['schemas'];

export type VersionProperties = Schema['TaskGroupProperties'];

export type VersionEnvironment = 'dev' | 'staging' | 'production';

export type VersionReference = VersionEnvironment | number | VersionProperties;

export type RunRequest = Schema['RunRequest'];

// Not sure why we are generating types if we have to do that to make it usable :(
type RunResponseContent =
  operations['run_task_v1__tenant__tasks__task_id__schemas__task_schema_id__run_post']['responses']['200']['content'];

export type RunResponse = Omit<
  RunResponseContent['application/json'],
  'version'
> & {
  version: {
    properties: VersionProperties;
  } | null;
};

/**
 * A partial response from a run request.
 */
export type RunResponseStreamChunk =
  RunResponseContent['text/event-stream']['$defs']['RunResponseStreamChunk'];

export type FetchOptions = RequestRetryInit;
