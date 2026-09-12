import { ReactNode } from 'react';

interface PageHeaderProps { title: string; description: string; children?: ReactNode; }

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return <div className="mb-7 flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-center">
    <div className="min-w-0 space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
    {children && <div className="flex shrink-0 flex-wrap items-center gap-3">{children}</div>}
  </div>;
}
