'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSignature, ExternalLink, CheckCircle } from 'lucide-react';

export function ESignModule({ title, description }: { title: string; description: string; }) {
  const [isSigned, setIsSigned] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const handleSign = () => {
    setIsSigning(true);
    // Simulate Opening SignRequest logic
    setTimeout(() => {
      setIsSigned(true);
      setIsSigning(false);
    }, 2500);
  };

  return (
    <div className={`border rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500 ${
      isSigned ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isSigned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {isSigned ? <CheckCircle className="w-6 h-6" /> : <FileSignature className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
            
            {isSigned && (
              <div className="mt-2 text-xs font-medium text-emerald-500/80 flex items-center gap-1">
                Completed & Synced with Dynamics CRM
              </div>
            )}
          </div>
        </div>

        <div>
          {!isSigned && !isSigning && (
            <button 
              onClick={handleSign}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)]"
            >
              Start E-Sign
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {isSigning && (
            <button disabled className="w-full sm:w-auto px-6 py-3 bg-blue-600/50 text-white font-medium rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              Waiting for signature...
            </button>
          )}

          {isSigned && (
            <button disabled className="w-full sm:w-auto px-6 py-3 bg-emerald-600/20 text-emerald-400 font-medium rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
              Signed Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
