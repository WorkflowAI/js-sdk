import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackModalContainer } from '@workflowai/react';

const meta: Meta<typeof FeedbackModalContainer> = {
  component: FeedbackModalContainer,
};

export default meta;

type Story = StoryObj<typeof FeedbackModalContainer>;

export const Default: Story = {
  args: {
    onCancel: action('onCancel'),
  },
  parameters: {
    layout: 'fullscreen',
  },
};
