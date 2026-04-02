'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdvantisLogo } from '@/components/brand/AdvantisLogo';
import { getMyOfferSigningSession, PortalApiError, type OfferSigningSession } from '@/lib/portal-api';

type CompletionScreen =
  | { kind: 'loading' }
  | { kind: 'auth-required'; message: string }
  | { kind: 'signed'; session: OfferSigningSession }
  | { kind: 'ready'; session: OfferSigningSession }
  | { kind: 'preparing'; session?: OfferSigningSession | null; message: string }
  | { kind: 'declined'; session: OfferSigningSession }
  | { kind: 'error'; session?: OfferSigningSession | null; message: string };

function formatDocumentLabel(value: string): string {
  return value
    .split(/[_-]/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function OfferSigningComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [screen, setScreen] = useState<CompletionScreen>({ kind: 'loading' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const signrequestUuid = searchParams.get('signrequest_uuid');
  const offerUuid = searchParams.get('offer_uuid');

  const offerLink = useMemo(() => {
    if (offerUuid) return `/offer?offer_uuid=${encodeURIComponent(offerUuid)}`;
    if (signrequestUuid) return `/offer?signrequest_uuid=${encodeURIComponent(signrequestUuid)}`;
    return '/offer';
  }, [offerUuid, signrequestUuid]);

  const completionLink = useMemo(() => {
    if (offerUuid) return `/offer/signing/complete?offer_uuid=${encodeURIComponent(offerUuid)}`;
    if (signrequestUuid) return `/offer/signing/complete?signrequest_uuid=${encodeURIComponent(signrequestUuid)}`;
    return '/offer/signing/complete';
  }, [offerUuid, signrequestUuid]);

  const loadSession = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    else setScreen({ kind: 'loading' });

    try {
      const session = await getMyOfferSigningSession({
        offerUuid: offerUuid || undefined,
        signrequestUuid: signrequestUuid || undefined,
      });

      if (session.status === 'signed') {
        setScreen({ kind: 'signed', session });
      } else if (session.status === 'declined') {
        setScreen({ kind: 'declined', session });
      } else if (session.status === 'ready') {
        setScreen({ kind: 'ready', session });
      } else if (session.status === 'preparing') {
        setScreen({
          kind: 'preparing',
          session,
          message: 'We are syncing your completed document. This usually resolves in a few seconds.',
        });
      } else {
        setScreen({
          kind: 'error',
          session,
          message: 'We could not confirm your signing completion yet. Please refresh once to resync from SignRequest.',
        });
      }
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (error.status === 401) {
          setScreen({
            kind: 'auth-required',
            message: 'Please verify your identity in the portal before continuing to HR onboarding.',
          });
        } else if (error.status === 404) {
          setScreen({
            kind: 'preparing',
            message: 'We do not have a synced signing session yet. Please refresh once and we will check again.',
          });
        } else {
          setScreen({ kind: 'error', message: error.message });
        }
      } else {
        setScreen({
          kind: 'error',
          message: 'We could not load your signing completion status right now. Please try again in a moment.',
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [offerUuid, signrequestUuid]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const activeSession =
    screen.kind === 'signed' ||
    screen.kind === 'ready' ||
    screen.kind === 'declined' ||
    screen.kind === 'preparing' ||
    screen.kind === 'error'
      ? screen.session
      : null;

  const documentLabels = activeSession?.documents?.length
    ? activeSession.documents.map(formatDocumentLabel)
    : ['Travel Assignment Confirmation'];

  const statusLabel =
    screen.kind === 'signed'
      ? 'Completed'
      : screen.kind === 'ready'
        ? 'Still open'
        : screen.kind === 'declined'
          ? 'Declined'
          : screen.kind === 'auth-required'
            ? 'Verification required'
            : screen.kind === 'loading'
              ? 'Loading'
              : 'Syncing';

  return (
    <div className="min-h-screen bg-[#102948] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#72c9ef]/18 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-14%] right-[-6%] w-[34%] h-[34%] rounded-full bg-[#4c8fd8]/20 blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[95vw] max-w-6xl min-h-[80vh] bg-slate-100 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
      >
        <div className="flex-1 p-6 lg:p-10 bg-slate-50 border-r border-slate-200 flex flex-col justify-center">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#4c8fd8]">Offer Complete</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Travel Assignment Confirmation</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                We&apos;ll confirm your signature status here and hand you off to the remaining HR steps.
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

          <div className="rounded-[2rem] border border-slate-200 bg-white px-8 py-12 shadow-sm text-center">
            {screen.kind === 'loading' && (
              <div className="flex flex-col items-center gap-4 text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-[#4c8fd8]" />
                <p className="text-base font-medium">Checking your signing completion...</p>
              </div>
            )}

            {screen.kind !== 'loading' && (
              <>
                <div className={`mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-3xl ${
                  screen.kind === 'signed'
                    ? 'bg-emerald-100 text-emerald-600'
                    : screen.kind === 'declined'
                      ? 'bg-rose-100 text-rose-600'
                      : screen.kind === 'auth-required'
                        ? 'bg-amber-100 text-amber-600'
                        : screen.kind === 'ready'
                          ? 'bg-cyan-100 text-cyan-600'
                          : 'bg-[#eaf6fd] text-[#2f6ea8]'
                }`}>
                  {screen.kind === 'signed' ? (
                    <CheckCircle className="h-9 w-9" />
                  ) : screen.kind === 'declined' || screen.kind === 'error' ? (
                    <TriangleAlert className="h-9 w-9" />
                  ) : screen.kind === 'auth-required' ? (
                    <ShieldCheck className="h-9 w-9" />
                  ) : (
                    <RefreshCw className={`h-9 w-9 ${screen.kind === 'preparing' ? 'animate-spin' : ''}`} />
                  )}
                </div>

                <h2 className="text-3xl font-bold text-slate-900">
                  {screen.kind === 'signed'
                    ? 'You\'re All Set'
                    : screen.kind === 'ready'
                      ? 'Signature Still In Progress'
                      : screen.kind === 'declined'
                        ? 'Signature Declined'
                        : screen.kind === 'auth-required'
                          ? 'Portal Verification Required'
                          : screen.kind === 'error'
                            ? 'We Need Your Attention'
                            : 'Finalizing Your Signature'}
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  {screen.kind === 'signed'
                    ? 'Your Travel Assignment Confirmation has been signed successfully. You can continue directly into the HR onboarding steps now.'
                    : screen.kind === 'ready'
                      ? 'It looks like the document is still open for signing. If you just finished, refresh once. Otherwise, return to the contract to complete the final signature steps.'
                      : screen.kind === 'declined'
                        ? 'This assignment confirmation was marked as declined. If that was not intentional, please contact your recruiter or HR specialist.'
                        : screen.kind === 'auth-required'
                          ? screen.message
                          : screen.message}
                </p>

                {activeSession?.signedAt && (
                  <p className="mt-4 text-sm font-medium text-emerald-700">
                    Signed at {new Date(activeSession.signedAt).toLocaleString()}
                  </p>
                )}

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  {screen.kind === 'signed' && (
                    <button
                      type="button"
                      onClick={() => router.push('/onboarding')}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#4c8fd8] px-6 py-3 font-semibold text-white shadow-lg shadow-[#4c8fd8]/20 transition hover:bg-[#3378bc]"
                    >
                      Continue to HR Steps
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  {(screen.kind === 'ready' || screen.kind === 'preparing' || screen.kind === 'error') && (
                    <button
                      type="button"
                      onClick={() => void loadSession(true)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#4c8fd8] px-6 py-3 font-semibold text-white shadow-lg shadow-[#4c8fd8]/20 transition hover:bg-[#3378bc]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh status
                    </button>
                  )}

                  {(screen.kind === 'ready' || screen.kind === 'declined' || screen.kind === 'error') && (
                    <button
                      type="button"
                      onClick={() => router.push(offerLink)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-[#4c8fd8] hover:text-[#2f6ea8]"
                    >
                      Return to contract
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}

                  {screen.kind === 'auth-required' && (
                    <button
                      type="button"
                      onClick={() => router.push(`/onboarding?return_to=${encodeURIComponent(completionLink)}`)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#4c8fd8] px-6 py-3 font-semibold text-white shadow-lg shadow-[#4c8fd8]/20 transition hover:bg-[#3378bc]"
                    >
                      Verify in portal
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[390px] bg-[#102948] p-8 lg:p-10 flex flex-col justify-between border-l border-white/10">
          <div>
            <AdvantisLogo tone="light" compact className="mb-6" />
            <h2 className="text-xl font-bold text-white">Next stop: HR onboarding</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Once your signature is confirmed, we&apos;ll send you straight into the remaining onboarding steps so you can keep momentum.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  screen.kind === 'signed'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : screen.kind === 'declined'
                      ? 'bg-rose-500/15 text-rose-300'
                      : screen.kind === 'auth-required'
                        ? 'bg-amber-500/15 text-amber-300'
                        : screen.kind === 'ready'
                          ? 'bg-cyan-500/15 text-cyan-300'
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
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">What happens next</p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
              <li>We confirm the provider marked this document as signed.</li>
              <li>Once confirmed, you can continue into the HR onboarding steps.</li>
              <li>If the signed status does not appear right away, refresh once and we&apos;ll resync it.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
