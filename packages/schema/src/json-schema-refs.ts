/**
 * Copied (and adapted) from https://github.com/StefanTerdell/local-ref-resolver/blob/master/src/localRefResolver.ts
 */

import { JsonSchemaObject } from 'json-schema-to-zod'

export type Ref = [string, string]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getValueAtPath(obj: any, path: string[]): any {
  if (!(path.length && obj)) {
    return obj
  }
  return getValueAtPath(obj[path[0]], path.slice(1))
}

export const findRefs = (
  obj: JsonSchemaObject,
  refs: Ref[],
  path: string,
): Ref[] => {
  for (const [key, value] of Object.entries(obj).filter(
    ([, value]) => typeof value === 'object' && value != null,
  )) {
    const keyPath = `${path}/${key}`
    if (value.$ref) {
      refs.push([keyPath, value.$ref])
      for (const ref of refs) {
        if (ref[1] === keyPath) {
          ref[1] = value.$ref
        }
      }
    } else {
      findRefs(value, refs, keyPath)
    }
  }
  return refs
}

export const resolveRefs = (
  obj: JsonSchemaObject,
  refs: Ref[],
  options: Options = {
    unresolvable: 'warn',
    merge: false,
    keepRefs: false,
  },
): JsonSchemaObject => {
  for (const [targetRef, sourceRef] of refs) {
    const sourcePath = sourceRef.split('/').slice(1)
    const source = getValueAtPath(obj, sourcePath)
    if (source) {
      const targetKey = targetRef.slice(targetRef.lastIndexOf('/') + 1)
      const targetPath = targetRef.split('/').slice(1, -1)
      const target = getValueAtPath(obj, targetPath)
      const bothAreObjects =
        typeof target[targetKey] === 'object' && typeof source === 'object'
      if (options.merge && bothAreObjects) {
        const targetEntries = Object.entries(target[targetKey])
        const sourceEntries = Object.entries(source ?? {})
        const $refIndex = targetEntries.findIndex(([key]) => key === '$ref')
        const entries =
          options.merge === 'favorTarget'
            ? [...sourceEntries, ...targetEntries]
            : options.merge === 'favorSource'
              ? [...targetEntries, ...sourceEntries]
              : [
                  ...targetEntries.slice(0, $refIndex),
                  ...sourceEntries,
                  ...targetEntries.slice($refIndex),
                ]

        target[targetKey] = entries.reduce(
          (acc, [key, value]) =>
            key !== '$ref' || options.keepRefs
              ? {
                  ...acc,
                  [key === '$ref' && typeof options.keepRefs === 'string'
                    ? options.keepRefs
                    : key]: value,
                }
              : acc,
          {},
        )
      } else if (options.keepRefs && bothAreObjects) {
        target[targetKey] = {
          ...(source ?? {}),
          [typeof options.keepRefs === 'string' ? options.keepRefs : '$ref']:
            target[targetKey]['$ref'],
        }
      } else {
        target[targetKey] = source
      }
    } else if (options.unresolvable === 'warn') {
      console.warn(`Could not resolve $ref from ${targetRef} to ${sourceRef}`)
    } else if (options.unresolvable === 'throw') {
      throw `localRefResolver could not resolve $ref from ${targetRef} to ${sourceRef}`
    }
  }
  return obj
}

export type Options = {
  merge?: boolean | 'favorTarget' | 'favorSource'
  keepRefs?: boolean | string
  unresolvable?: 'skip' | 'warn' | 'throw'
  refFilter?: (ref: Ref) => boolean
}

export const hydrateRefs = (
  root: JsonSchemaObject,
  options?: Options,
): JsonSchemaObject =>
  root
    ? resolveRefs(
        root,
        findRefs(root, [], '#').filter(
          options?.refFilter ?? (([, source]) => typeof source === 'string'),
        ),
        options,
      )
    : root
