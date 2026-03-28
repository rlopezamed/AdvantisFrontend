'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type CredentialingApp,
  type TaskGroup,
  type Requirement,
  type RequirementStatus,
} from '@/data/mockCredentialingApp';
import { DashboardTaskGroup } from './DashboardTaskGroup';
import { CredentialingChat } from './CredentialingChat';
import { MessageCircle, X, Sun, Moon, Loader2, WifiOff, ClipboardList } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface ApiRequirement {
  id: number;
  group_title: string;
  title: string;
  status: string;
  is_required: boolean;
  description?: string | null;
  rejection_reason?: string | null;
  visibility?: string;
  req_type?: string;
  is_highlighted?: boolean;
}

interface ApiGroup {
  title: string;
  requirements: ApiRequirement[];
}

interface ApiApplication {
  id: number;
  clinician_name: string;
  facility_name: string;
  job_title: string;
  specialty?: string;
  stage?: string;
  progress_pct: number;
  deadline?: string;
  total_requirements: number;
  completed_requirements: number;
  specialist_name?: string | null;
  specialist_email?: string | null;
  specialist_phone?: string | null;
  specialist_initials?: string | null;
  specialist_title?: string | null;
}

function mapReqType(apiType?: string): Requirement['type'] {
  switch (apiType) {
    case 'checkbox': return 'form';
    case 'form': return 'form';
    case 'esign': return 'esign';
    case 'automated': return 'automated';
    default: return 'upload';
  }
}

function daysUntil(dateStr?: string): number {
  if (!dateStr) return 30;
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function mapApiToApp(app: ApiApplication, groups: ApiGroup[]): CredentialingApp {
  const taskGroups: TaskGroup[] = groups
    .filter((g) =>
      g.requirements.some((r) => !r.visibility || r.visibility === 'clinician'),
    )
    .map((g, idx) => ({
      id: `tg-${idx}`,
      title: g.title,
      requirements: g.requirements
        .filter((r) => !r.visibility || r.visibility === 'clinician')
        .map((r) => ({
          id: String(r.id),
          title: r.title,
          description: r.description ?? undefined,
          status: r.status as RequirementStatus,
          rejectionReason: r.rejection_reason ?? undefined,
          isRequired: r.is_required,
          type: mapReqType(r.req_type),
        })),
    }));

  return {
    applicantDetails: {
      name: app.clinician_name,
      role: app.specialty || app.job_title || '',
      facility: app.facility_name,
      stage: app.stage || 'Credentialing & Compliance',
      progressPercentage: app.progress_pct,
      daysLeft: daysUntil(app.deadline),
    },
    specialist: app.specialist_name
      ? {
          name: app.specialist_name,
          role: app.specialist_title || 'Credentialing Specialist',
          email: app.specialist_email || '',
          phone: app.specialist_phone || '',
          imageUrl: app.specialist_initials || app.specialist_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        }
      : null,
    taskGroups,
  };
}

interface DashboardProps {
  onProfileLoaded?: (profile: { name: string; role: string; facility: string }) => void;
}

export function OnboardingDashboard({ onProfileLoaded }: DashboardProps = {}) {
  const [data, setData] = useState<CredentialingApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [noApplication, setNoApplication] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const appRes = await fetch(`${API_BASE}/applications/me`, { credentials: 'include' });

      if (appRes.status === 404 || appRes.status === 401) {
        setNoApplication(true);
        setOffline(false);
        return;
      }

      if (!appRes.ok) {
        setOffline(true);
        return;
      }

      const appJson = await appRes.json();
      const app: ApiApplication =
        appJson.applications ? appJson.applications[0] : appJson;

      const reqRes = await fetch(`${API_BASE}/requirements/me`, { credentials: 'include' });
      const reqJson: ApiGroup[] = reqRes.ok ? await reqRes.json() : { groups: [], flat: [] };
      const groups: ApiGroup[] = Array.isArray(reqJson) ? reqJson : (reqJson as any).groups || [];

      const mapped = mapApiToApp(app, groups);
      setData(mapped);
      setNoApplication(false);
      setOffline(false);
      onProfileLoaded?.({
        name: app.clinician_name,
        role: app.specialty || app.job_title || '',
        facility: app.facility_name,
      });
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onProfileLoaded]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      (!document.documentElement.className &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (noApplication || !data) {
    return (
      <div className="flex items-center justify-center py-20 md:py-32 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 md:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl w-full"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white mb-3">
            No Active Applications
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            There are no credentialing applications associated with your account right now.
            Once your recruiter submits a new placement, your onboarding steps will appear here automatically.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            We&apos;ll check for updates every 30 seconds
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pb-32 max-w-7xl mx-auto relative">
        
        <div className="col-span-1 lg:col-span-2 space-y-4 md:space-y-6 flex flex-col">
          
          {/* Progress Strip */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-5 p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md md:shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 -translate-x-[100%] group-hover:animate-none md:group-hover:animate-[shimmer_2s_infinite]"></div>
            
            <div className="relative z-10 flex-col flex items-center md:items-start text-center md:text-left">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Execution Plan</h2>
                <button 
                  onClick={toggleTheme}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                  title="Toggle Theme"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                {offline && (
                  <span className="flex items-center gap-1 text-xs text-amber-500" title="Using cached data">
                    <WifiOff className="w-3.5 h-3.5" /> Offline
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 md:mt-1.5 flex items-center gap-1.5 md:gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50"></span>
                </span>
                Stage: {data.applicantDetails.stage}
              </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-center gap-4 md:gap-8 bg-slate-50 dark:bg-slate-950/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
              <div className="text-center md:text-right">
                <span className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white leading-none">{data.applicantDetails.progressPercentage}%</span>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Complete</p>
              </div>
              <div className="h-8 md:h-12 w-px bg-slate-200 dark:bg-slate-800"></div>
              <div className="text-center md:text-right">
                <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">{data.applicantDetails.daysLeft}</span>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Days Left</p>
              </div>
            </div>
          </div>

          {/* Task Groups */}
          <div className="space-y-3 md:space-y-4 relative z-0">
            {data.taskGroups.map((group, idx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <DashboardTaskGroup group={group} defaultOpen={idx === 0 || idx === 1} onRequirementUpdated={fetchData} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Inline Assistant */}
        <div className="hidden lg:block col-span-1">
          <CredentialingChat specialist={data.specialist} />
        </div>
      </div>

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMobileChatOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-[0_8px_30px_rgb(79,70,229,0.5)] z-40 border border-indigo-400/50"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileChatOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[90vw] max-w-[400px] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 overflow-y-auto border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md px-4 py-4 md:py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white text-lg">Support & Chat</h2>
                <button 
                  onClick={() => setIsMobileChatOpen(false)}
                  className="p-2 -mr-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 md:p-6 flex-1 overflow-y-auto">
                <CredentialingChat specialist={data.specialist} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
