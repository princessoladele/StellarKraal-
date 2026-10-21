'use client';
/**
 * RepaymentCountdown — countdown timer showing time remaining before the
 * loan repayment deadline (closes #1250).
 *
 * Acceptance criteria:
 *  ✓ Countdown shows DD:HH:MM format
 *  ✓ Turns amber when < 3 days remain
 *  ✓ Turns red when < 24 hours remain
 *  ✓ Shows "Overdue" when deadline is passed
 *  ✓ Accessible: countdown updates announced to screen readers (throttled)
 */
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalMs: number;
  overdue: boolean;
}

type UrgencyLevel = 'normal' | 'amber' | 'red' | 'overdue';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTimeRemaining(deadline: Date): TimeRemaining {
  const now = Date.now();
  const diff = deadline.getTime() - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, totalMs: diff, overdue: true };
  }

  const totalMs = diff;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, totalMs, overdue: false };
}

function getUrgency(remaining: TimeRemaining): UrgencyLevel {
  if (remaining.overdue) return 'overdue';
  if (remaining.totalMs < 24 * 60 * 60 * 1000) return 'red';     // < 24 hours
  if (remaining.totalMs < 3 * 24 * 60 * 60 * 1000) return 'amber'; // < 3 days
  return 'normal';
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const URGENCY_CLASSES: Record<UrgencyLevel, string> = {
  normal: 'text-brown dark:text-cream',
  amber:  'text-amber-600 dark:text-amber-400',
  red:    'text-red-600 dark:text-red-400',
  overdue: 'text-red-700 dark:text-red-500 font-semibold',
};

const URGENCY_BG_CLASSES: Record<UrgencyLevel, string> = {
  normal: 'bg-brown/5 dark:bg-brown-800',
  amber:  'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
  red:    'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
  overdue: 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700',
};

// ── Component ──────────────────────────────────────────────────────────────────

interface RepaymentCountdownProps {
  /** ISO 8601 deadline string, e.g. "2026-11-15T00:00:00.000Z" */
  deadline: string;
  /** Optional additional CSS classes for the container */
  className?: string;
}

/**
 * RepaymentCountdown displays a live DD:HH:MM countdown to the loan
 * repayment deadline. Colour-codes urgency and announces changes to
 * screen readers every 60 seconds to avoid excessive announcements.
 */
export default function RepaymentCountdown({ deadline, className = '' }: RepaymentCountdownProps) {
  const deadlineDate = new Date(deadline);
  const reducedMotion = useReducedMotion();

  const [remaining, setRemaining] = useState<TimeRemaining>(() =>
    getTimeRemaining(deadlineDate)
  );

  // SR live-region: announce once per minute (throttled) to avoid noise
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const lastAnnouncedMinRef = useRef<number | null>(null);

  useEffect(() => {
    // Immediate tick
    setRemaining(getTimeRemaining(deadlineDate));

    const interval = setInterval(() => {
      const next = getTimeRemaining(deadlineDate);
      setRemaining(next);

      // Throttled SR announcement — fire once per minute
      const currentMin = Math.floor(next.totalMs / 60_000);
      if (lastAnnouncedMinRef.current !== currentMin) {
        lastAnnouncedMinRef.current = currentMin;
        if (next.overdue) {
          setSrAnnouncement('Repayment deadline passed. Loan is overdue.');
        } else {
          const { days, hours, minutes } = next;
          setSrAnnouncement(
            `Repayment deadline in ${days} days, ${hours} hours, ${minutes} minutes.`
          );
        }
      }
    }, 1000 * 60); // tick every minute (seconds don't show in display)

    return () => clearInterval(interval);
    // deadlineDate is derived from `deadline` string; re-derive when prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  const urgency = getUrgency(remaining);
  const textClass = URGENCY_CLASSES[urgency];
  const bgClass = URGENCY_BG_CLASSES[urgency];

  const formattedDeadline = deadlineDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`rounded-xl border p-4 ${bgClass} ${className}`}
      data-testid="repayment-countdown"
    >
      <p className="text-xs font-medium text-brown/50 dark:text-cream/50 mb-1 uppercase tracking-wide">
        Repayment Deadline
      </p>

      {remaining.overdue ? (
        <p
          className={`text-2xl font-bold tabular-nums ${textClass}`}
          aria-label="Repayment overdue"
          data-testid="countdown-overdue"
        >
          Overdue
        </p>
      ) : (
        <p
          className={`text-2xl font-bold tabular-nums tracking-widest ${textClass} ${
            !reducedMotion && urgency !== 'normal' ? 'motion-safe:animate-pulse' : ''
          }`}
          aria-label={`${remaining.days} days ${remaining.hours} hours ${remaining.minutes} minutes remaining`}
          data-testid="countdown-display"
        >
          {pad(remaining.days)}:{pad(remaining.hours)}:{pad(remaining.minutes)}
        </p>
      )}

      <p className="text-xs text-brown/50 dark:text-cream/50 mt-1">
        {remaining.overdue
          ? `Due date was ${formattedDeadline}`
          : `Due ${formattedDeadline} · DD:HH:MM`}
      </p>

      {/* Urgency label */}
      {urgency === 'amber' && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-2" role="alert">
          ⚠ Less than 3 days remaining — repay soon
        </p>
      )}
      {(urgency === 'red') && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-2" role="alert">
          🔴 Less than 24 hours remaining — repay immediately
        </p>
      )}
      {urgency === 'overdue' && (
        <p className="text-xs font-medium text-red-700 dark:text-red-500 mt-2" role="alert">
          🔴 This loan is overdue — action required
        </p>
      )}

      {/*
        Throttled live region for screen-reader announcements.
        aria-live="polite" so it doesn't interrupt ongoing speech.
        Updated once per minute at most.
      */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {srAnnouncement}
      </span>
    </div>
  );
}
