'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { School, Shield, Users, CheckCircle, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import { UserRole, USER_ROLES } from '@/lib/roles';

type Step = 'school' | 'role' | 'team' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('school');
  const [schoolName, setSchoolName] = useState('');
  const [schoolRegion, setSchoolRegion] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.COACH);
  const [teamName, setTeamName] = useState('');
  const [ageGroup, setAgeGroup] = useState('1st XI');

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (schoolName.trim()) setCurrentStep('role');
  };

  const handleRoleSubmit = () => {
    setCurrentStep('team');
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) setCurrentStep('complete');
  };

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: USER_ROLES.COACH, title: 'Coach', desc: 'Manage squads, line-ups, skill matrices, and training plans.' },
    { role: USER_ROLES.SPORTSMASTER, title: 'Sportsmaster / Admin', desc: 'Oversee school fixtures, facilities, transport, and staff access.' },
    { role: USER_ROLES.SCORER, title: 'Scorer / Official', desc: 'Score live matches with ball-by-ball precision and wagon wheel.' },
    { role: USER_ROLES.PLAYER, title: 'Player', desc: 'Track your career stats, readiness, accolades, and skill development.' },
  ];

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#161D2F] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span className="font-bold text-lg text-white">SCRBRD OS</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <span className={currentStep === 'school' ? 'text-amber-400 font-bold' : ''}>1. School</span>
            <span>&rarr;</span>
            <span className={currentStep === 'role' ? 'text-amber-400 font-bold' : ''}>2. Role</span>
            <span>&rarr;</span>
            <span className={currentStep === 'team' ? 'text-amber-400 font-bold' : ''}>3. Team</span>
          </div>
        </div>

        {/* STEP 1: SCHOOL */}
        {currentStep === 'school' && (
          <form onSubmit={handleSchoolSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <School className="w-4 h-4" /> Step 1 of 3
              </div>
              <h2 className="text-2xl font-bold text-white">Select or Add Your School</h2>
              <p className="text-sm text-gray-400">Set up the institutional context for all your fixtures and squads.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saint Stithians College"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Region / Province
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gauteng"
                  value={schoolRegion}
                  onChange={(e) => setSchoolRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!schoolName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-bold rounded-lg transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: ROLE */}
        {currentStep === 'role' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Shield className="w-4 h-4" /> Step 2 of 3
              </div>
              <h2 className="text-2xl font-bold text-white">Select Your Primary Role</h2>
              <p className="text-sm text-gray-400">Choose your operational role at {schoolName}.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedRole === r.role
                      ? 'bg-amber-500/10 border-amber-400 text-white'
                      : 'bg-[#0B0F17] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedRole === r.role ? 'bg-amber-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{r.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('school')}
                className="flex items-center gap-1.5 px-4 py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleRoleSubmit}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-lg transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INITIAL TEAM */}
        {currentStep === 'team' && (
          <form onSubmit={handleTeamSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Users className="w-4 h-4" /> Step 3 of 3
              </div>
              <h2 className="text-2xl font-bold text-white">Create Your First Team</h2>
              <p className="text-sm text-gray-400">Set up a squad to start managing fixtures and player stats.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St Stithians 1st XI Boys"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Age / Division
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
                >
                  <option value="1st XI">1st XI</option>
                  <option value="2nd XI">2nd XI</option>
                  <option value="Under 15A">Under 15A</option>
                  <option value="Under 14A">Under 14A</option>
                  <option value="Junior School">Junior School</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep('role')}
                className="flex items-center gap-1.5 px-4 py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={!teamName.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-bold rounded-lg transition-colors"
              >
                Complete Setup <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: COMPLETE */}
        {currentStep === 'complete' && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Setup Complete!</h2>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Welcome to SCRBRD OS. Your school <strong className="text-white">{schoolName}</strong> and team <strong className="text-white">{teamName}</strong> are configured for <strong className="text-white">{selectedRole}</strong> access.
              </p>
            </div>

            <button
              onClick={() => router.push('/matches')}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold rounded-xl transition-colors shadow-lg"
            >
              Go to Match Operations Hub
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
