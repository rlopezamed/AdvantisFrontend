import Link from 'next/link';
import { ArrowRight, ClipboardCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
      
      <div className="text-center relative z-10 max-w-lg">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl mx-auto mb-8 flex items-center justify-center border border-indigo-500/30">
          <ClipboardCheck className="w-10 h-10 text-indigo-400" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Advantis Medical</h1>
        <p className="text-slate-400 mb-10 text-lg">
          Welcome to the new isolated environment for the Clinician Onboarding Portal.
        </p>

        <div className="space-y-4">
          <Link 
            href="/offer" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 group"
          >
            Launch Offer Acceptance Portal
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/onboarding" 
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 border border-slate-700 group"
          >
            Enter Onboarding Directly
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-400" />
          </Link>
        </div>
      </div>
    </main>
  );
}
