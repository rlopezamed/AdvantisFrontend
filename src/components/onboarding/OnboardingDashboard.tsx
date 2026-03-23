'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockApplication } from '@/data/mockCredentialingApp';
import { DashboardTaskGroup } from './DashboardTaskGroup';
import { CredentialingChat } from './CredentialingChat';
import { MessageCircle, X, Sun, Moon } from 'lucide-react';

export function OnboardingDashboard() {
  const data = mockApplication;
  
  // Theme Toggle State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Mobile Drawer State
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Initialize theme based on document class
  useEffect(() => {
    // Basic check for existing dark class or OS preference
    const isDark = document.documentElement.classList.contains('dark') || 
                   (!document.documentElement.className && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
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

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 pb-32 max-w-7xl mx-auto relative">
        
        {/* Left Column: Task Execution Plan */}
        <div className="col-span-1 lg:col-span-2 space-y-4 md:space-y-6 flex flex-col">
          
          {/* Progress Strip header with dynamic Theme Toggle */}
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

          {/* Dynamic Groups Driven by Backend Data */}
          <div className="space-y-3 md:space-y-4 relative z-0">
            {data.taskGroups.map((group, idx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <DashboardTaskGroup group={group} defaultOpen={idx === 0 || idx === 1} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Inline Assistant (Hidden on Mobile) */}
        <div className="hidden lg:block col-span-1">
          <CredentialingChat specialist={data.specialist} />
        </div>
      </div>

      {/* Mobile Floating Action Button */}
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

      {/* Mobile Slide-out Drawer */}
      <AnimatePresence>
        {isMobileChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileChatOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[90vw] max-w-[400px] bg-slate-50 dark:bg-slate-950 shadow-2xl z-50 overflow-y-auto border-l border-slate-200 dark:border-slate-800 flex flex-col"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md px-4 py-4 md:py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 dark:text-white text-lg">Support & Chat</h2>
                <button 
                  onClick={() => setIsMobileChatOpen(false)}
                  className="p-2 -mr-2 rounded-xl text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Drawer Content */}
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
