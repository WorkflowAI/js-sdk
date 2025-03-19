import { WORKFLOW_AI_API_URL } from './consts.js';
import { cachedFetch } from './simpleFetch.js';

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

type GetFeedbackResponse = {
  outcome: FeedbackOutcome | null;
};

export async function getFeedback(req: {
  feedbackToken: string;
  userID?: string;
}) {
  const { feedbackToken, userID } = req;
  const queryParams = new URLSearchParams();
  queryParams.set('feedback_token', feedbackToken);
  if (userID) {
    queryParams.set('user_id', userID);
  }
  const data = await cachedFetch<GetFeedbackResponse>(
    `${WORKFLOW_AI_API_URL}/v1/feedback?${queryParams.toString()}`
  );
  return data.outcome ?? undefined;
}
