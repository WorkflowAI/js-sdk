# workflowAI client

## Install workflowAI

```
npm install --save @workflowai/workflowai
```

## Initialize client

```ts
import { WorkflowAI } from '@workflowai/workflowai'

const workflowAI = new WorkflowAI({
  apiKey: '...', // optional, defaults to process.env.WORKFLOWAI_API_KEY
})
```

## Compile your task

```ts
import { z } from '@workflowai/workflowai'

const checkTextFollowInstructions = await workflowAI.compileTask({
  taskId: 'CheckTextFollowInstructions',
  schema: {
    id: 5
    input: z.object({
      text: z.string().describe('The text to check if it follows the instructions in "instructions"'),
      instructions: z.string().describe('The instructions to check if the text follows'),
    }),
    output: z.object({
      isFollowingInstructions: z.bool().describe('Whether the "text" follows all the instructions or not'),
      reason: z.string().describe('The reason why the text follows or not the instructions'),
    }),
  },
}, {
  // Default run configuration is optional if passed when runs are created
  group: {
    id: '...', // Find group IDs in the playground
  }
})
```

## Prepare your task input

Use the `TaskInput` TypeScript helper to infer the type of a task input.
Another helper, `TaskOutput`, can infer the type of what you can expect as result of a task run.

```ts
import { TaskInput } from '@workflowai/workflowai'

const input: TaskInput<typeof checkTextFollowInstructions> = {
  text: 'The capital of France is Barcelona',
  instructions: 'The text must be written in English',
}
```

## Run your task

```ts
const output = await checkTextFollowInstructions(input, {
  // Run configuration is optional if defaults were given at task compilation
  group: {
    id: '2',
  },
})

// `output` is of type `TaskOutput<typeof checkTextFollowInstructions>`

console.log(output.isFollowingInstructions) // Boolean, true
console.log(output.reason) // String, "The text is written in English"
```
