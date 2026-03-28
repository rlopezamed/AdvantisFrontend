'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Specialist } from '@/data/mockCredentialingApp';
import { Mail, Phone, ExternalLink, Loader2, Send, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  time: string;
}

interface Props {
  specialist: Specialist | null;
}

function timeNow(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function CredentialingChat({ specialist }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: "Welcome to your credentialing portal! I'm your digital assistant, here to help guide you through these requirements. If you have any questions, just ask!",
      time: 'Now',
    },
    {
      id: 'welcome-2',
      role: 'assistant',
      text: "You can send a message here or use the 'Message' button above to reach your credentialing specialist directly.",
      time: '',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', text, time: timeNow() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/assistant/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to get response' }));
        throw new Error(data.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.answer,
        time: timeNow(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleEscalate() {
    setSending(true);
    try {
      await fetch(`${API_BASE}/assistant/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Clinician requested to speak with specialist via chat widget.' }),
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `escalate-${Date.now()}`,
          role: 'assistant',
          text: `I've notified ${specialist?.name || 'your specialist'} that you'd like to speak with them. They'll reach out to you shortly.`,
          time: timeNow(),
        },
      ]);
    } catch {
      setError('Could not escalate. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 h-full lg:sticky lg:top-8">

      {/* Specialist Card */}
      <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg md:shadow-2xl">
        <h3 className="text-[10px] md:text-xs font-bold text-slate-500 tracking-widest uppercase mb-3 md:mb-4">Your Credentialing Specialist</h3>
        {specialist ? (
          <>
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
              <button
                onClick={handleEscalate}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-medium transition-colors shadow-md shadow-indigo-500/20"
              >
                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4" /> Message {specialist.name.split(' ')[0]}
              </button>
              {specialist.phone && (
                <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-500">
                  <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" /> {specialist.phone}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Not yet assigned</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">A specialist will be assigned to your application shortly.</p>
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="flex flex-col p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-lg md:shadow-2xl h-[400px] md:h-[450px]">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative shrink-0 mt-0.5">
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full animate-ping absolute"></div>
            <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full relative"></div>
          </div>
          <h3 className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 tracking-widest uppercase">Onboarding Assistant</h3>
          <span className="ml-auto text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
            Active <ExternalLink className="w-3 h-3" />
          </span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-3 md:space-y-4 pr-1 md:pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.time && (
                <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-bold mx-1">{msg.time}</span>
              )}
              <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl max-w-[90%] ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/50 rounded-tl-sm'
              }`}>
                <p className={`text-xs md:text-sm leading-relaxed font-medium whitespace-pre-wrap ${
                  msg.role === 'user' ? '' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-2">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700/50">
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={sending}
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-lg md:rounded-xl py-2.5 md:py-3 pl-3 md:pl-4 pr-10 md:pr-12 text-xs md:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 rounded-md md:rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
          <button
            onClick={handleEscalate}
            disabled={sending}
            className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium transition-colors"
          >
            Need human help? Message specialist
          </button>
        </div>
      </div>

    </div>
  );
}
