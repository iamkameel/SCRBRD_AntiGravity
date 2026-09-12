'use client';

import React, { useState, useMemo } from 'react';
import { 
  Handshake, 
  Trophy, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Building2, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  Plus, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  PieChart, 
  Share2, 
  Download, 
  Sliders, 
  Radio,
  Tv,
  Smartphone,
  BarChart3,
  UserCheck,
  Zap,
  Edit2,
  Trash2
} from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  sponsorService, 
  MOCK_SPONSORS, 
  MOCK_COMMERCIAL_TIERS, 
  MOCK_IMPRESSION_TELEMETRY, 
  MOCK_ASSET_PLACEMENTS,
  SponsorImpressionTelemetry,
  CommercialAssetPlacement
} from '@/lib/services/sponsorService';
import { Sponsor } from '@/types/firestore';

export default function SponsorsPage() {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'directory' | 'placements' | 'proposal'>('telemetry');
  const [sponsorsList, setSponsorsList] = useState<any[]>(MOCK_SPONSORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('ALL');

  // Modal State for Add Sponsor
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newContribution, setNewContribution] = useState('150000');
  const [newWebsite, setNewWebsite] = useState('');
  const [newTier, setNewTier] = useState<string>('BROADCAST_PARTNER');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');

  // Proposal Generator State
  const [proposalProspect, setProposalProspect] = useState('First National Bank');
  const [proposalTier, setProposalTier] = useState('TITLE_PARTNER');
  const [proposalDurationYears, setProposalDurationYears] = useState(2);
  const [selectedPerks, setSelectedPerks] = useState<string[]>([
    'Primary Jersey Crest Badge', 
    'Main Oval Naming Rights', 
    'Live Broadcast Score Bug Logo'
  ]);

  // Derived Totals
  const totalPortfolioValue = useMemo(() => {
    return sponsorsList.reduce((sum, s) => sum + (s.contributionAmount || 0), 0);
  }, [sponsorsList]);

  const totalImpressions = useMemo(() => {
    return MOCK_IMPRESSION_TELEMETRY.reduce((sum, t) => sum + t.impressionsTotal, 0);
  }, []);

  const totalValueDelivered = useMemo(() => {
    return MOCK_IMPRESSION_TELEMETRY.reduce((sum, t) => sum + t.estimatedValueDelivered, 0);
  }, []);

  // Filtered Sponsors
  const filteredSponsors = useMemo(() => {
    return sponsorsList.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = selectedTierFilter === 'ALL' || s.tier === selectedTierFilter;
      return matchesSearch && matchesTier;
    });
  }, [sponsorsList, searchQuery, selectedTierFilter]);

  const handleAddSponsor = () => {
    if (!newName.trim()) return;
    const created: any = {
      id: `sp-${Date.now()}`,
      name: newName.trim(),
      industry: newIndustry.trim() || 'Corporate Partner',
      contributionAmount: parseFloat(newContribution) || 100000,
      active: true,
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200&auto=format&fit=crop&q=60',
      website: newWebsite.trim() || undefined,
      tier: newTier,
      contractExpiry: `${new Date().getFullYear() + 1}-12-31`,
      contactPerson: newContactPerson.trim() || 'Sponsorship Manager',
      contactEmail: newContactEmail.trim() || 'contact@partner.com',
      brandColor: '#6366f1'
    };

    setSponsorsList(prev => [created, ...prev]);
    setShowAddModal(false);
    setNewName('');
    setNewIndustry('');
  };

  const handleToggleSponsorStatus = (id: string) => {
    setSponsorsList(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDeleteSponsor = (id: string) => {
    setSponsorsList(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto p-4 md:p-8">
      {/* Strategic Header */}
      <div className="relative p-8 md:p-10 rounded-[3rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradGold }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
            <Handshake className="h-12 w-12 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-amber-600 dark:text-amber-400">
                COMMERCIAL RIGHTS & SPONSOR ENGINE
              </span>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 text-[9px] font-mono">
                SCHOOL SPORTS FOUNDATION
              </Badge>
            </div>
            <h1 
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-zinc-900 dark:text-white" 
              style={{ fontFamily: D.head }}
            >
              SPONSOR & <span className="text-amber-500 dark:text-amber-400">COMMERCIAL RIGHTS</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic text-zinc-500 dark:text-zinc-400">
              PORTFOLIO MANAGEMENT • LIVE IMPRESSION TELEMETRY • AD PLACEMENT OVERLAYS • PROPOSAL GENERATOR
            </p>
          </div>

          <div className="lg:ml-auto grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 block mb-1">TOTAL PORTFOLIO</span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">R {(totalPortfolioValue / 1000).toFixed(0)}k</div>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 block mb-1">LIVE IMPRESSIONS</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{(totalImpressions / 1000000).toFixed(2)}M</div>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 text-center col-span-2 md:col-span-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-white/40 block mb-1">EST. DELIVERED ROI</span>
              <div className="text-xl font-black text-sky-600 dark:text-sky-400 font-mono">3.8x</div>
            </div>
          </div>
        </div>

        {/* Portfolio Revenue Weight Bar */}
        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-white/10 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            <span>COMMERCIAL ASSET WEIGHTING</span>
            <span>R {totalPortfolioValue.toLocaleString()} TOTAL CAPITAL RAISED</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5">
            {sponsorsList.map((s, i) => (
              <div 
                key={s.id || i}
                className="h-full transition-all hover:brightness-125"
                style={{ 
                  width: `${((s.contributionAmount || 0) / totalPortfolioValue) * 100}%`,
                  backgroundColor: ['#f59e0b', '#0ea5e9', '#6366f1', '#10b981', '#ec4899', '#8b5cf6'][i % 6]
                }}
                title={`${s.name}: R ${s.contributionAmount.toLocaleString()}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 p-2 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10]">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'telemetry' ? 'bg-amber-500 text-black shadow-xl' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Commercial Telemetry
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'directory' ? 'bg-sky-500 text-black shadow-xl' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" /> Partners & Contracts ({sponsorsList.length})
        </button>

        <button
          onClick={() => setActiveTab('placements')}
          className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'placements' ? 'bg-indigo-600 text-white shadow-xl' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" /> Digital Ad Overlays ({MOCK_ASSET_PLACEMENTS.length})
        </button>

        <button
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'proposal' ? 'bg-emerald-500 text-black shadow-xl' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Proposal Generator
        </button>
      </div>

      {/* TAB 1: COMMERCIAL TELEMETRY & IMPRESSION ANALYTICS */}
      {activeTab === 'telemetry' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Impression Breakdown by Sponsor */}
            <div className="lg:col-span-2 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">BRAND EXPOSURE METRICS</span>
                  <h3 className="text-xl font-black uppercase italic text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                    IMPRESSION TELEMETRY & ENGAGEMENT
                  </h3>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-mono text-[9px]">REAL-TIME SYNC</Badge>
              </div>

              <div className="space-y-4">
                {MOCK_IMPRESSION_TELEMETRY.map((t) => (
                  <div key={t.sponsorId} className="p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
                          {t.sponsorName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-zinc-900 dark:text-white">{t.sponsorName}</h4>
                          <Badge className="bg-zinc-200 dark:bg-white/5 text-zinc-700 dark:text-zinc-400 font-mono text-[9px]">{t.tier}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono block">
                            {t.impressionsTotal.toLocaleString()} Views
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">CTR: {t.ctrPct}% ({t.clickThroughs.toLocaleString()} clicks)</span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-right">
                          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-300 block">Est. Value</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">R {t.estimatedValueDelivered.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Channels Breakdown */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-center">
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono block">Scorecard Banner</span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">{t.impressionsScorecard.toLocaleString()}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-center">
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono block">Broadcast Stream</span>
                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">{t.impressionsBroadcast.toLocaleString()}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-center">
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono block">Parent App Roster</span>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{t.impressionsApp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: ROI Benchmarks & Impression Channels */}
            <div className="space-y-6">
              <div className="p-6 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] space-y-4 shadow-xl">
                <span className="text-[9px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">COST PER THOUSAND (CPM)</span>
                <h4 className="text-lg font-black uppercase italic text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                  EFFICIENCY COMPARISON
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  SCRBRD Live Scorecards deliver direct targeted reach to school sports parents and alumni at a fraction of traditional TV ad costs.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">SCRBRD Live Sports</span>
                      <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">Direct Parent Engagement</span>
                    </div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">R 0.60 CPM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Traditional Broadcast TV</span>
                      <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">Mass Broad Audience</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 font-mono">R 2.50 CPM</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Social Media Banners</span>
                      <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">Generic Ad Placement</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 font-mono">R 1.80 CPM</span>
                  </div>
                </div>
              </div>

              {/* Live Channel Share */}
              <div className="p-6 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] space-y-4 shadow-xl">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">PLACEMENT DISTRIBUTION</span>
                <h4 className="text-lg font-black uppercase italic text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                  TOP AD PLACEMENT CHANNELS
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300">
                      <span>Live Scorecards & Pitch Maps</span>
                      <span className="text-amber-600 dark:text-amber-400">45%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-black/40 overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: '45%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300">
                      <span>OBS Live Broadcast Stream</span>
                      <span className="text-sky-600 dark:text-sky-400">32%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-black/40 overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: '32%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-zinc-700 dark:text-zinc-300">
                      <span>Parent & Alumni Roster App</span>
                      <span className="text-indigo-600 dark:text-indigo-400">23%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-black/40 overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: '23%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: CORPORATE PARTNERS & CONTRACT MANAGER */}
      {activeTab === 'directory' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/20 shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <Input 
                  placeholder="Search corporate partner or industry..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white rounded-xl w-64"
                />
              </div>

              <select
                value={selectedTierFilter}
                onChange={e => setSelectedTierFilter(e.target.value)}
                className="p-2.5 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white font-mono outline-none"
              >
                <option value="ALL">All Commercial Tiers</option>
                <option value="TITLE_PARTNER">Title Partners</option>
                <option value="BROADCAST_PARTNER">Broadcast Partners</option>
                <option value="PERIMETER_PARTNER">Perimeter Partners</option>
                <option value="ACADEMY_BENEFACTOR">Academy Benefactors</option>
              </select>
            </div>

            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase px-6 py-3 rounded-xl gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Corporate Sponsor
            </Button>
          </div>

          {/* Add Sponsor Modal */}
          {showAddModal && (
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-amber-500/30 bg-white dark:bg-black/50 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/10 pb-4">
                <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase italic">Add New Corporate Partner</h4>
                <Button variant="ghost" onClick={() => setShowAddModal(false)} className="text-xs text-zinc-500 dark:text-zinc-400">Close</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Company Name</label>
                  <Input 
                    placeholder="e.g. Discovery Vitality" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Industry Sector</label>
                  <Input 
                    placeholder="e.g. Financial Services" 
                    value={newIndustry}
                    onChange={e => setNewIndustry(e.target.value)}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Annual Investment (R)</label>
                  <Input 
                    type="number"
                    value={newContribution}
                    onChange={e => setNewContribution(e.target.value)}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white font-mono rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Partnership Tier</label>
                  <select
                    value={newTier}
                    onChange={e => setNewTier(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white font-mono"
                  >
                    <option value="TITLE_PARTNER">Title Partner (R 500k+)</option>
                    <option value="BROADCAST_PARTNER">Broadcast Partner (R 250k+)</option>
                    <option value="PERIMETER_PARTNER">Perimeter Partner (R 100k+)</option>
                    <option value="ACADEMY_BENEFACTOR">Academy Benefactor (R 50k+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Website URL</label>
                  <Input 
                    placeholder="https://..." 
                    value={newWebsite}
                    onChange={e => setNewWebsite(e.target.value)}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Contact Email</label>
                  <Input 
                    placeholder="sponsorships@company.com" 
                    value={newContactEmail}
                    onChange={e => setNewContactEmail(e.target.value)}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button onClick={handleAddSponsor} className="bg-amber-500 text-black font-bold text-xs">Save Corporate Partner</Button>
              </div>
            </div>
          )}

          {/* Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSponsors.map((s) => (
              <div 
                key={s.id}
                className="p-6 rounded-3xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-black/30 space-y-6 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-lg">
                        {s.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug">{s.name}</h4>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-mono">{s.industry}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleToggleSponsorStatus(s.id)}
                      className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold transition-all ${
                        s.active ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500'
                      }`}
                    >
                      {s.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Annual Rights Fee</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                      R {(s.contributionAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                    <div className="flex justify-between">
                      <span>Tier:</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{s.tier || 'SPONSOR'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contract Expiry:</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{s.contractExpiry || '2026-12-31'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contact:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate max-w-[160px]">{s.contactPerson || 'Sponsorship Manager'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/10">
                  {s.website ? (
                    <a 
                      href={s.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">No URL</span>
                  )}

                  <button 
                    onClick={() => handleDeleteSponsor(s.id)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 3: DIGITAL AD OVERLAYS */}
      {activeTab === 'placements' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Live Preview Box */}
          <div className="p-8 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">BROADCAST & APP OVERLAYS</span>
                <h3 className="text-xl font-black uppercase italic text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                  LIVE AD PLACEMENT INSPECTOR
                </h3>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-mono text-[9px]">OBS & SCORECARD ENGINE</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Placement Mockup 1: Score Bug */}
              <div className="p-6 rounded-3xl border border-indigo-500/30 bg-zinc-50 dark:bg-black/40 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-[9px]">PLACEMENT #1: SCORE BUG</Badge>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Standard Bank (Title Partner)</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-7 px-3 bg-blue-700 text-white text-xs font-black rounded flex items-center">
                      ST STITHIANS 1st XI
                    </div>
                    <span className="text-lg font-black text-white font-mono">184/4 (42.2 ov)</span>
                  </div>
                  <div className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                    POWERED BY STANDARD BANK
                  </div>
                </div>
              </div>

              {/* Placement Mockup 2: Wagon Wheel */}
              <div className="p-6 rounded-3xl border border-indigo-500/30 bg-zinc-50 dark:bg-black/40 space-y-4">
                <div className="flex justify-between items-center">
                  <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono text-[9px]">PLACEMENT #2: WAGON WHEEL</Badge>
                  <span className="text-xs text-sky-600 dark:text-sky-400 font-mono">Investec (Broadcast Partner)</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold text-white">Interactive Pitch & Shot Map</span>
                  </div>
                  <div className="px-3 py-1 rounded bg-black border border-white/20 text-[10px] font-mono text-zinc-300">
                    DATA BY INVESTEC
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Placements Inventory Table */}
          <div className="p-8 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] space-y-6 shadow-2xl">
            <h4 className="text-lg font-black uppercase italic text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
              COMMERCIAL PLACEMENT INVENTORY
            </h4>

            <div className="space-y-4">
              {MOCK_ASSET_PLACEMENTS.map((ap) => (
                <div key={ap.id} className="p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                      <Tv className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">{ap.placementName}</h4>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">Location Code: {ap.locationCode}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">{ap.currentSponsorName}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">{ap.impressions28Days.toLocaleString()} Views / 28 Days</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono">{ap.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: COMMERCIAL PROPOSAL GENERATOR */}
      {activeTab === 'proposal' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Builder */}
            <div className="p-8 rounded-[2.5rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] space-y-6 shadow-2xl">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">FOUNDATION PITCH DECK BUILDER</span>
                <h3 className="text-2xl font-black uppercase italic text-zinc-900 dark:text-white" style={{ fontFamily: D.head }}>
                  SPONSORSHIP PROPOSAL GENERATOR
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Target Corporate Prospect</label>
                  <Input 
                    value={proposalProspect}
                    onChange={e => setProposalProspect(e.target.value)}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Target Rights Tier</label>
                  <select
                    value={proposalTier}
                    onChange={e => setProposalTier(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white font-mono"
                  >
                    <option value="TITLE_PARTNER">Title Partner (R 500,000 / yr)</option>
                    <option value="BROADCAST_PARTNER">Broadcast Partner (R 250,000 / yr)</option>
                    <option value="PERIMETER_PARTNER">Perimeter Partner (R 100,000 / yr)</option>
                    <option value="ACADEMY_BENEFACTOR">Academy Benefactor (R 50,000 / yr)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 block mb-1">Contract Duration (Years)</label>
                  <Input 
                    type="number"
                    min={1}
                    max={5}
                    value={proposalDurationYears}
                    onChange={e => setProposalDurationYears(parseInt(e.target.value) || 1)}
                    className="bg-zinc-50 dark:bg-black border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white font-mono rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Generated Proposal Sheet */}
            <div className="p-8 rounded-[2.5rem] border bg-gradient-to-br from-zinc-900 via-zinc-950 to-black dark:from-slate-900 dark:via-black dark:to-slate-950 border-amber-500/30 space-y-6 shadow-2xl relative overflow-hidden text-white">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <Badge className="bg-amber-500/20 text-amber-300 font-mono text-[9px] mb-2">OFFICIAL PROPOSAL DRAFT</Badge>
                  <h4 className="text-2xl font-black text-white">{proposalProspect}</h4>
                  <span className="text-xs text-zinc-400 font-mono">SCRBRD School Sports Foundation Rights</span>
                </div>
                <Button className="bg-amber-500 text-black text-xs font-bold gap-2">
                  <Download className="w-4 h-4" /> Export Pitch Deck
                </Button>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-[9px] font-mono text-zinc-400 block">TOTAL CONTRACT VALUE ({proposalDurationYears} YRS)</span>
                <div className="text-3xl font-black text-amber-400 font-mono">
                  R {(
                    (proposalTier === 'TITLE_PARTNER' ? 500000 : proposalTier === 'BROADCAST_PARTNER' ? 250000 : proposalTier === 'PERIMETER_PARTNER' ? 100000 : 50000) * proposalDurationYears
                  ).toLocaleString()}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">Included Corporate Perks:</span>
                {selectedPerks.map((perk, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {perk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
