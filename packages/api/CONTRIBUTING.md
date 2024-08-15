## Install dependencies

```
npm i
```

## Generate types from OpenAPI specs

- Read OpenAPI specs from `https://api.workflowai.ai/openapi.json`
- Write corresponding TypeScript definitions in `src/generated/openapi.ts`
- Conversion is done by [openapi-typescript](https://www.npmjs.com/package/openapi-typescript)

```
WORKFLOWAI_API_URL=https://api.workflowai.ai npm run codegen
```

## Linter

Check for linting issues

```
npm run check
```

Auto-fix linting issues

```
npm run fix
```

## Build

- Output types, cjs and esm to `dist`

```
npm run build
```

## Publish

```
npm version [major|minor|patch]
npm pub
```
