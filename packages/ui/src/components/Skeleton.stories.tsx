import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: {
    shape: 'card',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {};
export const Text: Story = { args: { shape: 'text' } };
export const Avatar: Story = { args: { shape: 'avatar' } };
export const Bar: Story = { args: { shape: 'bar' } };
