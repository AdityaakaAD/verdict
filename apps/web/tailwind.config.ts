import type { Config } from 'tailwindcss';

// Design tokens from spec section 11. Enforce strictly. Defaults are stripped
// or remapped where they conflict with the editorial aesthetic.
//
// Rules baked in:
//   - Only the 7 type sizes (11, 13, 15, 18, 22, 28, 36px). Default Tailwind
//     scale is replaced, not extended.
//   - Only weights 400 and 500.
//   - 0.5px borders via custom utility.
//   - No box shadows. The default shadow scale is removed.
//   - No background gradient utilities (kept off the safelist).

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    // Hard-replace, not extend, so we can't drift into the default scale.
    fontSize: {
      '11': ['11px', { lineHeight: '14px', letterSpacing: '0.08em' }],
      '13': ['13px', { lineHeight: '18px' }],
      '15': ['15px', { lineHeight: '22px' }],
      '18': ['18px', { lineHeight: '26px' }],
      '22': ['22px', { lineHeight: '30px' }],
      '28': ['28px', { lineHeight: '36px' }],
      '36': ['36px', { lineHeight: '44px' }],
    },
    fontWeight: {
      regular: '400',
      medium: '500',
    },
    borderRadius: {
      none: '0',
      sm: '6px',
      DEFAULT: '10px',
      md: '10px',
      lg: '12px',
      xl: '14px',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
    },
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          active: 'var(--border-active)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        vote: {
          a: 'var(--vote-a)',
          b: 'var(--vote-b)',
          neutral: 'var(--vote-neutral)',
        },
        success: 'var(--success)',
        gold: 'var(--gold)',
      },
      fontFamily: {
        serif: ['var(--font-lora)', 'Lora', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.08em',
      },
      transitionDuration: {
        '80': '80ms',
        '100': '100ms',
        '200': '200ms',
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '0' },
          '15%': { opacity: '0.9' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        flash: 'flash 80ms ease-out',
        'pulse-subtle': 'pulseSubtle 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
