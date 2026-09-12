"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  basePath: string;
  className?: string;
}

export function ProfileTabs({ tabs, activeTab, basePath, className }: ProfileTabsProps) {
  return (
    <div className={cn('border-b border-border', className)}>
      <nav className="flex gap-4 overflow-x-auto scrollbar-hide px-1" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <Link
              key={tab.id}
              href={`${basePath}?tab=${tab.id}`}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 -mb-[1px]',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
              )}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={cn(
                  'ml-1 px-2 py-0.5 text-xs rounded-full',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

interface TabPanelProps {
  children: ReactNode;
  className?: string;
}

export function TabPanel({ children, className }: TabPanelProps) {
  return (
    <div className={cn('py-6', className)}>
      {children}
    </div>
  );
}
