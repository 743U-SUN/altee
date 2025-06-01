'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AttributesLayoutProps {
  children: React.ReactNode;
}

export default function AttributesLayout({ children }: AttributesLayoutProps) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'メーカー',
      href: '/admin/attributes/manufacturers',
      active: pathname.includes('/manufacturers'),
    },
    {
      name: 'シリーズ',
      href: '/admin/attributes/series',
      active: pathname.includes('/series'),
    },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">属性管理</h1>
        <p className="text-gray-600 mt-2">
          商品のメーカー、シリーズなどの属性を管理します
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                tab.active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
              )}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}