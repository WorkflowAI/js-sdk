import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackModal } from '@workflowai/react';

const meta: Meta<typeof FeedbackModal> = {
  component: FeedbackModal,
};

export default meta;

type Story = StoryObj<typeof FeedbackModal>;

export const Default: Story = {
  args: {
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Loading: Story = {
  args: {
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
    isLoading: true,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Completed: Story = {
  args: {
    onSubmit: action('onSubmit'),
    onCancel: action('onCancel'),
    isCompleted: true,
  },
};
