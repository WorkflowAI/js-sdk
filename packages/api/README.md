# workflowAI typed API client

Wrapper for workflowAI's OpenAPI specs, for node or browser

## Install

```
npm install @workflowai/api
```

## Initialize API

```ts
import { initWorkflowAIApi } from '@workflowai/api'

const workflowAIApi = initWorkflowAIApi({
  apiKey: '...', // optional, defaults to process.env.WORKFLOWAI_API_KEY
  apiUrl: '...', // optional, defaults to process.env.WORKFLOWAI_API_URL, then to https://api.workflowai.ai
  use: [], // optional, fetch middlewares
})
```

## Call endpoints

```ts
const { data: list } = await workflowAIApi.models.list()

console.log(list.models[0].providers[0].name)

const { data: run } = await workflowaiApi.runs.annotate({
  run_id: '1',
  score: 1,
})

console.log(run.scores)
```
