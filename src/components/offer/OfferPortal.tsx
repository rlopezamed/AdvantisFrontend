'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, Search, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { AdvantisLogo } from '@/components/brand/AdvantisLogo';
import { SignaturePad } from './SignaturePad';
import { MobilePdfViewer } from './MobilePdfViewer';
import { useRouter } from 'next/navigation';
import { PDFDocument } from 'pdf-lib';

type ScreenState = 'lookup' | 'review' | 'accepted' | 'rejected';
const OFFER_PDF_URL = '/api/demo-offer-pdf';

export function OfferPortal() {
  const router = useRouter();
  const [screen, setScreen] = useState<ScreenState>('lookup');
  const [lookupValue, setLookupValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [signatureData, setSignatureData] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupValue) return;
    setIsSearching(true);
    // Simulate API search
    setTimeout(() => {
      setIsSearching(false);
      setScreen('review');
    }, 1200);
  };

  const handleAccept = async () => {
    if (!signatureData) return;
    setIsProcessing(true);
    
    try {
      // 1. Fetch original PDF
      const existingPdfBytes = await fetch(OFFER_PDF_URL).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // 2. Embed signature PNG
      // SignaturePad inherently uses PNG format from canvas.toDataURL()
      const pngImageBytes = await fetch(signatureData).then(res => res.arrayBuffer());
      const pngImage = await pdfDoc.embedPng(pngImageBytes);
      
      // 3. Draw on last page
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      
      const sigWidth = 250;
      const sigHeight = 80;
      lastPage.drawImage(pngImage, {
        x: 60,
        y: 80, // Near the bottom left
        width: sigWidth,
        height: sigHeight,
      });
      
      // 4. Serialize the PDF
      const pdfBytes = await pdfDoc.save();
      
      // 5. Trigger Download for the Nurse to have a copy
      const pdfArray = new Uint8Array(pdfBytes);
      const blob = new Blob([pdfArray], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Sanitize username out of lookup for filename
      const safeName = lookupValue ? lookupValue.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_') : 'User';
      link.download = `Signed_TAC_Confirmation_${safeName}.pdf`;
      
      // Force download trigger safely
      if (typeof window !== "undefined") {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      setScreen('accepted');
    } catch (err) {
      console.error("Error signing PDF:", err);
      alert("There was an error generating your signed contract. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#102948] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#72c9ef]/18 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-14%] right-[-6%] w-[34%] h-[34%] rounded-full bg-[#4c8fd8]/20 blur-[120px] pointer-events-none"></div>
      
      <AnimatePresence mode="wait">
        
        {/* LOOKUP SCREEN */}
        {screen === 'lookup' && (
          <motion.div 
            key="lookup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <AdvantisLogo tone="light" subtitle="Traveler assignment confirmation" />
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/10">
                <FileSignature className="w-8 h-8 text-[#72c9ef]" />
              </div>
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Access Your Offer</h1>
              <p className="text-slate-300">Enter your email or phone number to securely review your Traveler Assignment Confirmation.</p>
            </div>

            <form onSubmit={handleLookup} className="bg-slate-900/68 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-300 ml-1">Email or Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500" />
                  </div>
                  <input 
                    type="text" 
                    value={lookupValue}
                    onChange={(e) => setLookupValue(e.target.value)}
                    placeholder="name@example.com or (214) 555-1234"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#4c8fd8] transition-colors"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isSearching}
                className="w-full mt-8 bg-[#4c8fd8] hover:bg-[#3378bc] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#4c8fd8]/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSearching ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Locating...</>
                ) : 'Find My Offer'}
              </button>
            </form>
          </motion.div>
        )}

        {/* REVIEW OFFER SCREEN */}
        {screen === 'review' && (
          <motion.div 
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-[95vw] max-w-7xl h-[90vh] bg-slate-100 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row"
          >
            {/* Left side: The PDF Document Viewer */}
            <div className="flex-1 p-4 lg:p-8 bg-slate-50 border-r border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="mb-5 px-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Review Official Contract</h2>
                <p className="text-slate-500 font-medium text-sm">Please review the official PDF document provided by HR.</p>
              </div>
              
              <div className="flex-1 w-full relative rounded-xl overflow-hidden shadow-sm border border-slate-300 bg-slate-200">
                 <MobilePdfViewer fileUrl={OFFER_PDF_URL} />
              </div>
            </div>

            {/* Right side: Action Panel (Dark Mode) */}
            <div className="w-full lg:w-[420px] bg-[#102948] p-8 lg:p-10 flex flex-col border-l border-white/10 justify-between overflow-y-auto">
              <div>
                <AdvantisLogo tone="light" compact className="mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Provide Electronic Signature</h3>
                <p className="text-sm text-slate-400 mb-8">By signing below, you legally accept the terms of this assignment confirmation.</p>
                
                <SignaturePad onSign={(data) => setSignatureData(data)} />
              </div>

              <div className="mt-12 space-y-4">
                  <button 
                  onClick={handleAccept}
                  disabled={!signatureData || isProcessing}
                  className="w-full bg-[#4c8fd8] hover:bg-[#3378bc] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#4c8fd8]/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#4c8fd8]"
                >
                  {isProcessing ? (
                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving Contract...</>
                  ) : (
                    <><CheckCircle className="w-5 h-5" /> Accept & Sign Offer</>
                  )}
                </button>
                <button 
                  onClick={() => setScreen('rejected')}
                  className="w-full bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 border border-slate-700 hover:border-rose-500/30"
                >
                  <XCircle className="w-5 h-5" /> Decline Offer
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ACCEPTED SUCCESS SCREEN */}
        {screen === 'accepted' && (
          <motion.div 
            key="accepted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-lg"
          >
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
              <CheckCircle className="w-12 h-12 text-emerald-400 relative z-10" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4">You&apos;re Hired!</h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-10">
              Congratulations Sarah! Your offer for Mercy General has been securely signed and countersigned. We are thrilled to officially begin your onboarding.
            </p>
            
            <button 
              onClick={() => router.push('/onboarding')}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl overflow-hidden transition-transform hover:scale-105"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-100 to-cyan-100 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              <span className="relative z-10 text-lg">Proceed to Onboarding Portal</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* REJECTED SCREEN */}
        {screen === 'rejected' && (
          <motion.div 
            key="rejected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md bg-slate-900/80 p-10 rounded-3xl border border-slate-800 backdrop-blur-xl"
          >
             <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Offer Declined</h2>
            <p className="text-slate-400">
              We&apos;ve notified your recruiter that you have chosen to decline this assignment at Mercy General. If this was a mistake, please reach out to them immediately.
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
