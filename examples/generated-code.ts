// Code generated from API docs


/**
 * Initialize workflowAI client
 */

import { WorkflowAI } from "@workflowai/workflowai"

const workflowAI = new WorkflowAI({
  api: {
    url: "https://api.workflowai.dev",
    // optional, defaults to process.env.WORKFLOWAI_API_KEY
    key: "[your key here]"
  }
})

/**
 * Initialize your task
 */

import { z } from "@workflowai/workflowai"

const {
  run: getCelebrityLastName
} = await workflowAI.useTask({
  taskId: "get-celebrity-last-name",
  schema: {
    id: 1,
    input: z.object({
      "first_name": z.string()
    }),
    output: z.object({
      "last_name": z.string()
    }),
  },
}, {
  group: {
    iteration: 6,
  },
})

/**
 * Run your task
 */

import { TaskInput } from "@workflowai/workflowai"

const input: TaskInput<typeof getCelebrityLastName> = {
  "first_name": "Thierry"
}

const { output } = await getCelebrityLastName(input)

console.log(output)