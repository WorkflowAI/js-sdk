import { CSSProperties, useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { cls } from '../lib/cls.js';
import { sendFeedback } from '../lib/feedback_api.js';
import { Check } from './Check.js';
import styles from './FeedbackModal.module.css';
import { Loader } from './Loader.js';

export interface FeedbackModalProps {
  title?: string;
  description?: string;
  caption?: string;
  placeholder?: string;
  cancelButtonText?: string;
  submitButtonText?: string;
  isLoading?: boolean;
  onSubmit: (comment?: string) => void;
  onCancel?: () => void;
  isCompleted?: boolean;
}

function PoweredBy() {
  return (
    <div className={styles.powered_by}>
      Powered by
      <img
        src='https://workflowai.blob.core.windows.net/workflowai-public/workflowai_full_logo.svg'
        alt='WorkflowAI'
      />
    </div>
  );
}

function FeedbackModalTextContent(
  props: FeedbackModalProps & { style?: CSSProperties }
) {
  const {
    title = 'Give Feedback',
    description = 'Your feedback is important to us and will help us to improve our product.',
    caption = 'Add more details about your rating: (optional)',
    placeholder = 'Your feedback goes here...',
    cancelButtonText = 'Cancel',
    submitButtonText = 'Submit',
    isLoading = false,
    onSubmit,
    onCancel,
  } = props;
  const [comment, setComment] = useState<string>();
  return (
    <div style={props.style}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>
        <span className={styles.description}>{description}</span>
        <span className={styles.caption}>{caption}</span>

        <textarea
          className={styles.feedback_input}
          placeholder={placeholder}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <div className={styles.buttons}>
        <button className={styles.cancel_button} onClick={() => onCancel?.()}>
          {cancelButtonText}
        </button>
        <button
          className={cls(
            styles.submit_button,
            isLoading && styles.button_loading
          )}
          onClick={() => onSubmit?.(comment)}
          disabled={isLoading}
        >
          <Loader className={styles.spinner} />
          {submitButtonText}
        </button>
      </div>
      <div className={styles.watermark}>
        <PoweredBy />
      </div>
    </div>
  );
}

function FeedbackModalSuccessContent(
  props: Pick<FeedbackModalProps, 'onCancel'>
) {
  const { onCancel } = props;
  return (
    <div className={styles.thank_you}>
      <div className={styles.thank_you_content}>
        <div className={styles.thank_you_check}>
          <Check />
        </div>

        <div className={styles.thank_you_title}>Thank you!</div>
        <div className={styles.description}>
          Your feedback has been submitted.
        </div>
      </div>
      <div className={styles.thank_you_footer}>
        <PoweredBy />
        <button className={styles.submit_button} onClick={() => onCancel?.()}>
          Done
        </button>
      </div>
    </div>
  );
}

export function FeedbackModal(props: FeedbackModalProps) {
  return (
    <div className={styles.WorkflowAIFeedbackModal}>
      {props.isCompleted && (
        <FeedbackModalSuccessContent onCancel={props.onCancel} />
      )}

      <FeedbackModalTextContent
        {...props}
        style={{ visibility: props.isCompleted ? 'hidden' : 'visible' }}
      />
    </div>
  );
}

export interface FeedbackModalContainerProps
  extends Omit<FeedbackModalProps, 'onSubmit' | 'isLoading'> {
  feedbackToken: string;
  userID?: string;
  outcome: 'positive' | 'negative';
  onSubmitted?: (outcome: 'positive' | 'negative') => void;
}

export function FeedbackModalContainer(props: FeedbackModalContainerProps) {
  const { outcome, userID, feedbackToken, onSubmitted, ...rest } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onSubmit = useCallback(
    async (comment?: string) => {
      try {
        setIsLoading(true);
        await sendFeedback({
          userID,
          feedbackToken,
          comment,
          outcome,
        });
        setIsCompleted(true);
        onSubmitted?.(outcome);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [userID, feedbackToken, outcome, onSubmitted]
  );

  return (
    <div className={styles.WorkflowAIFeedbackModalContainer}>
      <FeedbackModal
        {...rest}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isCompleted={isCompleted}
      />
    </div>
  );
}

export function openFeedbackModal(args: {
  userID?: string;
  feedbackToken: string;
  outcome: 'positive' | 'negative';
  onSubmitted?: (outcome: 'positive' | 'negative') => void;
}) {
  // Create a container for the modal
  const modalContainer = document.createElement('div');
  document.body.appendChild(modalContainer);

  const root = createRoot(modalContainer);
  const { onSubmitted, ...rest } = args;

  // Handler to unmount and remove the modal from the DOM
  const handleClose = () => {
    root.unmount();
  };

  root.render(
    <FeedbackModalContainer
      {...rest}
      onCancel={handleClose}
      onSubmitted={onSubmitted}
    />
  );
}
