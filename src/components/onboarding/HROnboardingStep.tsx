'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ShieldCheck, FileText, Building, ArrowRight, ArrowLeft,
  UploadCloud, CreditCard, Users, Clock, Loader2, AlertCircle,
  ExternalLink, Info,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// ── Icon registry ───────────────────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  'file-text': <FileText className="w-5 h-5" />,
  'shield-check': <ShieldCheck className="w-5 h-5" />,
  'building': <Building className="w-5 h-5" />,
  'clock': <Clock className="w-5 h-5" />,
  'users': <Users className="w-5 h-5" />,
  'credit-card': <CreditCard className="w-5 h-5" />,
  'alert-circle': <AlertCircle className="w-5 h-5" />,
  'info': <Info className="w-5 h-5" />,
  'external-link': <ExternalLink className="w-5 h-5" />,
};

const ICON_SMALL: Record<string, React.ReactNode> = {
  'users': <Users className="w-5 h-5" />,
  'credit-card': <CreditCard className="w-5 h-5" />,
  'shield-check': <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />,
  'alert-circle': <AlertCircle className="w-5 h-5 flex-shrink-0" />,
  'info': <Info className="w-5 h-5 flex-shrink-0" />,
};

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  rose: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
  slate: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
};

const BADGE_COLORS: Record<string, string> = {
  rose: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
  amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
  emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
  indigo: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
};

// ── Types ───────────────────────────────────────────────────
interface ContentBlock {
  type: 'info' | 'upload' | 'input' | 'cards' | 'alert' | 'link' | 'acknowledge';
  // info
  text?: string;
  // upload
  label?: string;
  hint?: string;
  accept?: string;
  // input
  placeholder?: string;
  input_type?: string;
  // cards
  items?: { title: string; subtitle: string; icon: string; color: string; url?: string }[];
  // alert
  style?: 'info' | 'warning';
  icon?: string;
  title?: string;
  // link
  url?: string;
  link_text?: string;
  // acknowledge
}

interface StepDef {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  badge?: { text: string; color: string } | null;
  content_blocks?: ContentBlock[];
  completed?: boolean;
  completed_at?: string | null;
}

// ── Simple markdown bold renderer ───────────────────────────
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ── Block renderers ─────────────────────────────────────────
function InfoBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-300">
      <p><RichText text={block.text || ''} /></p>
    </div>
  );
}

function UploadBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 transition-colors">
        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
      </div>
      <p className="text-slate-800 dark:text-white font-medium mb-1">{block.label || 'Drag and drop files here'}</p>
      {block.hint && <p className="text-sm text-slate-400 dark:text-slate-500">{block.hint}</p>}
    </div>
  );
}

function InputBlock({ block }: { block: ContentBlock }) {
  return (
    <div className="space-y-4">
      {block.label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{block.label}</label>}
      <input
        type={block.input_type || 'text'}
        placeholder={block.placeholder || ''}
        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {block.hint && <p className="text-xs text-slate-400 dark:text-slate-500">{block.hint}</p>}
    </div>
  );
}

