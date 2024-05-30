/**
 * Copy from https://github.com/StefanTerdell/local-ref-resolver/blob/master/src/localRefResolver.test.ts
 */

import { JsonSchemaObject } from 'json-schema-to-zod'

import { findRefs, hydrateRefs, Ref, resolveRefs } from './json-schema-refs'

describe('Find Refs', () => {
  it('Should work with sibling dependencies', () => {
    const refs = findRefs(
      {
        ett: {
          $ref: '#/två',
        },
        två: {
          $ref: '#/tre',
        },
        tre: {
          succe: true,
        },
      },
      [],
      '#',
    )

    expect(refs).toStrictEqual([
      ['#/ett', '#/tre'],
      ['#/två', '#/tre'],
    ])
  })

  it('Should work with nested dependencies', () => {
    const refs = findRefs(
      {
        a: {
          b: {
            $ref: '#/a/c',
          },
          c: {
            $ref: '#/tre',
          },
        },
        tre: {
          succe: true,
        },
      },
      [],
      '#',
    )

    expect(refs).toStrictEqual([
      ['#/a/b', '#/tre'],
      ['#/a/c', '#/tre'],
    ])
  })

  it('Should work with circular dependencies', () => {
    const refs = findRefs(
      {
        a: {
          b: {
            $ref: '#',
          },
        },
      },
      [],
      '#',
    )

    expect(refs).toStrictEqual([['#/a/b', '#']])
  })
})

describe('Resolving refs without mergin', () => {
  it('Should work with sibling dependencies', () => {
    const obj = {
      ett: {
        $ref: '#/två',
      },
      två: {
        $ref: '#/tre',
      },
      tre: {
        succe: true,
      },
    }
    const refs: Ref[] = [
      ['#/ett', '#/tre'],
      ['#/två', '#/tre'],
    ]

    resolveRefs(obj, refs)

    expect(obj.ett).toBe(obj.tre)
    expect(obj.två).toBe(obj.tre)
  })

  it('Should work with nested dependencies', () => {
    const obj = {
      a: {
        b: {
          $ref: '#/a/c',
        },
        c: {
          $ref: '#/tre',
        },
      },
      tre: {
        succe: true,
      },
    }
    const refs: Ref[] = [
      ['#/a/b', '#/tre'],
      ['#/a/c', '#/tre'],
    ]

    resolveRefs(obj, refs)

    expect(obj.a.b).toBe(obj.tre)
    expect(obj.a.c).toBe(obj.tre)
  })

  it('Should work with circular dependencies', () => {
    const obj = {
      a: {
        b: {
          $ref: '#',
        },
      },
    }

    const refs: Ref[] = [['#/a/b', '#']]

    resolveRefs(obj, refs)

    const itWorks = Object.is(obj.a.b, obj)
    expect(itWorks).toBeTruthy()
  })
})

describe('Resolving refs with merging', () => {
  it('Should work with sibling dependencies', () => {
    const obj = {
      ett: {
        hej: 1,
        $ref: '#/två',
      },
      två: {
        hej: 2,
        $ref: '#/tre',
      },
      tre: {
        succe: true,
      },
    }
    const refs: Ref[] = [
      ['#/ett', '#/tre'],
      ['#/två', '#/tre'],
    ]

    resolveRefs(obj, refs, { merge: true })

    expect(obj.ett).toStrictEqual({ hej: 1, ...obj.tre })
    expect(obj.två).toStrictEqual({ hej: 2, ...obj.tre })
  })

  it('Should work with nested dependencies', () => {
    const obj = {
      a: {
        b: {
          $ref: '#/a/c',
        },
        c: {
          $ref: '#/tre',
        },
      },
      tre: {
        succe: true,
      },
    }
    const refs: Ref[] = [
      ['#/a/b', '#/tre'],
      ['#/a/c', '#/tre'],
    ]

    resolveRefs(obj, refs, { merge: true })

    expect(obj.a.b).toStrictEqual(obj.tre)
    expect(obj.a.c).toStrictEqual(obj.tre)
  })

  it('Should work with replacing $ref', () => {
    const obj = {
      a: {
        b: {
          $ref: '#/a/c',
        },
        c: {
          $ref: '#/tre',
        },
      },
      tre: {
        succe: true,
      },
    }

    const refs: Ref[] = [
      ['#/a/b', '#/tre'],
      ['#/a/c', '#/tre'],
    ]

    resolveRefs(obj, refs, { merge: true, keepRefs: 'pelle' })

    expect(obj.a.b).toStrictEqual({ succe: true, pelle: '#/a/c' })
    expect(obj.a.c).toStrictEqual({ succe: true, pelle: '#/tre' })
  })

  it('Should work with circular dependencies', () => {
    const obj: JsonSchemaObject = {
      root: 'yes',
      a: {
        b: {
          flag: 'yep',
          $ref: '#',
        },
      },
    }

    const refs: Ref[] = [['#/a/b', '#']]

    resolveRefs(obj, refs, { merge: true })

    expect(obj.a.b.root).toBe(obj.root)
    expect(obj.a.b.flag).toEqual('yep')
  })
})

describe('Hydrate refs', () => {
  it('Should be possible to filter out references', () => {
    const obj = {
      source: {
        nr: 1,
      },
      resolveThis: {
        $ref: '#/source',
      },
      notThis: {
        $ref: '#/source',
      },
    }

    const res = hydrateRefs(obj, {
      refFilter: ([x]) => x.startsWith('#/resolveThis'),
    })

    expect(res).toStrictEqual({
      source: { nr: 1 },
      resolveThis: { nr: 1 },
      notThis: { $ref: '#/source' },
    })
  })
})
