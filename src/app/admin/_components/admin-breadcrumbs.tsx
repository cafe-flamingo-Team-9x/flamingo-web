'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  reservations: 'Reservations',
  menu: 'Menu',
  feedback: 'Feedback & Ratings',
  gallery: 'Gallery',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  const segments = React.useMemo(
    () => pathname.split('/').filter(Boolean),
    [pathname]
  );
  const adminSegments = segments.slice(1);
  const filteredSegments = adminSegments.filter(
    (segment) => segment && segment !== 'dashboard'
  );

  const dynamicCrumbs = filteredSegments.map((segment, index) => {
    const href = `/admin/${filteredSegments.slice(0, index + 1).join('/')}`;
    const label =
      SEGMENT_LABELS[segment] ??
      segment
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

    return {
      href,
      label,
    };
  });

  const items = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
    },
    ...dynamicCrumbs,
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={`${item.href}-${item.label}`}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? <BreadcrumbSeparator /> : null}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
