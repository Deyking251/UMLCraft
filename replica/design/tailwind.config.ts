import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-subtle": "var(--color-surface-subtle)",
        "surface-inverse": "var(--color-surface-inverse)",
        border: "var(--color-border)",
        "border-input": "var(--color-border-input)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "text-on-inverse": "var(--color-text-on-inverse)",
        accent: "var(--color-accent)",
        "on-accent": "var(--color-on-accent)",
        "accent-soft": "var(--color-accent-soft)",
        "on-accent-soft": "var(--color-on-accent-soft)",
        focus: "var(--color-focus)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        canvas: "var(--color-canvas)",
        "canvas-grid": "var(--color-canvas-grid)",
        "node-fill": "var(--color-node-fill)",
        "node-stroke": "var(--color-node-stroke)",
        "selection-fill": "var(--color-selection-fill)",
        "selection-stroke": "var(--color-selection-stroke)",
        relationship: "var(--color-relationship)"
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)"
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
        node: "var(--shadow-node)"
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        base: "var(--motion-base)",
        slow: "var(--motion-slow)"
      },
      transitionTimingFunction: {
        studio: "var(--motion-ease)"
      },
      spacing: {
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)"
      }
    }
  },
  plugins: []
} satisfies Config;

export default config;
