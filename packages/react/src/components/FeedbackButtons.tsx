import { cls } from '../lib/cls.js';
import styles from './FeedbackButtons.module.css';
import { openFeedbackModal } from './FeedbackModal.js';
import { ThumbsDown } from './ThumbsDown.js';
import { ThumbsUp } from './ThumbsUp.js';

export interface FeedbackButtonsProps {
  userID?: string;
  feedbackToken: string;
  className?: string;
}

export function FeedbackButtons(props: FeedbackButtonsProps) {
  const { userID, feedbackToken, className } = props;

  return (
    <div className={cls(styles.WorkflowAIFeedbackButtons, className)}>
      <button
        onClick={() =>
          openFeedbackModal({ userID, feedbackToken, outcome: 'positive' })
        }
      >
        <ThumbsUp />
      </button>
      <button
        onClick={() =>
          openFeedbackModal({ userID, feedbackToken, outcome: 'negative' })
        }
      >
        <ThumbsDown />
      </button>
    </div>
  );
}
