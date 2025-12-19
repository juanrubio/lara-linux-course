'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface NavigationProps {
  breadcrumbs: BreadcrumbItem[];
}

export function Navigation({ breadcrumbs }: NavigationProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[var(--color-text)] transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--color-text)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--color-text)]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
