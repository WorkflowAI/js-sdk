import { sendFeedback } from 'lib/send_feedback';
import { useCallback, useState } from 'react';
import { createRoot } from 'react-dom/client';
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
}

export function FeedbackModal(props: FeedbackModalProps) {
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
    <div className={styles.WorkflowAIFeedbackModal}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>
        <span className={styles.description}>{description}</span>
        <span className={styles.caption}>{caption}</span>

        <div className={styles.input_container}>
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
            className={styles.submit_button}
            onClick={() => onSubmit?.(comment)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className={styles.spinner} />
            ) : (
              submitButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface FeedbackModalContainerProps
  extends Omit<FeedbackModalProps, 'onSubmit' | 'isLoading'> {
  feedback_token: string;
  user_id?: string;
  outcome: 'positive' | 'negative';
}

export function FeedbackModalContainer(props: FeedbackModalContainerProps) {
  const { outcome, user_id, feedback_token, onCancel, ...rest } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(
    async (comment?: string) => {
      try {
        setIsLoading(true);
        await sendFeedback({
          user_id,
          feedback_token,
          comment,
          outcome,
        });
        onCancel?.();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [user_id, feedback_token, outcome, onCancel]
  );

  return <FeedbackModal {...rest} onSubmit={onSubmit} isLoading={isLoading} />;
}

export function openFeedbackModal(args: {
  user_id?: string;
  feedback_token: string;
  outcome: 'positive' | 'negative';
}) {
  const root = createRoot(document.body);

  // Handler to unmount and remove the modal from the DOM
  const handleClose = () => {
    root.unmount();
  };

  root.render(<FeedbackModalContainer {...args} onCancel={handleClose} />);
}
