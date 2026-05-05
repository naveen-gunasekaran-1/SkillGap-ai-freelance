import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkillTag } from './SkillTag';

const meta = {
  title: 'Components/SkillTag',
  component: SkillTag,
  args: {
    children: 'React',
  },
} satisfies Meta<typeof SkillTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Match: Story = {};
export const Partial: Story = { args: { severity: 'partial', children: 'TypeScript' } };
export const Critical: Story = { args: { severity: 'critical', children: 'AWS' } };
