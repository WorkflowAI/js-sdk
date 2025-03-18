import styles from './FeedbackButtons.module.css';
import { openFeedbackModal } from './FeedbackModal.js';
import { ThumbsDown } from './ThumbsDown.js';
import { ThumbsUp } from './ThumbsUp.js';

export interface FeedbackButtonsProps {
  user_id?: string;
  feedback_token: string;
}

export function FeedbackButtons(props: FeedbackButtonsProps) {
  const { user_id, feedback_token } = props;

  return (
    <div className={styles.WorkflowAIFeedbackButtons}>
      <button
        onClick={() =>
          openFeedbackModal({ user_id, feedback_token, outcome: 'positive' })
        }
      >
        <ThumbsUp />
      </button>
      <button
        onClick={() =>
          openFeedbackModal({ user_id, feedback_token, outcome: 'negative' })
        }
      >
        <ThumbsDown />
      </button>
    </div>
  );
}
