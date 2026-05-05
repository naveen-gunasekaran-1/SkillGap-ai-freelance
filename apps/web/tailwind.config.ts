import type { Config } from 'tailwindcss';
import shared from '../../packages/config/tailwind.config';

export default {
  presets: [shared],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
} satisfies Config;
