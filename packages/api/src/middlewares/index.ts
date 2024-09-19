import { readFileSync } from 'fs'
import { Middleware } from 'openapi-fetch'

export * from './throwError.js'
export type { Middleware } from 'openapi-fetch'

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    return packageJson?.version;
  } catch (error) {
    console.error('Error reading package.json:', error)
    return undefined
  }
}

const customHeaders: Middleware = {
  onRequest: (req) => {
    req.headers.set('x-workflowai-source', 'sdk')
    req.headers.set('x-workflowai-language', 'typescript')
    req.headers.set('x-workflowai-version', getPackageVersion())
    return req
  },
}
export { customHeaders }
