'use client';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { D } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface MetricCardProps { icon: LucideIcon; label: string; value: number | string; subtitle?: string; color?: string; className?: string; onClick?: () => void; }
export function MetricCard({ icon: Icon, label, value, subtitle, color = D.indigo, className, onClick }: MetricCardProps) {
  const content = <>
    <div className="mb-5 flex items-center justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary"><Icon size={19} style={{color}}/></span>{onClick && <ArrowUpRight size={18} className="text-muted-foreground"/>}</div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
    {subtitle && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>}
  </>;
  const classes = cn('block w-full rounded-[22px] border border-border bg-card p-5 text-left', onClick && 'transition-colors hover:border-primary/40 hover:bg-secondary/50', className);
  return onClick ? <button type="button" onClick={onClick} className={classes}>{content}</button> : <div className={classes}>{content}</div>;
}
export default MetricCard;
