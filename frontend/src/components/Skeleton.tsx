/**
 * Skeleton — reusable loading placeholder component (#1065).
 *
 * Renders an animated shimmer block that mimics the shape of the content
 * it will replace. Uses the `skeleton-shimmer` CSS class defined in
 * globals.css which transitions between --color-skeleton-base and
 * --color-skeleton-shine, both of which flip automatically in dark mode.
 *
 * Variants:
 * - text      : single-line text row (default height h-4)
 * - heading   : larger text row (h-7)
 * - avatar    : square thumbnail (h-12 w-12)
 * - card      : taller card-shaped block (h-32)
 * - button    : button-sized block (h-10 w-24)
 * - badge     : pill badge (h-5 w-16 rounded-full)
 * - circle    : circle (h-10 w-10 rounded-full)
 * - custom    : no preset — use className to specify dimensions
 *
 * All variants accept an optional className override.
 */

export type SkeletonVariant =
  | 'text'
  | 'heading'
  | 'avatar'
  | 'card'
  | 'button'
  | 'badge'
  | 'circle'
  | 'custom';

interface SkeletonProps {
  /** Visual variant — controls default dimensions and border-radius. */
  variant?: SkeletonVariant;
  /** Additional Tailwind classes (merged after variant defaults). */
  className?: string;
}

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  text:    'h-4 w-full rounded',
  heading: 'h-7 w-3/4 rounded',
  avatar:  'h-12 w-12 rounded-lg flex-shrink-0',
  card:    'h-32 w-full rounded-xl',
  button:  'h-10 w-24 rounded-lg',
  badge:   'h-5 w-16 rounded-full',
  circle:  'h-10 w-10 rounded-full',
  custom:  '',
};

export default function Skeleton({ variant = 'custom', className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${VARIANT_CLASSES[variant]} ${className}`.trim()}
      aria-hidden="true"
    />
  );
}
