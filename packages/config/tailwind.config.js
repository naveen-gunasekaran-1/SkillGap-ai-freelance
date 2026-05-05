module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', dark: '#1E40AF', light: '#DBEAFE' },
        ai: { purple: '#7C3AED', cyan: '#06B6D4' },
        surface: '#FFFFFF',
        border: '#E5E7EB',
        background: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      borderRadius: {
        card: '12px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
