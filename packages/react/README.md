# WorkflowAI React SDK

A client side library to integrate with [WorkflowAI](workflowai.com)

## Usage

### Feedback

Collecting end user feedback is a very useful way to measure the health of an AI agent based feature.

All you need to send feedback to WorkflowAI is the `feedback_token` that is
provided by the run endpoint. The `feedback_token` is a signed token that
allows posting feedback to a single run. Once the feedback token is propagated
to your client application, we have a couple of different ways to send feedback
to WorkflowAI.

There can be only one feedback per token & user ID (including an anonymous User ID). So sending a new feedback for the same token / user ID pair will overwrite the existing ones.

#### Thumbs Up / Down component

The easiest way to integrate. A very simple 👍 / 👎 component that opens a feedback modal. This component maintains state so a returning customer will still be able to see its feedback.

```js
import { FeedbackButtons } from '@workflowai/react'

...
   <FeedbackButtons feedbackToken={...} userID={...} className='...'/>
...
```

#### Feedback Modal

A function to open the Feedback modal directly.

```js
import { openFeedbackModal } from '@workflowai/react'


openFeedbackModal({
    userID: "",
    feedbackToken: "",
    outcome: "",
    onSubmitted: (outcome) => {...},
})
```

#### Send / Get feedback functions

If more control is needed, the underlying api calls are also exposed as functions.

```js
import { getFeedback, sendFeedback } from '@workflowai/react';

await sendFeedback({
  feedbackToken: '',
  outcome: 'positive',
  comment: '',
  userID: '',
});

const outcome = getFeedback({ feedbackToken, userID });
```
