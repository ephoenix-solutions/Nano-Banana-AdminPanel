'use client';

import Link from 'next/link';
import { Icons } from '@/config/icons';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm font-body mb-6">
      <Link
        href="/"
        className="flex items-center gap-1 text-secondary hover:text-primary transition-colors"
      >
        <Icons.home size={16} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            <Icons.chevronRight size={14} className="text-secondary/50" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-secondary hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-primary font-semibold">{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
