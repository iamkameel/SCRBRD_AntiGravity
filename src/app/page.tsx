import { BackgroundEffects } from '@/components/layout/BackgroundEffects';
import { AppearanceToggle } from '@/components/layout/AppearanceToggle';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Activity, CalendarDays, BarChart3, ShieldCheck, Trophy, Users, Zap } from 'lucide-react';

const workspaces = [
  { icon: Activity, title: 'Follow the action', description: 'Every fixture, every innings, every result. Keep your finger on the pulse of the game.', href: '/matches', label: 'Match centre' },
  { icon: Users, title: 'Build your team', description: 'Bring your squads, player profiles and team selection into one shared workspace.', href: '/teams', label: 'Explore teams' },
  { icon: Trophy, title: 'Celebrate progress', description: 'Discover the performances and achievements that make a season worth remembering.', href: '/rankings', label: 'View rankings' },
];

export default function LandingPage() {
  return <div className="relative isolate min-h-screen bg-background text-foreground">
    <BackgroundEffects/>
    <header className="relative border-b border-border bg-card/80 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-6 sm:px-10">
        <Link href="/" aria-label="SCRBRD home" className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Zap size={23}/></span><span className="text-xl font-bold tracking-tight">SCRBRD</span></Link>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex"><Link href="/matches" className="hover:text-foreground">Matches</Link><Link href="/teams" className="hover:text-foreground">Teams</Link><Link href="/schools" className="hover:text-foreground">Schools</Link><Link href="/features" className="hover:text-foreground">The platform</Link></div>
        <div className="flex items-center gap-3"><AppearanceToggle/><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link><Link href="/signup" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Get started</Link></div>
      </nav>
    </header>
    <main id="main-content" className="relative mx-auto max-w-[1440px] space-y-8 px-5 py-7 sm:px-10 sm:py-10">
      <div className="flex items-center justify-between gap-4 text-sm"><span className="text-muted-foreground">The home of your cricket</span><Link href="/home" className="inline-flex items-center gap-2 text-primary">Explore your dashboard<ArrowUpRight size={16}/></Link></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        <section className="hero-inverse relative isolate min-h-[520px] overflow-hidden rounded-[30px] border border-white/10 bg-[#101810] text-white">
          <Image src="/images/cricket-hero.png" alt="A batsman playing cricket in golden afternoon light" fill priority sizes="(max-width: 1024px) 100vw, 75vw" className="object-cover object-right"/><div className="hero-scrim absolute inset-0"/>
          <div className="relative flex h-full min-h-[520px] max-w-[80%] sm:max-w-[72%] flex-col items-start justify-center px-6 py-10 sm:px-10">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs text-[#c4f87a]"><Activity size={13}/>One platform. Every part of the game.</span>
            <h1 className="text-[36px] font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl xl:text-7xl">Great games.<br/>Stronger teams.<br/><span className="text-primary">Your season.</span></h1>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">From the first team selection to the final ball. A connected home for players, coaches, schools and supporters.</p>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-5 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Find your game<ArrowUpRight size={18}/></Link>
          </div>
        </section>
        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <section className="flex flex-col rounded-[26px] border border-border bg-card p-6"><span className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CalendarDays size={22}/></span><p className="text-xs text-muted-foreground">THE NEXT INNINGS</p><h2 className="mt-2 text-2xl font-medium">Be there for<br/>every moment.</h2><p className="mb-6 mt-3 text-sm leading-relaxed text-muted-foreground">Plan ahead with fixtures and follow your teams through the season.</p><Link href="/fixtures" className="mt-auto flex items-center justify-between border-t border-border pt-4 text-sm text-primary">Explore fixtures<ArrowUpRight size={18}/></Link></section>
          <section className="rounded-[26px] border border-border bg-card p-6"><BarChart3 size={24} className="mb-4 text-primary"/><h2 className="text-xl font-medium">A clearer view<br/>of your game.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Turn scorecards into insight with performance analysis for your next step.</p><Link href="/analytics" className="mt-5 inline-flex items-center gap-3 text-sm text-primary">Explore analytics<ArrowUpRight size={16}/></Link></section>
        </aside>
      </div>
      <section className="py-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-primary">A place for everyone</p><h2 className="text-2xl font-medium sm:text-3xl">Less admin. More cricket.</h2></div><Link href="/features" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">Discover the platform<ArrowRight size={16}/></Link></div>
        <div className="grid gap-4 md:grid-cols-3">{workspaces.map(({icon: Icon, title, description, href, label}) => <Link key={href} href={href} className="group rounded-[24px] border border-border bg-card p-6 transition-colors hover:border-primary/40"><div className="mb-6 flex items-center justify-between"><Icon size={24} className="text-primary"/><ArrowUpRight size={19} className="text-muted-foreground group-hover:text-primary"/></div><h3 className="text-xl font-medium">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p><p className="mt-6 text-sm text-primary">{label}</p></Link>)}</div>
      </section>
      <section className="flex flex-col items-start justify-between gap-6 rounded-[26px] border border-primary/25 bg-card p-7 sm:flex-row sm:items-center sm:p-10"><div><span className="mb-3 inline-flex items-center gap-2 text-xs text-primary"><ShieldCheck size={16}/>Built around your cricket community</span><h2 className="text-2xl font-medium sm:text-3xl">Your next chapter starts here.</h2><p className="mt-2 text-sm text-muted-foreground">Bring your team together on SCRBRD.</p></div><Link href="/signup" className="inline-flex shrink-0 items-center gap-4 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground">Get started<ArrowUpRight size={18}/></Link></section>
    </main>
    <footer className="relative mx-auto mt-6 flex max-w-[1440px] flex-wrap items-center justify-between gap-5 border-t border-border px-5 py-8 text-xs text-muted-foreground sm:px-10"><span>© {new Date().getFullYear()} SCRBRD · Your game. Connected.</span><div className="flex gap-6"><Link href="/help" className="hover:text-foreground">Help & support</Link><Link href="/rulebook" className="hover:text-foreground">Rulebook</Link><Link href="/schools" className="hover:text-foreground">Schools</Link></div></footer>
  </div>;
}
