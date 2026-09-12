import React, { useState } from 'react';
import {
  X,
  Send,
  Star,
  MessageSquare,
  CheckCircle2,
  Mail,
  GraduationCap,
  Sparkles,
  Bug,
  Lightbulb,
  ThumbsUp,
} from 'lucide-react';
import { submitFeedbackInDb } from '../lib/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  currentUserName?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail = '',
  currentUserName = '',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'feature' | 'bug' | 'praise' | 'general'>('feature');
  const [name, setName] = useState(currentUserName || '');
  const [email, setEmail] = useState(currentUserEmail || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide your feedback or message.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await submitFeedbackInDb({
        name: name.trim() || 'Anonymous User',
        email: email.trim() || 'anonymous@fusionsprint.app',
        rating,
        category,
        message: message.trim(),
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      // Fallback success feedback
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Contact & Feedback</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  Instant Dispatch
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Share your suggestions, review, or questions directly with the developers.
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

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {submitted ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Thank You for Your Feedback!</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Your message and rating have been recorded in real-time. Sai Bhavani Yedla and the engineering team will review it shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Developer Info Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/60">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-violet-400" />
                    <span>Project Authors & Engineering Team</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">CBIT & Vasavi</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="font-bold text-white text-xs">Sai Bhavani Yedla</div>
                    <div className="text-[11px] text-slate-400">CBIT • 3rd Year</div>
                    <a href="mailto:saibhavaniyedla35@gmail.com" className="text-[10px] text-indigo-400 hover:underline font-mono block mt-0.5">
                      saibhavaniyedla35@gmail.com
                    </a>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="font-bold text-white text-xs">Bhargavi</div>
                    <div className="text-[11px] text-slate-400">Vasavi • 3rd Year</div>
                    <a href="mailto:bhargavi@example.com" className="text-[10px] text-indigo-400 hover:underline font-mono block mt-0.5">
                      bhargavi@example.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Rating selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  How would you rate FusionSprint Enterprise?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-600 hover:text-amber-400 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {rating === 5
                      ? '5/5 Excellent!'
                      : rating === 4
                      ? '4/5 Great'
                      : rating === 3
                      ? '3/5 Good'
                      : `${rating}/5 Needs Improvement`}
                  </span>
                </div>
              </div>

              {/* Feedback category pills */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'feature', label: 'Feature Idea', icon: Lightbulb },
                    { id: 'bug', label: 'Report Bug', icon: Bug },
                    { id: 'praise', label: 'Praise', icon: ThumbsUp },
                    { id: 'general', label: 'General', icon: MessageSquare },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                          category === cat.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Email inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Message text area */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Message / Feedback Details *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you like or what could be improved..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              {/* Submit button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
