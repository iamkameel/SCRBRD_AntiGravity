'use client';
import Link from 'next/link';
import { ArrowUpRight, Trophy, Users } from 'lucide-react';
import FixtureCentreCard from '../dashboard/FixtureCentreCard';

export default function SpectatorDashboard() {
  return <div className="space-y-5">
    <FixtureCentreCard role="Spectator" maxMatches={5}/>
    <div className="grid gap-4 sm:grid-cols-2">
      {[{title:'Find your community',description:'Explore schools and the teams behind the game.',href:'/schools',icon:Users},{title:'Follow the competition',description:'Explore leagues, divisions and this season’s results.',href:'/browse-leagues',icon:Trophy}].map(({title,description,href,icon:Icon}) => <Link key={href} href={href} className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-5 hover:border-primary/40"><Icon size={24} className="shrink-0 text-primary"/><div className="flex-1"><h2 className="text-base font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><ArrowUpRight size={18}/></Link>)}
    </div>
  </div>;
}
