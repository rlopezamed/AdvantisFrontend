'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, FileText, Building, ArrowRight, ArrowLeft, UploadCloud, CreditCard, Users, Clock } from 'lucide-react';

const hrStepsConfig = [
  { id: 'i9', title: 'I-9 Documents', icon: <FileText className="w-5 h-5" /> },
  { id: 'ssn', title: 'Social Security', icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'adp_sync', title: 'Payroll & HR Info (ADP)', icon: <Building className="w-5 h-5" /> },
  { id: 'background', title: 'Background Check', icon: <Clock className="w-5 h-5" /> }
];

export function HROnboardingStep({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [confirmSkip, setConfirmSkip] = useState(false);

  const handleNext = () => {
    if (currentSubStep < hrStepsConfig.length - 1) {
      setCurrentSubStep(prev => prev + 1);
    } else {
      onNext();
    }
    setConfirmSkip(false);
  };

  const handleContinueClick = () => {
    // Show a confirmation before advancing without uploading
    setConfirmSkip(true);
  };

  const handleConfirmSkip = () => {
    handleNext();
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-6 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-6 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${(currentSubStep / (hrStepsConfig.length - 1)) * 100}%` }}
        ></div>
        
        {hrStepsConfig.map((step, idx) => {
          const isActive = idx === currentSubStep;
          const isPast = idx < currentSubStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-950 flex items-center justify-center transition-colors duration-500 ${
                isActive ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' :
                isPast ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
              }`}>
                {isPast ? <Check className="w-6 h-6" /> : step.icon}
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 
                isPast ? 'text-slate-700 dark:text-slate-300' : 
                'text-slate-400 dark:text-slate-600'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 min-h-[500px] relative overflow-hidden shadow-xl dark:shadow-2xl flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: I-9 */}
            {currentSubStep === 0 && (
              <motion.div key="step-i9" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Form I-9 Documents</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">Please upload the documents necessary to satisfy the Form I-9 requirement. This will need to be completed within 24 hours.</p>
                  </div>
                  <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-rose-200 dark:border-rose-500/30">Due in 24h</span>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-300">
                  <p>You are required to upload <strong>EITHER</strong> one document from <strong>LIST A</strong> (e.g., Passport), <strong>OR</strong> one document from <strong>LIST B</strong> (e.g., Driver's License) <strong>AND</strong> one document from <strong>LIST C</strong> (e.g., Social Security card/Birth Certificate).</p>
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group mt-6">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                  </div>
                  <p className="text-slate-800 dark:text-white font-medium mb-1">Drag and drop your I-9 documents here</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">PDF, JPG, or PNG (Max 10MB)</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SSN */}
            {currentSubStep === 1 && (
              <motion.div key="step-ssn" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Records</h2>
                <p className="text-slate-500 dark:text-slate-400">For employee records, please provide your Social Security number. You can upload your SS Card here, or if you do not have it to upload, provide it securely below.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Social Security Number</label>
                    <input type="password" placeholder="XXX-XX-XXXX" className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                    <p className="text-xs text-slate-400 dark:text-slate-500">Your data is encrypted strictly for our secure credentialing backend.</p>
                  </div>
                  
                  <div className="border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                    <CreditCard className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mb-3" />
                    <p className="text-sm font-medium text-slate-800 dark:text-white">Upload SSN Card (Optional)</p>
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex gap-3 mt-6">
                  <ShieldCheck className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                  <p className="text-sm text-indigo-700 dark:text-indigo-200">Alternatively, you may call me at <strong>800-555-1234</strong> and provide it verbally if you are not comfortable submitting it online.</p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ADP */}
            {currentSubStep === 2 && (
              <motion.div key="step-adp" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-white dark:bg-white rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-red-600 font-extrabold text-xl tracking-tighter">ADP</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Streamlined ADP Onboarding</h2>
                  </div>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  We've integrated complete ADP employee onboarding directly into this portal! Please fill out the sections below and our backend agent will instantly create your ADP account and sync your details.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Users className="w-5 h-5" /></div>
                    <div>
                      <p className="text-slate-800 dark:text-white font-medium">Personal Information</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Address, Emergency Contact</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400"><CreditCard className="w-5 h-5" /></div>
                    <div>
                      <p className="text-slate-800 dark:text-white font-medium">Financial Setup</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Tax Withholding, Direct Deposit</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Background Check */}
            {currentSubStep === 3 && (
              <motion.div key="step-bg" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="space-y-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Start your Background Check</h2>
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
                    You will receive an email today from <strong>First Advantage / Sterling</strong>. Follow the link in the email you receive and complete the online form to start your background check.
                  </p>
                  
                  <div className="mt-6 flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 relative z-10">
                    <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0 animate-pulse"></div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">Important Note</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Please check your Junk/Spam folder as sometimes these vendor emails get caught in filters. Complete their secure form immediately so your agent can sync the results.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirmation Banner */}
        <AnimatePresence>
          {confirmSkip && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <p className="text-sm text-amber-700 dark:text-amber-300 flex-1 font-medium">
                ⚠️ This step hasn't been completed. Are you sure you want to skip it?
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setConfirmSkip(false)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Go back
                </button>
                <button
                  onClick={handleConfirmSkip}
                  className="px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white transition-colors"
                >
                  Yes, skip
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls - single row */}
        <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-200 dark:border-slate-800/80">
          <button 
            onClick={() => { setConfirmSkip(false); currentSubStep === 0 ? onBack() : setCurrentSubStep(prev => prev - 1); }}
            className="flex items-center gap-2 px-5 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all font-medium whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button 
            onClick={handleContinueClick}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 whitespace-nowrap"
          >
            {currentSubStep === hrStepsConfig.length - 1 ? 'Go to Credentialing' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
