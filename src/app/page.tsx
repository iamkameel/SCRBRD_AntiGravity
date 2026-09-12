import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Activity, CalendarDays, BarChart3, ShieldCheck, Trophy, Users, Zap } from 'lucide-react';

const workspaces = [
  { icon: Activity, title: 'Follow the action', description: 'Every fixture, every innings, every result. Keep your finger on the pulse of the game.', href: '/matches', label: 'Match centre' },
  { icon: Users, title: 'Build your team', description: 'Bring your squads, player profiles and team selection into one shared workspace.', href: '/teams', label: 'Explore teams' },
  { icon: Trophy, title: 'Celebrate progress', description: 'Discover the performances and achievements that make a season worth remembering.', href: '/rankings', label: 'View rankings' },
];

export default function LandingPage() {
  return <div className="min-h-screen bg-[#0b0d0b] text-[#f3f5ef]">
    <header className="border-b border-white/10">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-6 sm:px-10">
        <Link href="/" aria-label="SCRBRD home" className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b5f542] text-black"><Zap size={23}/></span><span className="text-xl font-bold tracking-tight">SCRBRD</span></Link>
        <div className="hidden items-center gap-8 text-sm text-white/65 md:flex"><Link href="/matches" className="hover:text-white">Matches</Link><Link href="/teams" className="hover:text-white">Teams</Link><Link href="/schools" className="hover:text-white">Schools</Link><Link href="/features" className="hover:text-white">The platform</Link></div>
        <div className="flex items-center gap-4"><Link href="/login" className="text-sm text-white/75 hover:text-white">Sign in</Link><Link href="/signup" className="rounded-xl bg-[#b5f542] px-4 py-2.5 text-sm font-semibold text-[#101610] hover:bg-[#c5ff66]">Get started</Link></div>
      </nav>
    </header>
    <main id="main-content" className="mx-auto max-w-[1440px] space-y-8 px-5 py-7 sm:px-10 sm:py-10">
      <div className="flex items-center justify-between gap-4 text-sm"><span className="text-white/55">The home of your cricket</span><Link href="/home" className="inline-flex items-center gap-2 text-[#b5f542]">Explore your dashboard<ArrowUpRight size={16}/></Link></div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        <section className="relative isolate min-h-[520px] overflow-hidden rounded-[30px] border border-white/10 bg-[#101810]">
          <Image src="/images/cricket-hero.png" alt="A batsman playing cricket in golden afternoon light" fill priority sizes="(max-width: 1024px) 100vw, 75vw" className="object-cover object-right"/>
          <div className="relative flex h-full min-h-[520px] max-w-[72%] flex-col items-start justify-center px-6 py-10 sm:px-10">
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs text-[#c4f87a]"><Activity size={13}/>One platform. Every part of the game.</span>
            <h1 className="text-[42px] font-semibold leading-[1.04] tracking-[-.045em] sm:text-6xl xl:text-7xl">Great games.<br/>Stronger teams.<br/><span className="text-[#b5f542]">Your season.</span></h1>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/75 sm:text-base">From the first team selection to the final ball. A connected home for players, coaches, schools and supporters.</p>
            <Link href="/signup" className="mt-8 inline-flex items-center gap-5 rounded-xl bg-[#b5f542] px-5 py-3.5 text-sm font-semibold text-[#101610] hover:bg-[#c5ff66]">Find your game<ArrowUpRight size={18}/></Link>
          </div>
        </section>
        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <section className="flex flex-col rounded-[26px] border border-white/10 bg-[#191d17] p-6"><span className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#b5f542]/10 text-[#b5f542]"><CalendarDays size={22}/></span><p className="text-xs text-white/50">THE NEXT INNINGS</p><h2 className="mt-2 text-2xl font-medium">Be there for<br/>every moment.</h2><p className="mb-6 mt-3 text-sm leading-relaxed text-white/60">Plan ahead with fixtures and follow your teams through the season.</p><Link href="/fixtures" className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm text-[#b5f542]">Explore fixtures<ArrowUpRight size={18}/></Link></section>
          <section className="rounded-[26px] border border-white/10 bg-[#171a17] p-6"><BarChart3 size={24} className="mb-4 text-[#b5f542]"/><h2 className="text-xl font-medium">A clearer view<br/>of your game.</h2><p className="mt-3 text-sm leading-relaxed text-white/60">Turn scorecards into insight with performance analysis for your next step.</p><Link href="/analytics" className="mt-5 inline-flex items-center gap-3 text-sm text-[#b5f542]">Explore analytics<ArrowUpRight size={16}/></Link></section>
        </aside>
      </div>
      <section className="py-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-medium uppercase tracking-[.18em] text-[#b5f542]">A place for everyone</p><h2 className="text-2xl font-medium sm:text-3xl">Less admin. More cricket.</h2></div><Link href="/features" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">Discover the platform<ArrowRight size={16}/></Link></div>
        <div className="grid gap-4 md:grid-cols-3">{workspaces.map(({icon: Icon, title, description, href, label}) => <Link key={href} href={href} className="group rounded-[24px] border border-white/10 bg-[#171a17] p-6 transition-colors hover:border-[#b5f542]/40"><div className="mb-6 flex items-center justify-between"><Icon size={24} className="text-[#b5f542]"/><ArrowUpRight size={19} className="text-white/40 group-hover:text-[#b5f542]"/></div><h3 className="text-xl font-medium">{title}</h3><p className="mt-3 text-sm leading-relaxed text-white/55">{description}</p><p className="mt-6 text-sm text-[#b5f542]">{label}</p></Link>)}</div>
      </section>
      <section className="flex flex-col items-start justify-between gap-6 rounded-[26px] border border-[#b5f542]/20 bg-[#1b2416] p-7 sm:flex-row sm:items-center sm:p-10"><div><span className="mb-3 inline-flex items-center gap-2 text-xs text-[#b5f542]"><ShieldCheck size={16}/>Built around your cricket community</span><h2 className="text-2xl font-medium sm:text-3xl">Your next chapter starts here.</h2><p className="mt-2 text-sm text-white/60">Bring your team together on SCRBRD.</p></div><Link href="/signup" className="inline-flex shrink-0 items-center gap-4 rounded-xl bg-[#b5f542] px-6 py-3.5 text-sm font-semibold text-[#101610]">Get started<ArrowUpRight size={18}/></Link></section>
    </main>
    <footer className="mx-auto mt-6 flex max-w-[1440px] flex-wrap items-center justify-between gap-5 border-t border-white/10 px-5 py-8 text-xs text-white/45 sm:px-10"><span>© {new Date().getFullYear()} SCRBRD · Your game. Connected.</span><div className="flex gap-6"><Link href="/help" className="hover:text-white">Help & support</Link><Link href="/rulebook" className="hover:text-white">Rulebook</Link><Link href="/schools" className="hover:text-white">Schools</Link></div></footer>
  </div>;
}
