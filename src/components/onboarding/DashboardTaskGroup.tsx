import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Info, AlertCircle, CheckCircle2, Clock, Loader2, UploadCloud, X, FileText, Send, File, Paperclip } from 'lucide-react';
import { TaskGroup, Requirement } from '@/data/mockCredentialingApp';
import { createPortal } from 'react-dom';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

interface Props {
  group: TaskGroup;
  defaultOpen?: boolean;
  onRequirementUpdated?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <File className="w-5 h-5 text-rose-500" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <File className="w-5 h-5 text-blue-500" />;
  if (['doc', 'docx'].includes(ext || '')) return <File className="w-5 h-5 text-indigo-500" />;
  return <FileText className="w-5 h-5 text-slate-400" />;
}

// ── Upload Modal (rendered via portal) ──────────────────────
type UploadedFile = { filename: string; size: number; last_modified: string | null };

function UploadModal({
  req,
  onClose,
  onSubmitted,
}: {
  req: Requirement;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 25 * 1024 * 1024;

  // Load previously uploaded files
  useEffect(() => {
    setLoadingFiles(true);
    fetch(`${API_BASE}/files/me/files?requirement_id=${req.id}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { files: [] }))
      .then((data) => setExistingFiles(data.files || []))
      .catch(() => setExistingFiles([]))
      .finally(() => setLoadingFiles(false));
  }, [req.id]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const tooBig = arr.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      setError(`"${tooBig.name}" exceeds 25 MB limit.`);
      return;
    }
    setError('');
    setNewFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...arr.filter((f) => !names.has(f.name))];
    });
  }, []);

  function removeNewFile(name: string) {
    setNewFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }

  async function handleSubmit() {
    if (!newFiles.length) return;
    setSubmitting(true);
    setError('');
    try {
      // 1. Upload each file to Azure Blob Storage
      for (const file of newFiles) {
        const form = new FormData();
        form.append('file', file);
        const uploadRes = await fetch(
          `${API_BASE}/files/me/upload?requirement_id=${req.id}`,
          { method: 'POST', body: form, credentials: 'include' },
        );
        if (!uploadRes.ok) {
          const body = await uploadRes.json().catch(() => ({ detail: 'Upload failed' }));
          throw new Error(body.detail || `Failed to upload ${file.name}`);
        }
      }

      // 2. Mark requirement as submitted for review
      const res = await fetch(`${API_BASE}/requirements/me/submit/${req.id}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Submit failed' }));
        throw new Error(data.detail || 'Failed to submit');
      }
      setSuccess(true);
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{req.title}</h3>
            {req.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{req.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 md:p-6">
          {success ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Submitted!</h4>
              <p className="text-sm text-slate-500 mt-1">
                {newFiles.length} file{newFiles.length > 1 ? 's' : ''} uploaded and pending review.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Previously uploaded files */}
              {loadingFiles ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading files...
                </div>
              ) : existingFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Previously submitted
                  </p>
                  {existingFiles.map((f) => (
                    <div
                      key={f.filename}
                      className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{f.filename}</p>
                        <p className="text-xs text-slate-400">
                          {formatFileSize(f.size)}
                          {f.last_modified && ` · ${new Date(f.last_modified).toLocaleDateString()}`}
                        </p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  dragging ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <UploadCloud className={`w-6 h-6 ${dragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {dragging ? 'Drop files here' : existingFiles.length > 0 ? 'Upload additional files' : 'Drag and drop or click to browse'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DOC, DOCX — Max 25 MB each</p>
              </div>

              {/* New files to upload */}
              {newFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                    {newFiles.length} new file{newFiles.length > 1 ? 's' : ''} ready to submit
                  </p>
                  {newFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                        {fileIcon(file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        onClick={() => removeNewFile(file.name)}
                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 shrink-0 transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="shrink-0 p-5 md:p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {newFiles.length === 0 ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!newFiles.length || submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 disabled:shadow-none"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Upload {newFiles.length > 1 ? `${newFiles.length} Files` : newFiles.length === 1 ? '& Submit' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

// ── Main Component ──────────────────────────────────────────
export function DashboardTaskGroup({ group, defaultOpen = true, onRequirementUpdated }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [uploadReq, setUploadReq] = useState<Requirement | null>(null);

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
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm md:shadow-lg mb-4 md:mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 md:p-5 lg:p-6 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              {isOpen ? <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-500" /> : <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />}
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
                  <div key={req.id} className="p-3 md:p-5 lg:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
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
                            <span className="px-1.5 md:px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[9px] md:text-[10px] font-bold tracking-wider shrink-0">REQ</span>
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
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                      {getStatusBadge(req.status)}
                      <div className="flex-1 flex justify-end">
                        {req.status !== 'completed' && (
                          <button
                            onClick={() => setUploadReq(req)}
                            className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs md:text-sm transition-all shadow-md shadow-indigo-600/20 w-full sm:w-auto"
                          >
                            {['pending', 'reviewing'].includes(req.status) ? 'View / Upload' : req.type === 'upload' ? 'Upload' : 'Action'}
                            <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-50 hidden xs:block" />
                          </button>
                        )}
                        {req.status === 'completed' && (
                          <button
                            onClick={() => setUploadReq(req)}
                            className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-medium transition-colors w-full sm:w-auto"
                          >
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

      {/* Upload Modal — rendered via portal to escape layout context */}
      <AnimatePresence>
        {uploadReq && (
          <UploadModal
            req={uploadReq}
            onClose={() => setUploadReq(null)}
            onSubmitted={() => onRequirementUpdated?.()}
          />
        )}
      </AnimatePresence>
    </>
  );
}
