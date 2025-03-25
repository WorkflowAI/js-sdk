import type { Meta, StoryObj } from '@storybook/react';
import { ThumbsDown } from '@workflowai/react/components/ThumbsDown';

const meta: Meta<typeof ThumbsDown> = {
  component: ThumbsDown,
};

export default meta;

type Story = StoryObj<typeof ThumbsDown>;

export const Default: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    selected: false,
  },
};
