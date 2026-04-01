'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  ExternalLink,
  FileSignature,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { AdvantisLogo } from '@/components/brand/AdvantisLogo';
import { useRouter } from 'next/navigation';
import { getMyOfferSigningSession, PortalApiError, type OfferSigningSession } from '@/lib/portal-api';

type ScreenState =
  | { kind: 'loading' }
  | { kind: 'auth-required'; message: string }
  | { kind: 'preparing'; message: string }
  | { kind: 'ready'; session: OfferSigningSession }
  | { kind: 'signed'; session: OfferSigningSession }
  | { kind: 'declined'; session: OfferSigningSession }
  | { kind: 'error'; message: string; session?: OfferSigningSession | null };

function formatDocumentLabel(value: string): string {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function OfferPortal() {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenState>({ kind: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadSession(showSpinner = false) {
    if (showSpinner) setIsRefreshing(true);
    else setScreen({ kind: 'loading' });

    try {
      const session = await getMyOfferSigningSession();

      if (session.status === 'signed') {
        setScreen({ kind: 'signed', session });
      } else if (session.status === 'declined') {
        setScreen({ kind: 'declined', session });
      } else if (session.status === 'ready' && session.embedUrl) {
        setScreen({ kind: 'ready', session });
      } else if (session.status === 'preparing') {
        setScreen({
          kind: 'preparing',
          message: 'Your Travel Assignment Confirmation is being prepared. This usually takes less than a minute.',
        });
      } else {
        setScreen({
          kind: 'error',
          message: 'We found your signing request, but the embedded session is not ready yet.',
          session,
        });
      }
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (error.status === 401) {
          setScreen({
            kind: 'auth-required',
            message: 'Please verify your identity in the portal before reviewing your assignment confirmation.',
          });
        } else if (error.status === 404) {
          setScreen({
            kind: 'preparing',
            message: 'We do not have a signing session for you yet. HR may still be preparing your documents.',
          });
        } else {
          setScreen({ kind: 'error', message: error.message });
        }
      } else {
        setScreen({
          kind: 'error',
          message: 'We could not load your signing session right now. Please try again in a moment.',
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSession();
  }, []);

  const activeSession =
    screen.kind === 'ready' ||
    screen.kind === 'signed' ||
    screen.kind === 'declined' ||
    screen.kind === 'error'
      ? screen.session
      : null;
  const documentLabels = activeSession?.documents?.length
    ? activeSession.documents.map(formatDocumentLabel)
    : ['Travel Assignment Confirmation'];
  const statusLabel =
    screen.kind === 'loading'
      ? 'Loading'
      : screen.kind === 'ready'
        ? 'Ready to sign'
        : screen.kind === 'signed'
          ? 'Signed'
          : screen.kind === 'declined'
            ? 'Declined'
            : screen.kind === 'preparing'
              ? 'Preparing'
              : screen.kind === 'auth-required'
                ? 'Verification required'
                : 'Needs attention';

  return (
    <div className="min-h-screen bg-[#102948] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#72c9ef]/18 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-14%] right-[-6%] w-[34%] h-[34%] rounded-full bg-[#4c8fd8]/20 blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[95vw] max-w-7xl min-h-[88vh] bg-slate-100 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        <div className="flex-1 p-4 lg:p-8 bg-slate-50 border-r border-slate-200 overflow-hidden flex flex-col min-h-[60vh]">
          <div className="mb-5 px-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Review Official Contract</h1>
              <p className="text-slate-500 font-medium text-sm">
                Review and complete your Travel Assignment Confirmation inside the portal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadSession(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#4c8fd8] hover:text-[#2f6ea8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh status
            </button>
          </div>

          <div className="flex-1 w-full relative rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-300 bg-white">
            {screen.kind === 'loading' && (
              <div className="h-full min-h-[520px] flex flex-col items-center justify-center gap-4 text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-[#4c8fd8]" />
                <p className="text-base font-medium">Loading your signing session...</p>
              </div>
            )}

            {screen.kind === 'ready' && screen.session.embedUrl && (
              <iframe
                src={screen.session.embedUrl}
                title="Travel Assignment Confirmation"
                className="h-full min-h-[720px] w-full border-0 bg-white"
                allow="fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}

            {screen.kind !== 'loading' && screen.kind !== 'ready' && (
              <div className="h-full min-h-[520px] flex flex-col items-center justify-center px-8 py-12 text-center">
                <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
                  screen.kind === 'signed'
                    ? 'bg-emerald-100 text-emerald-600'
                    : screen.kind === 'declined'
                      ? 'bg-rose-100 text-rose-600'
                      : screen.kind === 'auth-required'
                        ? 'bg-amber-100 text-amber-600'
                        : screen.kind === 'error'
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-[#eaf6fd] text-[#2f6ea8]'
                }`}>
                  {screen.kind === 'signed' ? (
                    <CheckCircle className="h-8 w-8" />
                  ) : screen.kind === 'declined' || screen.kind === 'error' ? (
                    <TriangleAlert className="h-8 w-8" />
                  ) : screen.kind === 'auth-required' ? (
                    <ShieldCheck className="h-8 w-8" />
                  ) : (
                    <FileSignature className="h-8 w-8" />
                  )}
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {screen.kind === 'signed'
                    ? 'Assignment Confirmation Signed'
                    : screen.kind === 'declined'
                      ? 'Assignment Confirmation Declined'
                      : screen.kind === 'auth-required'
                        ? 'Portal Verification Required'
                        : screen.kind === 'error'
                          ? 'We Need Your Attention'
                          : 'Preparing Your Documents'}
                </h2>

                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                  {screen.kind === 'signed'
                    ? 'Your Travel Assignment Confirmation has been completed successfully. You can continue into the onboarding portal now.'
                    : screen.kind === 'declined'
                      ? 'This assignment confirmation was declined. If that was not intentional, please contact your recruiter or HR specialist.'
                      : screen.kind === 'auth-required'
                        ? screen.message
                        : screen.kind === 'error'
                          ? screen.message
                          : screen.message}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {(screen.kind === 'preparing' || screen.kind === 'error') && (
                    <button
                      type="button"
                      onClick={() => void loadSession(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#4c8fd8] px-5 py-3 font-semibold text-white shadow-lg shadow-[#4c8fd8]/20 transition hover:bg-[#3378bc]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Check again
                    </button>
                  )}

                  {screen.kind === 'auth-required' && (
                    <button
                      type="button"
                      onClick={() => router.push('/onboarding')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#4c8fd8] px-5 py-3 font-semibold text-white shadow-lg shadow-[#4c8fd8]/20 transition hover:bg-[#3378bc]"
                    >
                      Verify in portal
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {screen.kind === 'signed' && (
                    <button
                      type="button"
                      onClick={() => router.push('/onboarding')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#4c8fd8] px-5 py-3 font-semibold text-white shadow-lg shadow-[#4c8fd8]/20 transition hover:bg-[#3378bc]"
                    >
                      Continue to onboarding
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {activeSession?.fallbackUrl && (
                    <a
                      href={activeSession.fallbackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-[#4c8fd8] hover:text-[#2f6ea8]"
                    >
                      Open fallback signing link
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[420px] bg-[#102948] p-8 lg:p-10 flex flex-col border-l border-white/10 justify-between overflow-y-auto">
          <div>
            <AdvantisLogo tone="light" compact className="mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Travel Assignment Confirmation</h2>
            <p className="text-sm text-slate-400 mb-8">
              We&apos;ll keep this signing experience inside the Advantis portal while tracking the real document status from the provider.
            </p>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  screen.kind === 'signed'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : screen.kind === 'declined'
                      ? 'bg-rose-500/15 text-rose-300'
                      : screen.kind === 'ready'
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : screen.kind === 'auth-required'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-white/10 text-slate-200'
                }`}>
                  {statusLabel}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Included documents</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {documentLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-100"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {activeSession?.lastSyncedAt && (
                <p className="mt-5 text-xs text-slate-400">
                  Last synced: {new Date(activeSession.lastSyncedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">What to expect</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                <li className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[#72c9ef]" />
                  Sign within the portal instead of jumping out to a separate email flow.
                </li>
                <li className="flex gap-3">
                  <FileSignature className="mt-0.5 h-4 w-4 flex-none text-[#72c9ef]" />
                  The provider handles initials, dates, and audit trail on the real document.
                </li>
                <li className="flex gap-3">
                  <RefreshCw className="mt-0.5 h-4 w-4 flex-none text-[#72c9ef]" />
                  If your status does not update right away, use refresh and we&apos;ll resync it from SignRequest.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            {screen.kind === 'ready' && (
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                Complete the document in the embedded signer above. When you finish, refresh the status if you are not redirected automatically.
              </div>
            )}

            {screen.kind === 'declined' && (
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-slate-100 transition hover:bg-white/10"
              >
                Return to portal
                <ArrowRight className="h-5 w-5" />
              </button>
            )}

            {screen.kind === 'signed' && (
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4c8fd8] py-4 font-bold text-white shadow-lg shadow-[#4c8fd8]/20 transition hover:bg-[#3378bc]"
              >
                Go to onboarding
                <ArrowRight className="h-5 w-5" />
              </button>
            )}

            {screen.kind === 'error' && activeSession?.fallbackUrl && (
              <a
                href={activeSession.fallbackUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-4 font-bold text-slate-100 transition hover:bg-white/10"
              >
                Use fallback signing link
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
