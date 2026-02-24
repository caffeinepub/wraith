import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                mono: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
                display: ['Orbitron', 'Rajdhani', 'sans-serif'],
                body: ['Rajdhani', '"Share Tech Mono"', 'monospace'],
            },
            colors: {
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                amber: {
                    ops: 'oklch(0.75 0.15 75)',
                    dim: 'oklch(0.6 0.12 75)',
                    glow: 'oklch(0.85 0.18 85)',
                },
                red: {
                    ops: 'oklch(0.6 0.22 25)',
                    dim: 'oklch(0.45 0.18 25)',
                },
                green: {
                    ops: 'oklch(0.7 0.2 145)',
                    dim: 'oklch(0.55 0.15 145)',
                },
                ops: {
                    bg: 'oklch(0.1 0.005 240)',
                    surface: 'oklch(0.13 0.008 240)',
                    border: 'oklch(0.25 0.01 240)',
                    text: 'oklch(0.9 0.01 80)',
                    muted: 'oklch(0.55 0.01 80)',
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                none: '0px',
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                'amber-glow': '0 0 8px oklch(0.75 0.15 75 / 50%), 0 0 20px oklch(0.75 0.15 75 / 20%)',
                'red-glow': '0 0 8px oklch(0.6 0.22 25 / 50%), 0 0 20px oklch(0.6 0.22 25 / 20%)',
                'green-glow': '0 0 8px oklch(0.7 0.2 145 / 50%), 0 0 20px oklch(0.7 0.2 145 / 20%)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'pulse-amber': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'pulse-amber': 'pulse-amber 2s ease-in-out infinite',
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
