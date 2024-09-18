import { Middleware } from 'openapi-fetch'

export * from './throwError.js'
export type { Middleware } from 'openapi-fetch'
const customHeaders: Middleware = {
    onRequest: (req) => {
      req.headers.set('x-workflowai-source', 'sdk')
      req.headers.set('x-workflowai-language', 'typescript')
      req.headers.set('x-workflowai-version', '0.1.0')
      return req
    },
  }
export { customHeaders }



