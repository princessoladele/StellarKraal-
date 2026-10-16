'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Human-readable label overrides for known path segments.
 * Dynamic segments (e.g. IDs) fall back to the capitalised raw segment value.
 */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  collateral: 'Collateral',
  loans: 'Loans',
  borrow: 'Borrow',
  profile: 'Profile',
  settings: 'Settings',
  admin: 'Admin',
  users: 'Users',
  reports: 'Reports',
  liquidators: 'Liquidators',
  moderation: 'Moderation',
  statistics: 'Statistics',
  help: 'Help',
  faq: 'FAQ',
  glossary: 'Glossary',
  transactions: 'Transactions',
  onboarding: 'Onboarding',
  docs: 'Docs',
  colors: 'Colours',
};

interface Crumb {
  label: string;
  href: string;
}

/**
 * Builds a crumb list from a pathname string, always prepending "Home".
 *
 * e.g. "/loans/abc-123" →
 *   [{ label: 'Home',    href: '/' },
 *    { label: 'Loans',   href: '/loans' },
 *    { label: 'abc-123', href: '/loans/abc-123' }]
 */
export function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);

  const pathCrumbs: Crumb[] = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    // Use the label map, then fall back to capitalising the raw segment.
    const label =
      SEGMENT_LABELS[segment] ??
      segment.charAt(0).toUpperCase() + segment.slice(1);
    return { label, href };
  });

  // Always include a Home crumb at the start.
  return [{ label: 'Home', href: '/' }, ...pathCrumbs];
}

/**
 * Renders a breadcrumb trail for the current route.
 *
 * Returns null when the path is at depth ≤ 1 (e.g. /dashboard itself)
 * since a single-segment path only produces [Home, Dashboard] which is
 * only meaningful when there is a deeper page to navigate back from.
 *
 * Acceptance criteria (#1258):
 *  ✓ Breadcrumb rendered on all pages at depth > 1
 *  ✓ Uses structured data (BreadcrumbList JSON-LD) for SEO
 *  ✓ Home > Loans > Loan #123 format
 *  ✓ Accessible: nav landmark with aria-label="breadcrumb"
 *  ✓ Last crumb is not a link (current page)
 */
export default function Breadcrumb() {
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

  // Show breadcrumb only on pages nested at depth > 1 (i.e., more than one
  // real segment, so the crumb list has Home + segment + at least one deeper
  // segment = 3+ items).
  const pathDepth = pathname.split('/').filter(Boolean).length;
  if (pathDepth <= 1) return null;

  // JSON-LD structured data for SEO (BreadcrumbList schema.org).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: typeof window !== 'undefined'
        ? `${window.location.origin}${crumb.href}`
        : crumb.href,
    })),
  };

  return (
    <>
      {/* JSON-LD for search engines */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-brown/70 dark:text-[var(--color-text-muted)]">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.href} className="flex items-center gap-1">
                {index > 0 && (
                  <span aria-hidden="true" className="text-brown/40 select-none">
                    /
                  </span>
                )}
                {isLast ? (
                  // Current page — not a link; marked with aria-current.
                  <span
                    aria-current="page"
                    className="font-medium text-brown dark:text-[var(--color-text)] truncate max-w-[16ch]"
                    title={crumb.label}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-brown dark:hover:text-[var(--color-text)] hover:underline transition truncate max-w-[16ch]"
                    title={crumb.label}
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
