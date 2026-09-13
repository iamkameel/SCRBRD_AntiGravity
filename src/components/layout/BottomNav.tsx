'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, CalendarDays, Home, Menu, MessageSquare } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const destinations = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/matches', label: 'Matches', icon: Activity },
  { href: '/fixtures', label: 'Fixtures', icon: CalendarDays },
  { href: '/inbox', label: 'Inbox', icon: MessageSquare },
];
export function BottomNav() {
  const pathname = usePathname();
  const { setOpenMobile, openMobile } = useSidebar();
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
    {destinations.map(({href, label, icon: Icon}) => {const active = pathname === href || pathname.startsWith(href + '/');return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium', active ? 'bg-primary/10 text-primary' : 'text-muted-foreground')}><Icon size={20}/>{label}</Link>})}
    <button type="button" onClick={() => setOpenMobile(true)} aria-expanded={openMobile} className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground"><Menu size={20}/>More</button>
  </nav>;
}
