import { readFileSync } from 'fs'
import { Middleware } from 'openapi-fetch'

export * from './throwError.js'
export type { Middleware } from 'openapi-fetch'
const customHeaders: Middleware = {
  onRequest: (req) => {
    req.headers.set('x-workflowai-source', 'sdk')
    req.headers.set('x-workflowai-language', 'typescript')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    req.headers.set('x-workflowai-version', packageJson.version)
    return req
  },
}
export { customHeaders }
