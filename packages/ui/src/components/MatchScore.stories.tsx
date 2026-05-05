import type { Meta, StoryObj } from '@storybook/react';
import { MatchScore } from './MatchScore';

const meta = {
  title: 'Components/MatchScore',
  component: MatchScore,
  args: {
    value: 72,
  },
} satisfies Meta<typeof MatchScore>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Low: Story = { args: { value: 32 } };
export const Mid: Story = { args: { value: 55 } };
export const High: Story = { args: { value: 88 } };
