import {
  inputSchemaToZod,
  JsonSchemaObject,
  outputSchemaToZod,
} from '@workflowai/schema'

import { beautifyTypescript } from './beautify.js'

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

const cleanZodDescribe = (code: string, asComments: boolean): string => {
  const lines = code.split('\n')
  const cleanLines = lines.map((line) => {
    return line.replace(
      /^(\s*)(("[^"]+": z\.)?.*)\.describe\("([^"]+)"\)/,
      (_match, indents, pre, prop, description) => {
        if (prop && asComments) {
          return `${indents}/**\n${indents} * ${description}\n${indents} */\n${indents}${pre}`
        } else {
          return `${indents}${pre}`
        }
      },
    )
  })

  return cleanLines.join('\n')
}

export enum FileDataProvider {
  FILE_SYSTEM = 'fs-promise',
  FETCH = 'fetch',
  AXIOS = 'axios',
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
  group: { iteration: number } | { environment: string }
  example: {
    input: Record<string, unknown>
    output: Record<string, unknown>
  }
  api?: {
    key?: string | null | undefined
    url?: string | null | undefined
  }
  fileDataProvider?: FileDataProvider
  descriptionAsComments?: boolean
}

type GetPlaygroundSnippetsResult = {
  isUsingFileDataProvider: boolean
  installSdk: GeneratedCode
  initializeClient: GeneratedCode
  initializeTask: GeneratedCode
  runTask: GeneratedCode
  streamRunTask: GeneratedCode
  importTaskRun: GeneratedCode
}

const base64DataToFileDataProvider = (
  str: string,
  fileDataProvider: FileDataProvider,
): string => {
  return str.replace(
    /"[-A-Za-z0-9+/]{50,}={0,3}"/g,
    {
      [FileDataProvider.FILE_SYSTEM]: 'readFile("/path/to/file")',
      [FileDataProvider.FETCH]:
        '(await fetch("http://url.to/file")).arrayBuffer()',
      [FileDataProvider.AXIOS]:
        '(await axios.get("http://url.to/file", { responseType: "arraybuffer" })).data',
    }[fileDataProvider],
  )
}

export const getPlaygroundSnippets = async (
  config: GetPlaygroundSnippetsConfig,
): Promise<GetPlaygroundSnippetsResult> => {
  const {
    taskId,
    taskName,
    schema,
    group,
    example,
    api,
    fileDataProvider = FileDataProvider.FILE_SYSTEM,
    descriptionAsComments,
  } = {
    ...config,
  }

  const taskFunctionName = validVarName(taskName || taskId)
  const importRunFunctionName = validVarName(`import ${taskFunctionName} run`)
  const _stringifiedInput = JSON.stringify(example.input, null, 2)
  const _stringifiedOutput = JSON.stringify(example.output, null, 2)
  const beautifiedInput = base64DataToFileDataProvider(
    _stringifiedInput,
    fileDataProvider,
  )
  const beautifiedOutput = base64DataToFileDataProvider(
    _stringifiedOutput,
    fileDataProvider,
  )
  const isUsingFileDataProvider =
    beautifiedInput !== _stringifiedInput ||
    beautifiedOutput !== _stringifiedOutput

  const fileProviderImport = {
    'fs-promise': 'import { readFile } from "fs/promises"',
    fetch: '',
    axios: 'import axios from "axios"',
  }[fileDataProvider]

  return {
    isUsingFileDataProvider,

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

    initializeTask: {
      language: 'typescript',
      code: `
import { z } from "@workflowai/workflowai"

${cleanZodDescribe(
  beautifyTypescript(`const { run: ${taskFunctionName}, importRun: ${importRunFunctionName} } = await workflowAI.useTask({
  taskId: "${taskId}",
  schema: {
    id: ${schema.id},
    input: ${await inputSchemaToZod(schema.input)},
    output: ${await outputSchemaToZod(schema.output)},
  },
}, {
  group: ${JSON.stringify(group)},
})`),
  !!descriptionAsComments,
)}
      `.trim(),
    },

    runTask: {
      language: 'typescript',
      code: `
${[
  'import { TaskInput } from "@workflowai/workflowai"',
  isUsingFileDataProvider && fileProviderImport,
]
  .filter(Boolean)
  .join('\n')}

const input: TaskInput<typeof ${taskFunctionName}> = ${beautifiedInput}

const { output } = await ${taskFunctionName}(input)

console.log(output)
`.trim(),
    },

    streamRunTask: {
      language: 'typescript',
      code: `
${[
  'import { TaskInput } from "@workflowai/workflowai"',
  isUsingFileDataProvider && fileProviderImport,
]
  .filter(Boolean)
  .join('\n')}

const input: TaskInput<typeof ${taskFunctionName}> = ${beautifiedInput}

const { stream } = await ${taskFunctionName}(input).stream()

for await (const { output, partialOutput } of stream) {
  console.log(output) // Conforms to output schema
  console.log(partialOutput) // All properties of output schema are optional
}
`.trim(),
    },

    importTaskRun: {
      language: 'typescript',
      code: `
${[
  'import { TaskInput, TaskOutput } from "@workflowai/workflowai"',
  isUsingFileDataProvider && fileProviderImport,
]
  .filter(Boolean)
  .join('\n')}

const input: TaskInput<typeof ${importRunFunctionName}> = ${beautifiedInput}
const output: TaskOutput<typeof ${importRunFunctionName}> = ${beautifiedOutput}

await ${importRunFunctionName}(input, output, {
  group: {
    properties: {
      provider: "openai",
      model: "gpt-4o-2024-05-13",
      temperature: 0,
    }
  }
})
`.trim(),
    },
  }
}
