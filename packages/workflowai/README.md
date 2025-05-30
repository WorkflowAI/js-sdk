# Javascript / Typescript SDK for WorkflowAI

[![WorkflowAI](./examples/assets/readme-header.png)](https://workflowai.com)

[![npm version](https://img.shields.io/npm/v/@workflowai/workflowai.svg)](https://www.npmjs.com/package/@workflowai/workflowai)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## WorkflowAI

[WorkflowAI](https://workflowai.com) is a low-code tool for product managers and software engineers
that makes it easier to ship features powered by AI.

## Get Started

1. Go to [workflowai.com](https://workflowai.com).
2. Enter your company URL, and get suggestions of AI-powered features for your product.
3. Build your first AI features in a few minutes.
4. Then go to the **Code** section to copy the code generated for Typescript.

[![Code Section](./examples/assets/code-section.png)](https://workflowai.com/docs/agents/get-capital-info/1/code)

## Example Syntax

```ts
// Initialize WorkflowAI Client
import { WorkflowAI } from '@workflowai/workflowai';

const workflowAI = new WorkflowAI({
  // optional, defaults to process.env.WORKFLOWAI_API_KEY
  // key: // Add your API key here
});

// Initialize Your AI agent
export interface GetCapitalInfoInput {
  city: string;
}

export interface GetCapitalInfoOutput {
  country: string;
  capital: string;
  fun_fact: string;
}

const getCapitalInfo = workflowAI.agent<
  GetCapitalInfoInput,
  GetCapitalInfoOutput
>({
  id: 'get-capital-info',
  schemaId: 1,
  version: '1.4',
  // Cache options (can also be passed to the run function):
  // - "auto" (default): if a previous run exists with the same version and input, and if
  // the temperature is 0, the cached output is returned
  // - "always": the cached output is returned when available, regardless
  // of the temperature value
  // - "never": the cache is never used
  useCache: 'auto',
  // Customize model fallback,  (can also be passed to the run function):
  // - defaults to 'auto' meaning that the model to fallback to is picked by WorkflowAI
  // The selected model is in the same price range and depends on the error that was triggered
  // - "never": the fallback is never used
  // - list of model names: models to try in order after the primary model fails
  useFallback: ['gpt-4o-mini', 'gpt-4o'],
});

// Run Your AI agent
async function getCapitalInfoRun() {
  const input: GetCapitalInfoInput = {
    city: 'Wellington',
  };

  try {
    const {
      output,
      data: { duration_seconds, cost_usd, version },
    } = await getCapitalInfo(input);

    // Also possible to pass options to the run function:
    // const { output } = await getCapitalInfo(input, {
    //   useCache: 'always',
    //   useFallback: 'never',
    // });

    console.log(output);
    console.log('\nModel: ', version?.properties?.model);
    console.log('Cost: $', cost_usd);
    console.log('Latency: ', duration_seconds?.toFixed(2), 's');
  } catch (error) {
    console.error('Failed to run :', error);
  }
}
```
