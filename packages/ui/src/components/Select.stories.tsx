import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Role',
    options: [
      { label: 'Candidate', value: 'candidate' },
      { label: 'Company', value: 'company' },
    ],
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithError: Story = { args: { error: 'Please choose a role' } };
