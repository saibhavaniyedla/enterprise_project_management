import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { AIInsightResponse, Sprint, Project } from '../types';
import { fetchAIInsights } from '../lib/api';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSprint: Sprint;
  currentProject: Project;
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({
  isOpen,
  onClose,
  currentSprint,
  currentProject,
}) => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<AIInsightResponse | null>(null);

  const loadInsights = async () => {
    if (!currentSprint?.id || !currentProject?.id) return;
    setLoading(true);
    try {
      const data = await fetchAIInsights(currentSprint.id, currentProject.id);
      setInsights(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentSprint?.id && currentProject?.id) {
      loadInsights();
    }
  }, [isOpen, currentSprint?.id, currentProject?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-200" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                Gemini AI Sprint Risk Analyzer
              </h2>
              <p className="text-xs text-violet-200 font-medium">
                {currentProject.name} — {currentSprint.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadInsights}
              disabled={loading}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
              title="Refresh AI analysis"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin mb-4" />
              <h3 className="font-bold text-slate-800 text-base">
                Analyzing Sprint Velocity & Bottlenecks...
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Gemini is evaluating story point estimates, assignee capacity, and urgent dependency risks.
              </p>
            </div>
          ) : insights ? (
            <div className="flex flex-col gap-6">
              {/* Top Banner: Health Score + Executive Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-violet-50/70 border border-violet-200 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                    Sprint Health Score
                  </span>
                  <div className="text-4xl font-black text-violet-900 my-1">
                    {insights.sprintHealthScore}
                    <span className="text-lg font-normal text-violet-500">
                      /100
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-200/80 text-violet-800">
                    {insights.sprintHealthScore >= 85
                      ? 'On Track'
                      : insights.sprintHealthScore >= 70
                      ? 'Moderate Risk'
                      : 'High Alert'}
                  </span>
                </div>

                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Executive Assessment
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {insights.summary}
                  </p>
                </div>
              </div>

              {/* Identified Risks */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Flagged Risks & Recommendations ({insights.risks.length})</span>
                </h4>
                <div className="flex flex-col gap-3">
                  {insights.risks.map((risk, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row gap-3 justify-between items-start"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {risk.taskKey && (
                            <span className="text-xs font-mono font-bold bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-sm">
                              {risk.taskKey}
                            </span>
                          )}
                          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-800">
                            {risk.severity} risk
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {risk.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {risk.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottlenecks & Action Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bottlenecks */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Workflow Bottlenecks</span>
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {insights.bottlenecks.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 font-medium flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Action Items */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2.5 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <span>AI Action Plan</span>
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {insights.actionItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 font-medium flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Powered by Gemini 3.6 Flash enterprise heuristics</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
