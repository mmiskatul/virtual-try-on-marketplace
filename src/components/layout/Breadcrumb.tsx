import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-stone-500">
      <Link href="/" className="hover:text-stone-900 transition-colors font-medium">
        Home
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-stone-900 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className="text-stone-900 font-semibold truncate max-w-[240px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

