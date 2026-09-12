import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  FileText,
  Edit3,
  Eye,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Project } from '../../types';

interface ProjectReadmeSubViewProps {
  project: Project;
  onSaveReadme: (newReadme: string) => Promise<void>;
  isSaving?: boolean;
}

export const ProjectReadmeSubView: React.FC<ProjectReadmeSubViewProps> = ({
  project,
  onSaveReadme,
  isSaving = false,
}) => {
  const [content, setContent] = useState(project.readme || '');
  const [mode, setMode] = useState<'edit' | 'preview'>(
    project.readme && project.readme.trim().length > 0 ? 'preview' : 'edit'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync with project updates if remote changes arrive and local wasn't modified
  useEffect(() => {
    setContent(project.readme || '');
    if (!project.readme || project.readme.trim().length === 0) {
      setMode('edit');
    }
  }, [project.id, project.readme]);

  const hasUnsavedChanges = content !== (project.readme || '');

  const handleSave = async () => {
    try {
      await onSaveReadme(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save README:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col min-h-[600px] text-slate-200">
      {/* Header Bar with Tab Switches and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {project.name} README.md
              </h2>
              {hasUnsavedChanges && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Unsaved Changes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Project documentation, technical specifications, and onboarding guidelines
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mode === 'edit'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                mode === 'preview'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy raw markdown"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1.5 font-medium border border-slate-700/60"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Save Action */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition shadow-lg ${
              hasUnsavedChanges
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Firestore...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save README</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="flex-1 mt-6 flex flex-col min-h-[450px]">
        {mode === 'edit' ? (
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span>Markdown Editor (GitHub-Flavored Markdown syntax supported)</span>
              <span>{content.length} characters</span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# ${project.name}

## 📖 Project Overview
Write an introduction to this project, architecture guidelines, and key deliverable milestones.

## 🛠 Tech Stack
- Frontend: React 18, TypeScript, Tailwind CSS
- Backend: Express & Firebase Firestore (Real-Time)

## 📌 Deliverables
1. [ ] Initial architecture setup
2. [ ] Core feature implementation
3. [ ] QA and Release
`}
              className="w-full flex-1 min-h-[450px] p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:ring-2 focus:ring-violet-500 focus:outline-none resize-y"
            />
          </div>
        ) : (
          <div className="flex-1 rounded-2xl bg-slate-950/70 border border-slate-800/80 p-6 sm:p-8 overflow-y-auto">
            {content.trim().length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">This project doesn't have a README yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Add markdown documentation, setup instructions, architecture notes, and team guidelines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/20 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Click to Edit README</span>
                </button>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-code:text-violet-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-table:border-collapse prose-th:border prose-th:border-slate-800 prose-th:p-2 prose-td:border prose-td:border-slate-800 prose-td:p-2">
                <Markdown>{content}</Markdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
