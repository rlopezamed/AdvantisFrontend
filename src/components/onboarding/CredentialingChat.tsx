import React from 'react';
import { Specialist } from '@/data/mockCredentialingApp';
import { Mail, Phone, ExternalLink, Loader2 } from 'lucide-react';

interface Props {
  specialist: Specialist;
}

export function CredentialingChat({ specialist }: Props) {
  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full lg:sticky lg:top-8">
      
      {/* Specialist Card */}
      <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg md:shadow-2xl">
        <h3 className="text-[10px] md:text-xs font-bold text-slate-500 tracking-widest uppercase mb-3 md:mb-4">Your Credentialing Specialist</h3>
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
          <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md text-white font-bold tracking-wider text-sm md:text-base">
            {specialist.imageUrl}
          </div>
          <div className="min-w-0">
            <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-200 truncate">{specialist.name}</h4>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium truncate">{specialist.role}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 md:gap-3">
          <button className="w-full flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs md:text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" /> Message {specialist.name.split(' ')[0]}
          </button>
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-500">
            <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" /> {specialist.phone}
          </div>
        </div>
      </div>

      {/* Automated Onboarding Assistant Chat */}
      <div className="flex-1 flex flex-col p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-lg md:shadow-2xl min-h-[350px] md:min-h-[400px]">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative shrink-0 mt-0.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full animate-ping absolute"></div>
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full relative"></div>
          </div>
          <h3 className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase">Onboarding Assistant</h3>
          <span className="ml-auto text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
            Idle <ExternalLink className="w-3 h-3" />
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-1 md:pr-2 custom-scrollbar">
          
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold ml-1">11:54 AM</span>
            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl rounded-tl-sm md:rounded-tl-sm bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/50">
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Welcome to your credentialing portal! I'm your digital assistant, here to help guide you through these requirements. If you have any questions, just ask!
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-start">
            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl rounded-tl-sm md:rounded-tl-sm bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/50">
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Great job uploading your TB test yesterday! Our credentialing specialist will review it shortly. Once verified, it will automatically move from 'Reviewing' to 'Completed'.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-start">
            <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold ml-1">12:05 PM</span>
            <div className="p-3 md:p-4 rounded-xl md:rounded-2xl rounded-tl-sm md:rounded-tl-sm bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/50">
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Just a heads up, the internal team marked your Badge Photo as rejected due to poor lighting. You can review the note on the left and re-upload when you get a chance.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-800 relative">
          <input 
            type="text" 
            placeholder="Ask a question..." 
            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-lg md:rounded-xl py-2.5 md:py-3 pl-3 md:pl-4 pr-10 md:pr-12 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors placeholder:text-slate-400"
          />
          <button className="absolute right-1.5 md:right-2 top-[1.35rem] md:top-[1.6rem] p-1.5 md:p-1.5 rounded-md md:rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-sm">
            <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
