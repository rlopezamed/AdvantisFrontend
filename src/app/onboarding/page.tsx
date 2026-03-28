'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { HROnboardingStep } from '@/components/onboarding/HROnboardingStep';
import { OnboardingDashboard } from '@/components/onboarding/OnboardingDashboard';
import { ArrowRight, Loader2, Phone, Mail, ShieldCheck } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

type StepState = 'auth' | 'welcome' | 'hr-docs' | 'credentialing';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Auth Gate Component ──────────────────────────────────────
function AuthGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [phase, setPhase] = useState<'identifier' | 'otp' | 'risk'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [riskChallengeId, setRiskChallengeId] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isPhone = /^\+?\d[\d\s()-]{6,}$/.test(identifier.trim());
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const canSubmit = isPhone || isEmail;

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Failed to send verification code'); return; }
      setChallengeId(data.challenge_id);
      if (data.dev_otp_code) setDevCode(data.dev_otp_code);
      setPhase('otp');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(code: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ challenge_id: challengeId, code, device_id: 'browser' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Invalid code'); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); return; }
      if (data.next === 'authenticated') {
        onAuthenticated();
      } else if (data.next === 'risk_challenge') {
        // Second OTP required via /auth/challenge/verify
        setRiskChallengeId(data.risk_challenge_id);
        if (data.dev_otp_code) setDevCode(data.dev_otp_code);
        setOtp(['', '', '', '', '', '']);
        setError('');
        setPhase('risk');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleRiskVerify(code: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/challenge/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ risk_challenge_id: riskChallengeId, code, device_id: 'browser' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Invalid code'); setOtp(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); return; }
      if (data.next === 'authenticated') onAuthenticated();
    } catch {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    const full = next.join('');
    if (full.length === 6) {
      if (phase === 'risk') handleRiskVerify(full);
      else handleVerify(full);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setOtp(next);
      if (phase === 'risk') handleRiskVerify(pasted);
      else handleVerify(pasted);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/50 rounded-[2rem] shadow-2xl shadow-indigo-500/10 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              {phase === 'identifier' ? (
                <Phone className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {phase === 'identifier' ? 'Verify your identity' : phase === 'risk' ? 'Additional verification' : 'Enter verification code'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {phase === 'identifier'
                ? 'Enter the phone number or email associated with your application.'
                : phase === 'risk'
                ? 'For your security, please enter the additional verification code.'
                : `We sent a 6-digit code to ${identifier}`}
            </p>
          </div>

          {phase === 'identifier' ? (
            <form onSubmit={handleStart} className="space-y-4" autoComplete="off">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Phone number or email"
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-center text-lg tracking-wide"
              />
              {error && <p className="text-sm text-rose-500 text-center">{error}</p>}
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:shadow-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Send verification code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {devCode && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">DEV MODE — Code:</p>
                  <p className="text-2xl font-mono font-bold text-amber-700 dark:text-amber-300 tracking-[0.3em]">{devCode}</p>
                </div>
              )}

              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                  />
                ))}
              </div>

              {error && <p className="text-sm text-rose-500 text-center">{error}</p>}

              {loading && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              )}

              <button
                onClick={() => { setPhase('identifier'); setOtp(['', '', '', '', '', '']); setError(''); setDevCode(null); }}
                className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium py-2"
              >
                Use a different phone number or email
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<StepState>('auth');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [profile, setProfile] = useState<{ name: string; role: string; facility: string } | null>(null);
  const [appData, setAppData] = useState<{
    clinicianName: string; facility: string;
    specialistName: string; specialistTitle: string;
  } | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(() => {
        // Authenticated — load profile + determine starting step
        loadProfileAndStep();
      })
      .catch(() => {
        setCurrentStep('auth');
        setCheckingAuth(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadProfileAndStep() {
    // Fetch clinician profile
    fetch(`${API_BASE}/applications/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.clinician_name) {
          setProfile({
            name: data.clinician_name,
            role: data.specialty || data.job_title || '',
            facility: data.facility_name,
          });
          setAppData({
            clinicianName: data.clinician_name,
            facility: data.facility_name,
            specialistName: data.specialist_name || '',
            specialistTitle: data.specialist_title || 'Credentialing Specialist',
          });
        }
      })
      .catch(() => {});

    // Check HR step completion to determine starting view
    fetch(`${API_BASE}/onboarding/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.all_completed) {
          setCurrentStep('credentialing');
        } else if (data?.steps?.some((s: { completed: boolean }) => s.completed)) {
          setCurrentStep('hr-docs');
        } else {
          setCurrentStep('welcome');
        }
      })
      .catch(() => {
        setCurrentStep('welcome');
      })
      .finally(() => setCheckingAuth(false));
  }

  function handleAuthenticated() {
    loadProfileAndStep();
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Background Visuals */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0"></div>
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 min-h-screen flex flex-col">

        {/* Global Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Advantis Medical
            </h1>
            <p className="mt-2 text-sm text-slate-400 font-medium">Clinician Onboarding & Credentialing</p>
          </div>
          {currentStep !== 'auth' && currentStep !== 'welcome' && profile?.name && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{profile.name}</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium tracking-wide">{profile.role} - {profile.facility}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg text-white font-bold tracking-wider">
                {initials(profile.name)}
              </div>
            </motion.div>
          )}
        </header>

        {/* Dynamic Content Views */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {currentStep === 'auth' && (
              <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex-1">
                <AuthGate onAuthenticated={handleAuthenticated} />
              </motion.div>
            )}

            {currentStep === 'welcome' && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex-1">
                <WelcomeStep
                  onNext={() => setCurrentStep('hr-docs')}
                  clinicianName={appData?.clinicianName}
                  facilityName={appData?.facility}
                  specialistName={appData?.specialistName}
                  specialistTitle={appData?.specialistTitle}
                />
              </motion.div>
            )}

            {currentStep === 'hr-docs' && (
              <motion.div key="hr-docs" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="flex-1">
                <HROnboardingStep
                  onBack={() => setCurrentStep('welcome')}
                  onNext={() => setCurrentStep('credentialing')}
                />
              </motion.div>
            )}

            {currentStep === 'credentialing' && (
              <motion.div key="credentialing" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="flex-1">
                <div className="mb-4 md:mb-8 pr-16 md:pr-0">
                  <button
                    onClick={() => setCurrentStep('hr-docs')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    ← Back to HR Documents
                  </button>
                  <h2 className="text-2xl md:text-3xl font-bold mt-2 md:mt-4 text-slate-900 dark:text-white">Clinical Credentialing Portal</h2>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 md:mt-2 max-w-2xl">Manage your intensive clinical uploads and verifications. Our AI Agent will review them instantly.</p>
                </div>
                <OnboardingDashboard onProfileLoaded={setProfile} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
