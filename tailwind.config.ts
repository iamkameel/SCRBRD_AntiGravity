import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		container: {
			center: true,
			padding: { DEFAULT: "1rem", md: "2rem", xl: "3rem" },
			screens: {
				"2xl": "1600px",
			},
		},
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)", "system-ui", "sans-serif"],
				open: ["var(--font-sans)", "system-ui", "sans-serif"],
				mono: ["var(--font-mono)", "ui-monospace", "monospace"],
				head: ["var(--font-head)", "system-ui", "sans-serif"],
			},
			fontSize: {
				"display-xl": ["4.5rem", { lineHeight: "0.95", letterSpacing: "-0.025em" }],
				"display-l": ["3.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
				"heading-xl": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
				"heading-l": ["1.875rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
				"heading-m": ["1.5rem", { lineHeight: "1.2" }],
				"heading-s": ["1.125rem", { lineHeight: "1.3" }],
				"body-l": ["1.0625rem", { lineHeight: "1.55" }],
				"body-m": ["0.9375rem", { lineHeight: "1.55" }],
				"body-s": ["0.8125rem", { lineHeight: "1.5" }],
				label: ["0.75rem", { lineHeight: "1.3", letterSpacing: "0.04em" }],
				micro: ["0.6875rem", { lineHeight: "1.3", letterSpacing: "0.06em" }],
			},
			transitionDuration: {
				control: "180ms",
				panel: "260ms",
				major: "420ms",
				event: "1000ms",
			},
			transitionTimingFunction: {
				standard: "cubic-bezier(.2, 0, 0, 1)",
				spring: "cubic-bezier(.34, 1.4, .64, 1)",
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				// Design 2.0 — spectral accents and semantic states
				brand: 'var(--scrbrd-lime)',
				lime: 'var(--scrbrd-lime)',
				acid: 'var(--scrbrd-acid)',
				green: 'var(--scrbrd-green)',
				cyan: 'var(--scrbrd-cyan)',
				cobalt: 'var(--scrbrd-cobalt)',
				midnight: 'var(--scrbrd-midnight)',
				yellow: 'var(--scrbrd-yellow)',
				positive: 'var(--state-positive)',
				warning: 'var(--state-warning)',
				critical: 'var(--state-critical)',
				info: 'var(--state-info)',
				neutral: 'var(--state-neutral)',
				surface: {
					0: 'var(--surface-0)',
					1: 'var(--surface-1)',
					2: 'var(--surface-2)',
					3: 'var(--surface-3)',
					4: 'var(--surface-4)',
				},
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				'fox-blue': '#00ADEE',
				'fox-gold': '#FEC50C',
				'team-aus': '#FEC50C',
				'team-ind': '#1C4FA1',
				'team-eng': '#003F70',
				'team-sa': '#007A3E',
				'field-green': '#357a38',
				'field-green-light': '#66bb6a',
				'cricket-green': {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d'
				},
			},
			// §10 shape scale. Existing classes keep their relative intent:
			// md/xl were the control and card radii before, so they land on
			// the spec's control (10) and card (16) steps; 2xl/3xl on panel (22)
			// and hero (30). rounded-full stays the pill.
			borderRadius: {
				sm: 'var(--radius-sm)',
				md: 'var(--radius-sm)',
				lg: 'var(--radius-md)',
				xl: 'var(--radius-md)',
				'2xl': 'var(--radius-lg)',
				'3xl': 'var(--radius-xl)',
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
				'slide-in-left': {
					'0%': { transform: 'translateX(-20%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(20%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'pulse-fast': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'shimmer': {
					'100%': { transform: 'translateX(100%)' },
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '1', filter: 'brightness(1)' },
					'50%': { opacity: '0.8', filter: 'brightness(1.2)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'pulse-fast': 'pulse-fast 1s cubic-bezier(0.4, 0, 1, 1) infinite',
				'float': 'float 6s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
