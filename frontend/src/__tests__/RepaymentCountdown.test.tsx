import React from 'react';
import { render, screen } from '@testing-library/react';
import RepaymentCountdown from '../components/RepaymentCountdown';

// Mock framer-motion to avoid animation side effects in tests
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useReducedMotion: () => false,
}));

describe('RepaymentCountdown', () => {
  it('shows DD:HH:MM countdown when deadline is in the future', () => {
    // 5 days from now
    const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    const display = screen.getByTestId('countdown-display');
    expect(display).toBeTruthy();
    // Should match DD:HH:MM format
    expect(display.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('shows "Overdue" when deadline has passed', () => {
    const deadline = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    expect(screen.getByTestId('countdown-overdue')).toBeTruthy();
    expect(screen.getByText('Overdue')).toBeTruthy();
  });

  it('shows amber warning when < 3 days remain', () => {
    // 2 days from now
    const deadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    expect(screen.getByText(/Less than 3 days remaining/)).toBeTruthy();
  });

  it('shows red warning when < 24 hours remain', () => {
    // 12 hours from now
    const deadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    expect(screen.getByText(/Less than 24 hours remaining/)).toBeTruthy();
  });

  it('shows "Overdue" alert when deadline passed', () => {
    const deadline = new Date(Date.now() - 60_000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    // Multiple elements may contain "overdue" (heading + alert) — verify at least one
    const overdueMsgs = screen.getAllByText(/overdue/i);
    expect(overdueMsgs.length).toBeGreaterThan(0);
  });

  it('renders a live region for screen reader announcements', () => {
    const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    // The sr-only live region should be present in the DOM
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
  });

  it('shows "Repayment Deadline" label', () => {
    const deadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    expect(screen.getByText('Repayment Deadline')).toBeTruthy();
  });

  it('displays the formatted due date', () => {
    const deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    render(<RepaymentCountdown deadline={deadline} />);

    // Should render a "Due …" or "Due date was …" text
    const dueDateEl = document.querySelector('[data-testid="repayment-countdown"]');
    expect(dueDateEl?.textContent).toMatch(/Due/);
  });

  it('shows no urgency warnings for distant deadlines (> 3 days)', () => {
    const deadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const { queryByText } = render(<RepaymentCountdown deadline={deadline} />);

    expect(queryByText(/Less than 3 days/)).toBeNull();
    expect(queryByText(/Less than 24 hours/)).toBeNull();
  });
});
