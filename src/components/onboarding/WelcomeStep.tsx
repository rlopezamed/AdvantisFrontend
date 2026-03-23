'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ConfettiParticle = ({ delay, xOffset }: { delay: number; xOffset: number }) => {
  return (
    <motion.div
      initial={{ y: -50, x: xOffset, opacity: 0, scale: 0 }}
      animate={{ 
        y: ['0vh', '100vh'], 
        x: [xOffset, xOffset + (Math.random() * 100 - 50)],
        opacity: [0, 1, 1, 0],
        rotate: [0, 180, 360]
      }}
      transition={{ duration: 2.5 + Math.random() * 2, delay, ease: 'linear', repeat: 3 }}
      className="absolute top-0 w-3 h-3 rounded-sm"
      style={{ backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)] }}
    />
  );
};

export function WelcomeStep({ onNext }: { onNext: () => void }) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] text-center relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
          {Array.from({ length: 60 }).map((_, i) => (
            <ConfettiParticle key={i} delay={Math.random() * 1.5} xOffset={(Math.random() * 800) - 400} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 max-w-2xl w-full flex flex-col bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/50 rounded-[2rem] shadow-2xl shadow-indigo-500/10 overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* Scrollable letter area */}
        <div className="overflow-y-auto flex-1 p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight text-center">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">Advantis!</span>
          </h1>
          
          <div className="text-left bg-slate-50 dark:bg-slate-800/30 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-inner relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed mb-4 font-medium">Dear Sarah,</p>
            
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              I'm <strong className="text-indigo-600 dark:text-indigo-300 font-semibold">Jessica</strong>, your dedicated Credentialing Specialist. We are absolutely thrilled to have you join the team for your upcoming assignment at <strong>Mercy General!</strong>
            </p>
            
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              My goal is to make your onboarding process completely frictionless. We have an AI-assisted portal that will guide you step-by-step through HR and payroll info, clinical documents, and background checks.
            </p>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              I'll be monitoring your progress and am always here if you need anything!
            </p>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Warmly,</p>
              <div 
                className="text-4xl text-indigo-500 dark:text-indigo-400 opacity-90 -rotate-3 inline-block font-serif tracking-tight ml-2 mt-2"
                style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Lucida Handwriting', cursive", textShadow: "0 2px 15px rgba(99,102,241,0.3)" }}
              >
                Jessica Reynolds
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-bold tracking-widest uppercase">Lead Credentialing Specialist</p>
            </div>
          </div>
        </div>

        {/* Pinned CTA — always visible */}
        <div className="shrink-0 px-8 md:px-12 py-5 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-center">
          <button 
            onClick={onNext}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30 w-full max-w-sm"
          >
            <span className="text-lg">Let's Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
