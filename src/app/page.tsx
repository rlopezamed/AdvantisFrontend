import Link from 'next/link';
import { ArrowRight, ClipboardCheck } from 'lucide-react';
import { AdvantisLogo } from '@/components/brand/AdvantisLogo';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eff8fe] px-4 py-10">
      <div className="absolute left-[-10%] top-[-8%] h-[20rem] w-[20rem] rounded-full bg-[#74cef3]/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-14%] right-[-8%] h-[24rem] w-[24rem] rounded-full bg-[#4c8fd8]/20 blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 rounded-[2rem] border border-white/80 bg-white/80 p-8 shadow-[0_40px_120px_-60px_rgba(45,98,152,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div>
            <AdvantisLogo subtitle="Clinician experience" />
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#b9e2f7] bg-[#eef8fe] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#3378bc]">
              <ClipboardCheck className="h-4 w-4" />
              Secure portal
            </div>

            <h1 className="mt-6 max-w-xl text-4xl font-extrabold tracking-tight text-[#173f6c] sm:text-5xl">
              Offer review, onboarding, and credentialing in one Advantis workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4c647e]">
              Move from assignment confirmation to completed onboarding with a portal that matches the Advantis Medical brand and keeps every next step in one place.
            </p>
          </div>

          <div className="grid gap-4 self-center">
            <Link
              href="/offer"
              className="group rounded-[1.6rem] border border-[#c7e6f7] bg-[linear-gradient(135deg,#4c8fd8,#72c9ef)] px-6 py-6 text-white shadow-[0_24px_50px_-28px_rgba(76,143,216,0.8)] transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Step 1</p>
                  <h2 className="mt-3 text-2xl font-bold">Traveler Assignment Confirmation</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/88">
                    Review your assignment details, sign electronically, and move straight into the next phase.
                  </p>
                </div>
                <ArrowRight className="mt-1 h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/onboarding"
              className="group rounded-[1.6rem] border border-[#d7eaf7] bg-[#f8fcff] px-6 py-6 text-[#173f6c] shadow-[0_18px_40px_-32px_rgba(45,98,152,0.55)] transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#5a94c8]">Step 2</p>
                  <h2 className="mt-3 text-2xl font-bold">Clinician Onboarding Portal</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#4c647e]">
                    Verify identity, complete onboarding tasks, and manage credentialing with AI-assisted guidance.
                  </p>
                </div>
                <ArrowRight className="mt-1 h-6 w-6 shrink-0 text-[#4c8fd8] transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
