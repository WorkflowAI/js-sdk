import {
  inputSchemaToZod,
  JsonSchemaObject,
  outputSchemaToZod,
} from '@workflowai/schema'

import { beautifyTypescript } from './beautify'

/**
 * Transform a string into a valid TS/JS var name
 * Not strict.
 * @param text any text, like a task ID for example
 */
const validVarName = (text: string): string => {
  // Remove dashes and spaces by concatenating and upper casing
  const noDashes = text
    .trim()
    .split(/-|\s/)
    .map((part) => `${part.substring(0, 1).toUpperCase()}${part.substring(1)}`)
    .join('')

  // Replace any invalid character by an dash
  const anyCase = noDashes.replace(/[^a-z0-9_$]/gi, '_').replace(/_{2,}/g, '_')

  // Force the first character to be lower case
  return `${anyCase.substring(0, 1).toLowerCase()}${anyCase.substring(1)}`
}

type GeneratedCode = {
  language: 'bash' | 'typescript'
  code: string
}

type GetPlaygroundSnippetsConfig = {
  taskId: string
  taskName?: string
  schema: {
    id: number
    input: JsonSchemaObject
    output: JsonSchemaObject
  }
  groupId: string
  example: {
    input: Record<string, unknown>
  }
  api?: {
    key?: string | null | undefined
    url?: string | null | undefined
  }
}

type GetPlaygroundSnippetsResult = {
  installSdk: GeneratedCode
  initializeClient: GeneratedCode
  compileTask: GeneratedCode
  runTask: GeneratedCode
}

export const getPlaygroundSnippets = async (
  config: GetPlaygroundSnippetsConfig,
): Promise<GetPlaygroundSnippetsResult> => {
  const { taskId, taskName, schema, groupId, example, api } = config

  const taskFunctionName = validVarName(taskName || taskId)

  return {
    installSdk: {
      language: 'bash',
      code: `
npm install @workflowai/workflowai       # npm
yarn add @workflowai/workflowai          # yarn
        `.trim(),
    },

    initializeClient: {
      language: 'typescript',
      code: `
import { WorkflowAI } from "@workflowai/workflowai"

const workflowAI = new WorkflowAI({
  api: {${
    api?.url
      ? `
    url: "${api.url}",`
      : ''
  }
    // optional, defaults to process.env.WORKFLOWAI_API_KEY
    key: "${api?.key || '...'}"
  }
})
      `.trim(),
    },

    compileTask: {
      language: 'typescript',
      code: `
import { z } from "@workflowai/workflowai"

${beautifyTypescript(`const ${taskFunctionName} = await workflowAI.compileTask({
  taskId: "${taskId}",
  schema: {
    id: ${schema.id},
    input: ${await inputSchemaToZod(schema.input)},
    output: ${await outputSchemaToZod(schema.output)},
  },
}, {
  group: {
    id: "${groupId}",
  },
})`)}
      `.trim(),
    },

    runTask: {
      language: 'typescript',
      code: `
import { TaskInput } from "@workflowai/workflowai"

${`const input: TaskInput<typeof ${taskFunctionName}> = ${beautifyTypescript(JSON.stringify(example.input))}`}

const output = await ${taskFunctionName}(input)
      `.trim(),
    },
  }
}