function CardsBlock({ block }: { block: ContentBlock }) {
  const items = block.items || [];
  return (
    <div className={`grid grid-cols-1 ${items.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
      {items.map((card, i) => {
        const Wrapper = card.url ? 'a' : 'div';
        const extraProps = card.url ? { href: card.url, target: '_blank', rel: 'noopener noreferrer' } : {};
        return (
          <Wrapper
            key={i}
            {...extraProps}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${COLOR_MAP[card.color] || COLOR_MAP.slate}`}>
              {ICON_SMALL[card.icon] || <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 dark:text-white font-medium flex items-center gap-2">
                {card.title}
                {card.url && <ExternalLink className="w-3 h-3 text-slate-400" />}
              </p>
              {card.subtitle && <p className="text-xs text-slate-400 dark:text-slate-500">{card.subtitle}</p>}
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}

function AlertBlock({ block }: { block: ContentBlock }) {
  const isWarning = block.style === 'warning';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${
      isWarning
        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
        : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20'
    }`}>
      <div className={`mt-0.5 ${isWarning ? 'text-amber-500' : 'text-indigo-500 dark:text-indigo-400'}`}>
        {ICON_SMALL[block.icon || 'info'] || <Info className="w-5 h-5 flex-shrink-0" />}
      </div>
      <div>
        {block.title && (
          <h4 className={`text-sm font-bold mb-1 ${isWarning ? 'text-amber-700 dark:text-amber-400' : 'text-indigo-700 dark:text-indigo-400'}`}>
            {block.title}
          </h4>
        )}
        <p className={`text-sm ${isWarning ? 'text-slate-500 dark:text-slate-400' : 'text-indigo-700 dark:text-indigo-200'}`}>
          <RichText text={block.text || ''} />
        </p>
      </div>
    </div>
  );
}

function LinkBlock({ block }: { block: ContentBlock }) {
  return (
    <a
      href={block.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
    >
      <ExternalLink className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
      <div>
        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{block.link_text || block.url}</p>
        {block.hint && <p className="text-xs text-indigo-500/70 dark:text-indigo-400/60 mt-0.5">{block.hint}</p>}
      </div>
    </a>
  );
}

function AcknowledgeBlock({ block }: { block: ContentBlock }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="accent-indigo-500 w-4 h-4 mt-0.5 shrink-0"
      />
      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{block.label || 'I acknowledge'}</span>
    </label>
  );
}

function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'info': return <InfoBlock block={block} />;
    case 'upload': return <UploadBlock block={block} />;
    case 'input': return <InputBlock block={block} />;
    case 'cards': return <CardsBlock block={block} />;
    case 'alert': return <AlertBlock block={block} />;
    case 'link': return <LinkBlock block={block} />;
    case 'acknowledge': return <AcknowledgeBlock block={block} />;
    default: return null;
  }
}

// ── Main component ──────────────────────────────────────────
export function HROnboardingStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [steps, setSteps] = useState<StepDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [confirmSkip, setConfirmSkip] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/onboarding/me`, { credentials: 'include' });
      if (!res.ok) return;
      const data: { steps: StepDef[]; all_completed: boolean } = await res.json();
      setSteps(data.steps);

      if (data.all_completed) {
        onNext();
        return;
      }

      const firstIncomplete = data.steps.findIndex((s) => !s.completed);
      if (firstIncomplete >= 0) setCurrentSubStep(firstIncomplete);
    } catch {
      // Fallback: fetch step definitions without completion status
      try {
        const res = await fetch(`${API_BASE}/onboarding/steps`);
        if (res.ok) {
          const data: { steps: StepDef[] } = await res.json();
          setSteps(data.steps);
        }
      } catch { /* no-op */ }
    } finally {
      setLoading(false);
    }
  }, [onNext]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const markComplete = useCallback(async (stepId: string) => {
    try {
      const res = await fetch(`${API_BASE}/onboarding/me/complete`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_id: stepId }),
      });
      if (res.ok) {
        const data: { steps: StepDef[]; all_completed: boolean } = await res.json();
        setSteps(data.steps);
        return data.all_completed;
      }
    } catch { /* no-op */ }
    return false;
  }, []);

  const handleNext = async () => {
    const safeIdx = Math.min(currentSubStep, steps.length - 1);
    const currentStep = steps[safeIdx];
    if (currentStep) {
      const allDone = currentStep.completed ? false : await markComplete(currentStep.id);
      if (allDone) { onNext(); return; }
    }
    // After marking complete, the step disappears — stay at same index
    // (which now points to the next pending step) or advance
    if (safeIdx >= steps.length - 1) {
      onNext();
      return;
    }
    setCurrentSubStep(safeIdx + 1);
    setConfirmSkip(false);
  };

  const handleSkip = () => {
    const nextIdx = currentSubStep + 1;
    if (nextIdx >= steps.length) onNext();
    else setCurrentSubStep(nextIdx);
    setConfirmSkip(false);
  };

  // Filter to only incomplete steps — completed ones disappear from the wizard
  const completedCount = steps.filter((s) => s.completed).length;
  const remainingCount = steps.length - completedCount;
  const allDone = steps.length > 0 && completedCount === steps.length;

  // All steps completed — show completion screen then auto-advance
  useEffect(() => {
    if (allDone) {
      const timer = setTimeout(() => onNext(), 2500);
      return () => clearTimeout(timer);
    }
  }, [allDone, onNext]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (steps.length === 0) return null;

  if (allDone) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-10 md:p-14 shadow-xl"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">HR Onboarding Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            All {steps.length} steps have been completed. Taking you to the credentialing portal now...
          </p>
          <div className="flex items-center justify-center gap-2 text-indigo-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Loading credentialing portal</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Clamp currentSubStep to valid range for the full step sequence
  const safeIdx = Math.min(currentSubStep, steps.length - 1);
  const currentStepData = steps[safeIdx];
  const progressWidth = steps.length > 1 ? (safeIdx / (steps.length - 1)) * 100 : 100;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Completed summary */}
      {completedCount > 0 && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
            {completedCount} of {steps.length} HR steps completed. {remainingCount} remaining.
          </p>
        </div>
      )}

      {/* Step Indicator — only shows pending steps */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-6 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full" />
        <div className="absolute left-0 top-6 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${progressWidth}%` }} />
        {steps.map((step, idx) => {
          const isActive = idx === safeIdx;
          const isCompleted = !!step.completed;
          const isPast = idx < safeIdx;
          return (
            <button key={step.id} onClick={() => { setCurrentSubStep(idx); setConfirmSkip(false); }} className="flex flex-col items-center gap-3 cursor-pointer">
              <div className={`w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-950 flex items-center justify-center transition-colors duration-500 ${
                isActive ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]'
                  : isCompleted ? 'bg-emerald-500 text-white'
                  : isPast ? 'bg-indigo-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {isCompleted && !isActive ? <Check className="w-5 h-5" /> : (ICONS[step.icon || ''] || <FileText className="w-5 h-5" />)}
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400'
                  : isCompleted ? 'text-emerald-600 dark:text-emerald-400'
                  : isPast ? 'text-slate-700 dark:text-slate-300'
                  : 'text-slate-400 dark:text-slate-600'
                }`}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 min-h-[500px] relative overflow-hidden shadow-xl dark:shadow-2xl flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentStepData && (
              <motion.div key={currentStepData.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentStepData.title}</h2>
                    {currentStepData.description && (
                      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">{currentStepData.description}</p>
                    )}
                  </div>
                  {currentStepData.badge && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${BADGE_COLORS[currentStepData.badge.color] || BADGE_COLORS.slate}`}>
                      {currentStepData.badge.text}
                    </span>
                  )}
                </div>

                {/* Dynamic content blocks */}
                {(currentStepData.content_blocks || []).map((block, i) => (
                  <ContentBlockRenderer key={i} block={block} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirmation Banner */}
        <AnimatePresence>
          {confirmSkip && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <p className="text-sm text-amber-700 dark:text-amber-300 flex-1 font-medium">Complete this step now, or move forward and come back to it later.</p>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setConfirmSkip(false)} className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Go back</button>
                <button onClick={handleSkip} className="px-3 py-1.5 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">Skip for now</button>
                <button onClick={handleNext} className="px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-colors">Mark complete</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-200 dark:border-slate-800/80">
          <button
            onClick={() => {
              setConfirmSkip(false);
              if (safeIdx === 0) onBack();
              else setCurrentSubStep((prev) => prev - 1);
            }}
            className="flex items-center gap-2 px-5 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all font-medium whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={() => setConfirmSkip(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 whitespace-nowrap"
          >
            {safeIdx === steps.length - 1 ? 'Go to Credentialing' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
