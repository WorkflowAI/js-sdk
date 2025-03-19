import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackButtonsPure } from '@workflowai/react/components/FeedbackButtons';

const meta: Meta<typeof FeedbackButtonsPure> = {
  component: FeedbackButtonsPure,
};

export default meta;

type Story = StoryObj<typeof FeedbackButtonsPure>;

export const Default: Story = {
  args: {
    onOpenFeedbackModal: action('onOpenFeedbackModal'),
    outcome: 'positive',
  },
};
