'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Activity, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const shortcuts = [
  { title: 'Match centre', description: 'Fixtures, live scores & results', href: '/matches', icon: Activity },
  { title: 'Your teams', description: 'Squads, players & selection', href: '/teams', icon: Users },
  { title: 'Season rankings', description: 'Follow every achievement', href: '/rankings', icon: Trophy },
];

export function DashboardWelcome() {
  const { user } = useAuth();
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-1 text-sm text-muted-foreground">Your cricket, all together</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your dashboard</h1></div>
      <Link href="/strategic-calendar" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm hover:bg-secondary"><CalendarDays size={16}/>Season calendar<ArrowUpRight size={15}/></Link>
    </div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section className="relative isolate min-h-[310px] overflow-hidden rounded-[26px] border border-white/10 bg-[#101810] text-white">
        <Image src="/images/cricket-hero.png" alt="Cricket batsman playing a shot on a sunlit field" fill priority sizes="(max-width: 768px) 100vw, 70vw" className="object-cover object-right"/>
        <div className="relative flex min-h-[310px] max-w-[68%] flex-col items-start justify-center p-6 sm:p-8">
          <span className="mb-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-[#c4f87a]">Ready for your next innings</span>
          <h2 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ' to your game'}.<br/>Make every<br/>moment count.</h2>
          <p className="mt-3 hidden max-w-xs text-sm leading-relaxed text-white/75 sm:block">Stay close to your team, track the action, and build a stronger season.</p>
          <Link href="/matches" className="mt-6 inline-flex items-center gap-3 rounded-xl bg-[#b5f542] px-5 py-3 text-sm font-semibold text-[#101610] hover:bg-[#c5ff66]">Explore matches<ArrowUpRight size={17}/></Link>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {shortcuts.map(({title, description, href, icon: Icon}) => <Link key={href} href={href} className="group flex items-center gap-4 rounded-[22px] border border-border bg-card p-5 transition-colors hover:border-primary/40">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={21}/></span>
          <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><ArrowUpRight size={16} className="shrink-0 text-muted-foreground group-hover:text-primary"/>
        </Link>)}
      </div>
    </div>
  </div>;
}
