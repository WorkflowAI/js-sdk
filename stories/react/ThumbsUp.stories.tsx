import type { Meta, StoryObj } from '@storybook/react';
import { ThumbsUp } from '@workflowai/react/components/ThumbsUp';

const meta: Meta<typeof ThumbsUp> = {
  component: ThumbsUp,
};

export default meta;

type Story = StoryObj<typeof ThumbsUp>;

export const Default: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    selected: false,
  },
};
