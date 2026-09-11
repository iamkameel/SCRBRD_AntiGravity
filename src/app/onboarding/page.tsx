'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { School, Shield, Users, CheckCircle, ArrowRight, ArrowLeft, Trophy, Zap, Loader2 } from 'lucide-react';
import { UserRole, USER_ROLES } from '@/lib/roles';
import { useAuth } from '@/contexts/AuthContext';
import { resolveSchoolByEmailAction, completeOnboardingAction } from '@/app/actions/personActions';
import { toast } from 'sonner';

type Step = 'school' | 'role' | 'team' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<Step>('school');
  const [schoolName, setSchoolName] = useState('');
  const [schoolRegion, setSchoolRegion] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(USER_ROLES.SPORTSMASTER);
  const [teamName, setTeamName] = useState('');
  const [ageGroup, setAgeGroup] = useState('1st XI');
  const [autoDetectedSchool, setAutoDetectedSchool] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Auto-detect institutional domain mapping on mount
  useEffect(() => {
    async function checkDomainMapping() {
      if (!user?.email) return;
      setIsDetecting(true);
      try {
        const res = await resolveSchoolByEmailAction(user.email);
        if (res.success && res.school) {
          setSchoolName(res.school.schoolName);
          setAutoDetectedSchool(res.school.schoolName);
          toast.success(`Institutional clearance detected: ${res.school.schoolName}`);
        }
      } catch (err) {
        console.error('Domain auto-detection failed:', err);
      } finally {
        setIsDetecting(false);
      }
    }
    checkDomainMapping();
  }, [user]);

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (schoolName.trim()) setCurrentStep('role');
  };

  const handleRoleSubmit = () => {
    setCurrentStep('team');
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    setIsSubmitting(true);
    try {
      const emailToUse = user?.email || 'admin@school.co.za';
      const result = await completeOnboardingAction({
        email: emailToUse,
        schoolName,
        schoolRegion: schoolRegion || undefined,
        role: selectedRole,
        teamName,
        ageGroup,
      });

      if (result.success) {
        toast.success('Institutional allocation complete!');
        setCurrentStep('complete');
      } else {
        const errorMsg = 'error' in result ? result.error : 'Failed to complete setup';
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error in handleTeamSubmit:', error);
      toast.error('An unexpected error occurred during institutional assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string }[] = [
    { role: USER_ROLES.SPORTSMASTER, title: 'Sportsmaster / Director of Sport', desc: 'Oversee school fixtures, facilities, transport, readiness, and staff access.' },
    { role: USER_ROLES.COACH, title: 'Coach', desc: 'Manage squads, line-ups, skill matrices, and training plans.' },
    { role: USER_ROLES.SCORER, title: 'Scorer / Official', desc: 'Score live matches with ball-by-ball precision and wagon wheel.' },
    { role: USER_ROLES.PLAYER, title: 'Player', desc: 'Track your career stats, readiness, accolades, and skill development.' },
  ];

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-[#161D2F] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-lg text-white tracking-tight">SCRBRD OS</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <span className={currentStep === 'school' ? 'text-indigo-400 font-bold' : ''}>1. Institution</span>
            <span>&rarr;</span>
            <span className={currentStep === 'role' ? 'text-indigo-400 font-bold' : ''}>2. Role</span>
            <span>&rarr;</span>
            <span className={currentStep === 'team' ? 'text-indigo-400 font-bold' : ''}>3. Team</span>
          </div>
        </div>

        {/* STEP 1: SCHOOL */}
        {currentStep === 'school' && (
          <form onSubmit={handleSchoolSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <School className="w-4 h-4" /> Step 1 of 3
              </div>
              <h2 className="text-2xl font-bold text-white">Select or Confirm Your Institution</h2>
              <p className="text-sm text-gray-400">Set up institutional access control & scoping for all departmental fixtures and squads.</p>
            </div>

            {autoDetectedSchool && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-3 text-xs text-indigo-300">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                <span>
                  Auto-detected <strong>{autoDetectedSchool}</strong> clearance based on your email domain (<strong>{user?.email}</strong>).
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  School / Institution Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Westville Boys' High School"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
                  />
                  {isDetecting && (
                    <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-indigo-400 animate-spin" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Region / Province
                </label>
                <input
                  type="text"
                  placeholder="e.g. KwaZulu-Natal"
                  value={schoolRegion}
                  onChange={(e) => setSchoolRegion(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!schoolName.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: ROLE */}
        {currentStep === 'role' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Shield className="w-4 h-4" /> Step 2 of 3
              </div>
              <h2 className="text-2xl font-bold text-white">Select Your Access Clearance</h2>
              <p className="text-sm text-gray-400">Choose your operational clearance at <strong className="text-white">{schoolName}</strong>.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {rolesList.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedRole === r.role
                      ? 'bg-indigo-500/10 border-indigo-400 text-white'
                      : 'bg-[#0B0F17] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedRole === r.role ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
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
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg"
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
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Users className="w-4 h-4" /> Step 3 of 3
              </div>
              <h2 className="text-2xl font-bold text-white">Provision Primary Squad Unit</h2>
              <p className="text-sm text-gray-400">Establish your first team to initialize operational readiness tracking.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${schoolName || 'WBHS'} 1st XI`}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Age / Division Suffix
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0B0F17] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-400 transition-colors"
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
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-3 border border-gray-700 hover:bg-gray-800 text-gray-300 font-semibold rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={!teamName.trim() || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Provisioning Clearance...
                  </>
                ) : (
                  <>
                    Complete Setup <CheckCircle className="w-4 h-4" />
                  </>
                )}
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
              <h2 className="text-2xl font-bold text-white">Institutional Allocation Complete!</h2>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Welcome to SCRBRD OS. Your institution <strong className="text-white">{schoolName}</strong> and team <strong className="text-white">{teamName}</strong> are provisioned with <strong className="text-indigo-400">{selectedRole}</strong> clearance.
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              Enter Sportsmaster Command Hub
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
