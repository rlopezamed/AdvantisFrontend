'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';

export function SignaturePad({ onSign }: { onSign: (signature: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Setup canvas context
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#4f46e5'; // Indigo-600
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasSigned(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (hasSigned && canvasRef.current) {
      onSign(canvasRef.current.toDataURL());
    }
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
      onSign('');
    }
  };

  return (
    <div className="w-full">
      <div className="relative border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/50 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="w-full h-[200px] touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {/* Placeholder text if not signed */}
        {!hasSigned && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-slate-500 font-medium text-lg opacity-50 select-none">Sign Here</span>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2">
        <button 
          onClick={clearPad}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCcw className="w-4 h-4" /> Clear Signature
        </button>
      </div>
    </div>
  );
}
