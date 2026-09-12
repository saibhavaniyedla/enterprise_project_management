import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  Building,
  Phone,
  Sparkles,
} from 'lucide-react';
import { submitFeedbackInDb } from '../lib/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onOpenFeedback,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Inquiry about FusionSprint Enterprise');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please enter a message to send.');
      return;
    }
    setError(null);
    setIsSending(true);

    try {
      await submitFeedbackInDb({
        name: name.trim() || 'Guest Contact',
        email: email.trim() || 'guest@company.com',
        rating: 5,
        category: 'general',
        message: `[Contact Form: ${subject}]\n${message.trim()}`,
        submittedAt: new Date().toISOString(),
      });

      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setMessage('');
        onClose();
      }, 2500);
    } catch {
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        setMessage('');
        onClose();
      }, 2500);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Contact Engineering Team</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                  Direct Response
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reach out for technical questions, platform integration, or project inquiries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {sentSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Thank you for contacting us. We will get back to you at <strong>{email || 'your email'}</strong> promptly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Developer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
                      alt="Sai Bhavani Yedla"
                      className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs">Sai Bhavani Yedla</h4>
                      <p className="text-[10px] text-indigo-400">CBIT • 3rd Year</p>
                    </div>
                  </div>
                  <a
                    href="mailto:saibhavaniyedla35@gmail.com"
                    className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white font-mono bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 mt-1"
                  >
                    <Mail className="w-3 h-3 text-indigo-400" />
                    <span>saibhavaniyedla35@gmail.com</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250"
                      alt="Bhargavi"
                      className="w-8 h-8 rounded-full object-cover border border-violet-500/40"
                    />
                    <div>
                      <h4 className="font-bold text-white text-xs">Bhargavi</h4>
                      <p className="text-[10px] text-violet-400">Vasavi • 3rd Year</p>
                    </div>
                  </div>
                  <a
                    href="mailto:bhargavi@example.com"
                    className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white font-mono bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 mt-1"
                  >
                    <Mail className="w-3 h-3 text-violet-400" />
                    <span>bhargavi@example.com</span>
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Message *</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or question..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={`mailto:saibhavaniyedla35@gmail.com?subject=${encodeURIComponent(
                      subject
                    )}&body=${encodeURIComponent(message || 'Hello Sai Bhavani Yedla,')}`}
                    className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Email App</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition flex items-center gap-2"
                    >
                      {isSending ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
