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
  // Replace any invalid character by an underscore
  const anyCase = text.replace(/[^a-z0-9_$]/gi, '_').replace(/_{2,}/g, '_')
  // Force the first character to be lower case
  return `${anyCase[0].toLowerCase()}${anyCase.substring(1)}`
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

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
    input: Json
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
  const { taskId, taskName, schema, groupId, example } = config

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
  apiKey: "...", // optional, defaults to process.env.WORKFLOWAI_API_KEY
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
