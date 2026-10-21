/**
 * HealthGauge stories — closes #1241
 *
 * Acceptance criteria:
 *  ✓ Arc gauge renders with three colour zones (green ≥ 1.5, amber 1.0–1.5, red < 1.0)
 *  ✓ Needle animates smoothly when HF value changes
 *  ✓ Current HF value displayed in the centre
 *  ✓ Reduced-motion preference disables animation
 *  ✓ Storybook story covers all three zones (Safe / AtRisk / Critical)
 */
import type { Meta, StoryObj } from '@storybook/react';
import HealthGauge from './HealthGauge';

const meta: Meta<typeof HealthGauge> = {
  title: 'Components/HealthGauge',
  component: HealthGauge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Animated arc gauge displaying the health factor of a loan position. ' +
          'Three colour zones: green (HF ≥ 1.5), amber (1.0 – 1.5), red (HF < 1.0). ' +
          '`value` is expressed in basis points (10 000 = 1.0). ' +
          'Needle animates smoothly on value changes; animation is suppressed when the ' +
          '`prefers-reduced-motion` media query is active. ' +
          'Pass `history` to enable chart mode. Pass `loading` to render a skeleton placeholder.',
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 30000, step: 100 },
      description: 'Health factor in basis points (10 000 = 1.0)',
    },
    loading: {
      control: 'boolean',
      description: 'When true, renders a skeleton placeholder instead of the live gauge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HealthGauge>;

// ── Zone 1: Safe (green, HF ≥ 1.5) ──────────────────────────────────────────

/**
 * GREEN zone — Health factor 2.4, well above the 1.5 safe threshold.
 * Arc fill and centre value text render in green.
 */
export const Safe: Story = {
  args: { value: 24_000 },
  parameters: {
    docs: {
      description: {
        story:
          'GREEN zone (HF ≥ 1.5): Health factor 2.4. ' +
          'Arc fill and centre text render in green. Needle points toward the right.',
      },
    },
  },
};

/**
 * GREEN zone — Health factor exactly 1.5 (boundary of safe zone).
 */
export const BoundarySafe: Story = {
  args: { value: 15_000 },
  parameters: {
    docs: {
      description: {
        story: 'GREEN zone boundary: HF exactly 1.5.',
      },
    },
  },
};

// ── Zone 2: At-risk (amber, 1.0 ≤ HF < 1.5) ─────────────────────────────────

/**
 * AMBER zone — Health factor 1.3, below 1.5 but above the 1.0 liquidation threshold.
 * Arc fill and centre value text render in amber.
 */
export const AtRisk: Story = {
  args: { value: 13_000 },
  parameters: {
    docs: {
      description: {
        story:
          'AMBER zone (1.0 ≤ HF < 1.5): Health factor 1.3. ' +
          'Arc fill and centre text render in amber. Position is at risk of liquidation.',
      },
    },
  },
};

/**
 * AMBER zone — Health factor exactly 1.0 (liquidation boundary).
 */
export const BoundaryLiquidation: Story = {
  args: { value: 10_000 },
  parameters: {
    docs: {
      description: {
        story: 'AMBER/RED boundary: HF exactly 1.0 — at the liquidation threshold.',
      },
    },
  },
};

// ── Zone 3: Danger (red, HF < 1.0) ───────────────────────────────────────────

/**
 * RED zone — Health factor 0.9, below 1.0 and eligible for liquidation.
 * Arc fill and centre value text render in red.
 */
export const Critical: Story = {
  args: { value: 9_000 },
  parameters: {
    docs: {
      description: {
        story:
          'RED zone (HF < 1.0): Health factor 0.9. ' +
          'Arc fill and centre text render in red. Position is eligible for liquidation.',
      },
    },
  },
};

/**
 * RED zone — extreme case near zero.
 */
export const NearZero: Story = {
  args: { value: 2_500 },
  parameters: {
    docs: {
      description: {
        story: 'RED zone — HF 0.25, severely under-collateralised.',
      },
    },
  },
};

// ── Reduced-motion ────────────────────────────────────────────────────────────

/**
 * Demonstrates that the gauge renders correctly when `prefers-reduced-motion`
 * is active. Storybook cannot programmatically set the OS-level media query,
 * but the component reads `useReducedMotion()` from framer-motion and sets all
 * CSS transition durations to `0s`, so the needle and arc snap immediately to
 * their final positions.
 *
 * To test manually: enable "Reduce motion" in your OS accessibility settings
 * and reload this story.
 */
export const ReducedMotion: Story = {
  args: { value: 17_500 },
  parameters: {
    docs: {
      description: {
        story:
          'When `prefers-reduced-motion: reduce` is active, all CSS transitions ' +
          'are set to 0 s. Enable "Reduce motion" in your OS settings to verify.',
      },
    },
  },
};

// ── Loading state ─────────────────────────────────────────────────────────────

/** Skeleton placeholder rendered while health factor data is loading. */
export const Loading: Story = {
  args: { value: 0, loading: true },
  parameters: {
    docs: {
      description: {
        story: 'When `loading` is true, a shimmer skeleton replaces the live gauge.',
      },
    },
  },
};

// ── Chart mode (history time-series) ─────────────────────────────────────────

const generateHistory = (days: number, startBps: number, trend: number) => {
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(now - (days - i) * 86_400_000).toISOString(),
    value: Math.max(5_000, startBps + trend * i + Math.round((Math.random() - 0.5) * 500)),
  }));
};

/** Chart mode — 30-day history trending upward (recovering health factor). */
export const ChartRecovering: Story = {
  args: {
    value: 18_000,
    history: generateHistory(30, 10_000, 280),
  },
  parameters: {
    docs: {
      description: {
        story:
          '30-day history showing a recovering health factor (trending upward). ' +
          'Hover data points to reveal the tooltip.',
      },
    },
  },
};

/** Chart mode — 30-day history trending downward (deteriorating position). */
export const ChartDeteriorating: Story = {
  args: {
    value: 11_000,
    history: generateHistory(30, 24_000, -450),
  },
  parameters: {
    docs: {
      description: {
        story: '30-day history showing a deteriorating health factor (trending downward).',
      },
    },
  },
};

/** Chart mode with minimal history (2 data points). */
export const ChartMinimalHistory: Story = {
  args: {
    value: 16_000,
    history: [
      { date: new Date(Date.now() - 86_400_000).toISOString(), value: 14_000 },
      { date: new Date().toISOString(), value: 16_000 },
    ],
  },
};

/** Chart mode — loading state with history prop still provided. */
export const ChartLoading: Story = {
  args: {
    value: 0,
    loading: true,
    history: [],
  },
};
