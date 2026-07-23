/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function FeedbackOverlay() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((e: any) => {
    const { message, type } = e.detail;
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  useEffect(() => {
    window.addEventListener('tms-feedback', addToast as EventListener);
    return () => window.removeEventListener('tms-feedback', addToast as EventListener);
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[300px] max-w-[450px]
              ${toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : ''}
              ${toast.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : ''}
              ${toast.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-800' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0" />}
            
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function showFeedback(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  window.dispatchEvent(new CustomEvent('tms-feedback', { detail: { message, type } }));
}
