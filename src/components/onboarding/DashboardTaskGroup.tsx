import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Info, AlertCircle, CheckCircle2, Clock, PlayCircle, Loader2, MessageSquare } from 'lucide-react';
import { TaskGroup, Requirement } from '@/data/mockCredentialingApp';

interface Props {
  group: TaskGroup;
  defaultOpen?: boolean;
}

export function DashboardTaskGroup({ group, defaultOpen = true }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getStatusBadge = (status: Requirement['status']) => {
    switch (status) {
      case 'completed': return <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20 text-[10px] md:text-xs font-bold tracking-wide uppercase whitespace-nowrap">Completed</span>;
      case 'rejected': return <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-500 border border-rose-200 dark:border-rose-500/20 text-[10px] md:text-xs font-bold tracking-wide uppercase whitespace-nowrap">Failed</span>;
      case 'action_needed':
      case 'missing': return null;
      case 'pending': return <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20 text-[10px] md:text-xs font-bold tracking-wide uppercase whitespace-nowrap">Pending</span>;
      case 'reviewing': return <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[10px] md:text-xs font-bold tracking-wide uppercase whitespace-nowrap">Reviewing</span>;
    }
  };

  const getStatusIcon = (status: Requirement['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'action_needed':
      case 'missing': return <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] m-1" />;
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'reviewing': return <Loader2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400 animate-spin" />;
    }
  };

  const completedCount = group.requirements.filter(r => r.status === 'completed').length;
  const totalCount = group.requirements.length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm md:shadow-lg mb-4 md:mb-6">
      {/* Group Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 md:p-5 lg:p-6 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            {isOpen ? <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400" />}
          </div>
          <div className="text-left">
            <h3 className="text-sm md:text-lg lg:text-xl font-bold text-slate-900 dark:text-slate-200">{group.title}</h3>
            {group.description && <p className="hidden md:block text-xs text-slate-500 mt-1 max-w-lg">{group.description}</p>}
          </div>
        </div>
        <div className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider">
          {completedCount}/{totalCount}
        </div>
      </button>

      {/* Group Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200 dark:border-slate-800"
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {group.requirements.map(req => (
                <div key={req.id} className="p-3 md:p-5 lg:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group/row flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                  
                  {/* Left Side: Icon & Title */}
                  <div className="flex items-start sm:items-center gap-3 md:gap-4 flex-1">
                    <div className="w-6 md:w-8 flex justify-center shrink-0 mt-0.5 sm:mt-0">
                      {getStatusIcon(req.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <h4 className={`text-sm md:text-base font-semibold truncate ${req.status === 'completed' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-200'}`}>
                          {req.title}
                        </h4>
                        {req.isRequired && (
                          <span className="px-1.5 md:px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[9px] md:text-[10px] font-bold tracking-wider shrink-0">
                            REQ
                          </span>
                        )}
                      </div>
                      
                      {(req.description || req.rejectionReason) && (
                        <div className={`mt-1.5 md:mt-2 p-2 md:p-3 rounded-lg md:rounded-xl flex gap-2 md:gap-3 text-xs md:text-sm ${req.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300' : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hidden md:flex'}`}>
                          {req.status === 'rejected' ? <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5" /> : <Info className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5" />}
                          <p className="line-clamp-2 md:line-clamp-none">{req.status === 'rejected' ? req.rejectionReason : req.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Status Badges & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                    
                    {getStatusBadge(req.status)}

                    <div className="flex-1 flex justify-end">
                      {['missing', 'action_needed', 'rejected'].includes(req.status) && (
                        <button className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs md:text-sm transition-all shadow-md shadow-indigo-600/20 w-full sm:w-auto">
                          {req.type === 'upload' ? 'Upload' : 'Action'}
                          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-50 hidden xs:block" />
                        </button>
                      )}
                      {req.status === 'completed' && (
                        <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium transition-colors w-full sm:w-auto">
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
