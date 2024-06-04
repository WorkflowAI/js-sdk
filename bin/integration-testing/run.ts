import { writeFileSync, unlinkSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert'

import { getPlaygroundSnippets } from '@workflowai/code-generator'
import { initWorkflowAIApi } from '@workflowai/api'

try {
  const apiUrl = process.env.TEST_API_URL as string
  const apiKey = process.env.TEST_API_KEY as string
  const taskId = process.env.TEST_TASK_ID as string
  const taskSchemaId = Number(process.env.TEST_TASK_SCHEMA_ID as string)

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const executedFilePath = join(__dirname, 'execute-task.test.ts')

  // Create api client
  const api = initWorkflowAIApi({
    url: apiUrl,
    key: apiKey,
  })

  // Fetch task schema
  const { data: taskSchemas } = await api.tasks.schemas.get({
    params: {
      path: {
        task_id: taskId,
        task_schema_id: taskSchemaId,
      }
    }
  })

  assert(taskSchemas, 'Failed to fetch task schemas')

  // Fetch a task run
  const { data: exampleTaskRuns } = await api.tasks.schemas.runs.list({
    params: {
      path: {
        task_id: taskId,
        task_schema_id: taskSchemaId,
      },
      query: {
        limit: 1,
        sort_by: 'recent',
      }
    }
  })

  const exampleTaskRun = exampleTaskRuns?.items?.[0]
  assert(exampleTaskRun, 'Failed to fetch task run')

  // Create snippets as they are created on the web
  const snippets = await getPlaygroundSnippets({
    api: {
      url: apiUrl,
      key: apiKey,
    },
    taskId,
    schema: {
      id: taskSchemaId,
      input: taskSchemas?.input_schema.json_schema,
      output: taskSchemas?.output_schema.json_schema,
    },
    groupIteration: exampleTaskRun.group.iteration,
    example: {
      input: exampleTaskRun.task_input,
      output: exampleTaskRun.task_output,
    },
  })

  // Write TS file with all the necessary snippets
  writeFileSync(executedFilePath, [
    snippets.initializeClient.code, 
    snippets.initializeTask.code, 
    snippets.runTask.code,
  ].join('\n\n\n'))

  // Execute TS file and get console output

  const runTaskResult = spawnSync('npx', [
    'tsx',
    executedFilePath
  ])

  assert(!runTaskResult.error, runTaskResult.error)

  const resultJs = runTaskResult.stdout.toString()

  // We can't do a JSON.parse because the output is not formated as JSON but as JS code (missing quotes etc)
  const taskRunOutput = eval(`(${resultJs})`)

  // Check that the code generated gave us the same output
  assert.deepStrictEqual(taskRunOutput, exampleTaskRun.task_output)

  console.log('Run task end-to-end passed')

  // Write TS file with all the necessary snippets
  writeFileSync(executedFilePath, [
    snippets.initializeClient.code, 
    snippets.initializeTask.code, 
    snippets.importTaskRun.code,
  ].join('\n\n\n'))

  // Execute TS file and get console output

  const importRunResult = spawnSync('npx', [
    'tsx',
    executedFilePath
  ])

  assert(!importRunResult.error, importRunResult.error)
  assert(!importRunResult.stderr.toString(), importRunResult.stderr.toString())
  assert(!importRunResult.stdout.toString(), importRunResult.stdout.toString())

  console.log('Import run end-to-end passed')

  // Delete test file we just wrote
  // unlinkSync(executedFilePath)
}
catch (error) {
  console.error(error)
  throw error
}