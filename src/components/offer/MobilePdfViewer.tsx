'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';

// Setup pdf-worker using Next.js compatible dynamic URL resolution
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
}

// Minimal CSS for react-pdf to avoid unstyled text layers
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export function MobilePdfViewer({ fileUrl }: { fileUrl: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(400);

  // Responsive width detection
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 32); 
      }
    };
    window.addEventListener('resize', updateWidth);
    updateWidth();
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <div className="flex flex-col items-center w-full h-full bg-slate-100 rounded-2xl border border-slate-300 shadow-inner overflow-hidden" ref={containerRef}>
      
      {/* PDF Controls */}
      <div className="w-full bg-slate-900 px-4 py-3 flex items-center justify-between text-slate-300 shadow-md z-10">
        <div className="flex items-center gap-1">
          <button 
            type="button" 
            disabled={pageNumber <= 1} 
            onClick={previousPage}
            className="p-1 hover:bg-slate-800 rounded disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-medium w-20 text-center">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <button 
            type="button" 
            disabled={pageNumber >= numPages} 
            onClick={nextPage}
            className="p-1 hover:bg-slate-800 rounded disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
          <button type="button" onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1 hover:bg-slate-800 rounded"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => setScale(s => Math.min(2.5, s + 0.2))} className="p-1 hover:bg-slate-800 rounded"><ZoomIn className="w-4 h-4" /></button>
        </div>
      </div>

      {/* PDF Document Render */}
      <div className="overflow-auto w-full h-full flex-1 flex justify-center py-6 bg-slate-200 min-h-[400px] lg:min-h-[600px]">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center text-slate-500 mt-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading Contract PDF...</p>
            </div>
          }
          error={<div className="text-rose-500 p-4 shrink-0 text-center text-sm font-medium">Failed to load assignment contract.</div>}
        >
          {numPages > 0 && (
            <div className="shadow-2xl ring-1 ring-slate-900/5 bg-white">
              <Page 
                pageNumber={pageNumber} 
                width={containerWidth ? containerWidth * scale : undefined}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="max-w-full"
              />
            </div>
          )}
        </Document>
      </div>

    </div>
  );
}
