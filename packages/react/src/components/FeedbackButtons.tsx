import { useEffect, useRef, useState } from 'react';
import { cls } from '../lib/cls.js';
import { getFeedback } from '../lib/feedback_api.js';
import styles from './FeedbackButtons.module.css';
import { openFeedbackModal } from './FeedbackModal.js';
import { ThumbsDown } from './ThumbsDown.js';
import { ThumbsUp } from './ThumbsUp.js';

export interface FeedbackButtonsProps {
  userID?: string;
  feedbackToken: string;
  className?: string;
}

interface FeedbackButtonsPureProps {
  outcome?: 'positive' | 'negative';
  onOpenFeedbackModal: (outcome: 'positive' | 'negative') => void;
  className?: string;
}

export function FeedbackButtonsPure(props: FeedbackButtonsPureProps) {
  const { outcome, onOpenFeedbackModal, className } = props;

  return (
    <div className={cls(styles.WorkflowAIFeedbackButtons, className)}>
      <button
        onClick={() => onOpenFeedbackModal('positive')}
        disabled={outcome === 'positive'}
      >
        <ThumbsUp selected={outcome === 'positive'} />
      </button>
      <button
        onClick={() => onOpenFeedbackModal('negative')}
        disabled={outcome === 'negative'}
      >
        <ThumbsDown selected={outcome === 'negative'} />
      </button>
    </div>
  );
}

export function FeedbackButtons(props: FeedbackButtonsProps) {
  const { userID, feedbackToken, className } = props;
  const [outcome, setOutcome] = useState<'positive' | 'negative'>();

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (outcome) {
      return;
    }

    getFeedback({ feedbackToken, userID }).then((outcome) => {
      if (isMounted.current && outcome) {
        setOutcome(outcome);
      }
    });
    return () => {
      isMounted.current = false;
    };
  }, [feedbackToken, outcome, userID]);

  const onOpenFeedbackModal = (outcome: 'positive' | 'negative') => {
    openFeedbackModal({
      userID,
      feedbackToken,
      outcome,
      onSubmitted: setOutcome,
    });
  };

  return (
    <FeedbackButtonsPure
      outcome={outcome}
      onOpenFeedbackModal={onOpenFeedbackModal}
      className={className}
    />
  );
}
