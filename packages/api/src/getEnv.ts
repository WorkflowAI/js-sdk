/**
 * Read environment variable
 * No-op in browser
 * 
 * @param varName Environment variable name
 * @returns Env variable value as string, or undefined
 */

export function getEnv(varName: string): string | undefined {
  return 'undefined' !== typeof process ? process.env[varName] : undefined
}
