'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle, FileText, X } from 'lucide-react';

export function DocumentUpload({ 
  title, 
  description, 
  onUpload 
}: { 
  title: string; 
  description: string; 
  onUpload?: (file: File) => void; 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'verifying' | 'verified'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (f: File) => {
    setFile(f);
    setUploadStatus('uploading');
    
    // Simulate upload
    setTimeout(() => {
      setUploadStatus('success');
      
      // Simulate Orchestrator AI Verification
      setTimeout(() => {
        setUploadStatus('verifying');
        
        // Simulate completion of verification
        setTimeout(() => {
          setUploadStatus('verified');
          if (onUpload) onUpload(f);
        }, 2000);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
      {/* Decorative gradient blur */}
      <div className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] rounded-full bg-indigo-600/10 blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400 mt-2">{description}</p>
        
        {uploadStatus === 'idle' && (
          <div 
            className={`mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-slate-300 font-medium font-sans">Click to upload or drag and drop</p>
            <p className="text-slate-500 text-xs mt-2">PDF, JPG, or PNG (max. 10MB)</p>
          </div>
        )}

        {/* Uploading / Verifying States */}
        {uploadStatus !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mt-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-slate-200 font-medium truncate max-w-[200px] sm:max-w-xs">{file?.name}</p>
                  <p className="text-slate-500 text-xs">{(file?.size || 0) / 1024 < 1024 ? Math.round((file?.size || 0) / 1024) + ' KB' : (Math.round(((file?.size || 0) / 1024 / 1024) * 10) / 10) + ' MB'}</p>
                </div>
              </div>

              {uploadStatus === 'uploading' && (
                <div className="text-indigo-400 animate-pulse text-sm font-medium">Uploading...</div>
              )}
              {uploadStatus === 'success' && (
                <div className="text-blue-400 text-sm font-medium flex items-center gap-2">
                  Uploaded
                </div>
              )}
              {uploadStatus === 'verifying' && (
                <div className="text-amber-400 text-sm font-medium flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></span>
                  AI PSV Verification...
                </div>
              )}
              {uploadStatus === 'verified' && (
                <div className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Verified
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full mt-4 overflow-hidden relative">
              <motion.div 
                className={`absolute top-0 left-0 h-full ${
                  uploadStatus === 'verified' ? 'bg-emerald-500' : 
                  uploadStatus === 'verifying' ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                initial={{ width: 0 }}
                animate={{ 
                  width: uploadStatus === 'uploading' ? '50%' : 
                         uploadStatus === 'success' ? '70%' :
                         uploadStatus === 'verifying' ? '90%' : '100%' 
                }}
                transition={{ duration: uploadStatus === 'uploading' ? 1.5 : 0.5 }}
              />
            </div>

            {uploadStatus === 'verified' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-slate-700/50"
              >
                <div className="flex gap-2">
                  <button onClick={() => {setUploadStatus('idle'); setFile(null);}} className="text-xs text-slate-400 hover:text-slate-300 transition-colors">
                    Remove & Re-upload
                  </button>
                  <span className="text-slate-700">•</span>
                  <span className="text-xs text-emerald-500/80">Synced with ATS successfully.</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
