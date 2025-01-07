import { Middleware } from 'openapi-fetch';
import { PACKAGE_VERSION } from '../../version.js';

export * from './throwError.js';
export type { Middleware } from 'openapi-fetch';

const customHeaders: Middleware = {
  onRequest: (req) => {
    req.headers.set('x-workflowai-source', 'sdk');
    req.headers.set('x-workflowai-language', 'typescript');
    req.headers.set('x-workflowai-version', PACKAGE_VERSION);
    return req;
  },
};
export { customHeaders };
