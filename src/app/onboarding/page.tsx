'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { HROnboardingStep } from '@/components/onboarding/HROnboardingStep';
import { OnboardingDashboard } from '@/components/onboarding/OnboardingDashboard'; // The complex Credentialing view

type StepState = 'welcome' | 'hr-docs' | 'credentialing';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<StepState>('welcome');

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
            {currentStep !== 'welcome' && (
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-200">Sarah Jenkins</p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium tracking-wide">RN Med/Surg - Mercy General</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg text-white font-bold tracking-wider">
                  SJ
                </div>
              </motion.div>
            )}
          </header>

          {/* Dynamic Content Views */}
          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="wait">
              {currentStep === 'welcome' && (
                <motion.div 
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1"
                >
                  <WelcomeStep onNext={() => setCurrentStep('hr-docs')} />
                </motion.div>
              )}

              {currentStep === 'hr-docs' && (
                <motion.div 
                  key="hr-docs"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1"
                >
                  <HROnboardingStep 
                    onBack={() => setCurrentStep('welcome')} 
                    onNext={() => setCurrentStep('credentialing')} 
                  />
                </motion.div>
              )}

              {currentStep === 'credentialing' && (
                <motion.div 
                  key="credentialing"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1"
                >
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
                  <OnboardingDashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </main>
  );
}
