import React, { useEffect } from 'react';
import { CheckCircle, X, ArrowRight, Copy, Check } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  quoteReference?: string;
  reference?: string;
  title?: string;
  message?: string;
  onClose: () => void;
  onGoHome?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  quoteReference,
  reference,
  title = "Thank you for your enquiry our sales team will get back to you shortly.",
  message,
  onClose,
  onGoHome
}) => {
  const activeReference = quoteReference || reference || '';
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard && activeReference) {
      navigator.clipboard.writeText(activeReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close 'X' Button */}
        <button
          type="button"
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#E8F8F6] text-[#4EC2B5] mx-auto flex items-center justify-center mb-4 ring-8 ring-[#E8F8F6]/50">
          <CheckCircle className="w-10 h-10 text-[#0178A2]" />
        </div>

        {/* Heading / Message */}
        <h2 id="modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {title}
        </h2>

        {message && (
          <p className="mt-3 text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">
            {message}
          </p>
        )}

        {/* Reference Box */}
        {activeReference && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 max-w-sm mx-auto">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Reference Number
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg sm:text-xl font-mono font-bold text-[#0178A2]">
                {activeReference}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy reference code"
                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onGoHome && (
            <button
              type="button"
              id="modal-back-home-btn"
              onClick={onGoHome}
              className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-sm bg-[#0178A2] hover:bg-[#015B7A] text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
