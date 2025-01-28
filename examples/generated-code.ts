import { Input, WorkflowAI, z } from '@workflowai/workflowai';

// Code generated from API docs

/**
 * Initialize workflowAI client
 */

const workflowAI = new WorkflowAI({
  api: {
    url: 'https://api.workflowai.dev',
    // optional, defaults to process.env.WORKFLOWAI_API_KEY
    key: '[your key here]',
  },
});

/**
 * Initialize your task
 */

const { run: getCelebrityLastName } = workflowAI.agent(
  {
    taskId: 'get-celebrity-last-name',
    schema: {
      id: 1,
      input: z.object({
        first_name: z.string(),
      }),
      output: z.object({
        last_name: z.string(),
      }),
    },
  },
  {
    version: 6,
  }
);

/**
 * Run your task
 */

const input: Input<typeof getCelebrityLastName> = {
  first_name: 'Thierry',
};

const { output } = await getCelebrityLastName(input);

console.log(output);
