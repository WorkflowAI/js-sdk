import { WORKFLOW_AI_API_URL } from './consts.js';

export type FeedbackOutcome = 'positive' | 'negative';

type CreateFeedbackRequest = {
  feedback_token: string;
  outcome: FeedbackOutcome;
  comment?: string;
  user_id?: string;
};

export async function sendFeedback(req: {
  feedbackToken: string;
  outcome: FeedbackOutcome;
  comment?: string;
  userID?: string;
}) {
  const { feedbackToken, outcome, comment, userID } = req;
  const body: CreateFeedbackRequest = {
    feedback_token: feedbackToken,
    outcome,
    comment,
    user_id: userID,
  };

  const response = await fetch(`${WORKFLOW_AI_API_URL}/v1/feedback`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to send feedback');
  }
}
