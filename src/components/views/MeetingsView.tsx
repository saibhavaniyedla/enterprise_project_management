import React, { useState, useMemo } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Play,
  FileText,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
  Search,
  Filter,
  Volume2,
} from 'lucide-react';
import { Project, TeamMember, Task } from '../../types';

interface MeetingsViewProps {
  projects: Project[];
  members: TeamMember[];
  currentProject?: Project | null;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  projects,
  members,
  currentProject,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'recordings' | 'ai-summary'>('upcoming');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    currentProject?.id || projects[0]?.id || ''
  );
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // New meeting form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('Today, 03:00 PM');
  const [newDuration, setNewDuration] = useState('30 mins');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  // Real-time meetings list initialized per project
  const [meetingsList, setMeetingsList] = useState([
    {
      id: 'm-101',
      title: 'Database Pooling Migration Standup',
      projectId: projects[0]?.id || 'p-1',
      projectKey: projects[0]?.key || 'MIG',
      time: 'Today, 02:30 PM',
      duration: '30 mins',
      host: 'Alex Rivera',
      url: 'https://meet.google.com/mig-pooling-standup-2026',
      attendees: ['Alex Rivera', 'Sarah Chen', 'Marcus Vance'],
      status: 'upcoming',
    },
    {
      id: 'm-102',
      title: 'K8s Cluster Security Review',
      projectId: projects[0]?.id || 'p-1',
      projectKey: projects[0]?.key || 'MIG',
      time: 'Tomorrow, 10:00 AM',
      duration: '45 mins',
      host: 'Sarah Chen',
      url: 'https://meet.google.com/mig-k8s-rbac-review-2026',
      attendees: ['Sarah Chen', 'Elena Rostova'],
      status: 'upcoming',
    },
    {
      id: 'm-103',
      title: 'GraphQL API Gateway Schema Sync',
      projectId: projects[1]?.id || 'p-2',
      projectKey: projects[1]?.key || 'PORT',
      time: 'Aug 07, 11:30 AM',
      duration: '30 mins',
      host: 'Marcus Vance',
      url: 'https://meet.google.com/port-graphql-schema-2026',
      attendees: ['Marcus Vance', 'Alex Rivera', 'David Kim'],
      status: 'upcoming',
    },
  ]);

  // Project meeting recordings
  const [recordingsList, setRecordingsList] = useState([
    {
      id: 'rec-201',
      title: 'Sprint 24 Planning & Architecture Deep Dive',
      projectId: projects[0]?.id || 'p-1',
      date: 'Aug 02, 2026',
      duration: '42 mins',
      host: 'Alex Rivera',
      videoThumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
      decisions: [
        'Approved PgBouncer connection limit at 250 connections.',
        'Cutover scheduled for Thursday maintenance window.',
      ],
      transcriptSnippet: 'Alex: Welcome team. Today we discuss the PostgreSQL connection limits under high load...',
    },
    {
      id: 'rec-202',
      title: 'Redis Cache Failover & Multi-AZ Cluster Sync',
      projectId: projects[0]?.id || 'p-1',
      date: 'Jul 29, 2026',
      duration: '28 mins',
      host: 'Sarah Chen',
      videoThumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
      decisions: ['Configured sentinel failover timeout to 5 seconds.'],
      transcriptSnippet: 'Sarah: We ran simulated node terminations on us-west-2a and observed zero dropped requests...',
    },
  ]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Filter meetings strictly for the selected project
  const filteredMeetings = useMemo(() => {
    return meetingsList.filter((m) => m.projectId === selectedProjectId);
  }, [meetingsList, selectedProjectId]);

  const filteredRecordings = useMemo(() => {
    return recordingsList.filter((r) => r.projectId === selectedProjectId);
  }, [recordingsList, selectedProjectId]);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const proj = projects.find((p) => p.id === selectedProjectId) || projects[0];
    const generatedUrl = `https://meet.google.com/${proj.key.toLowerCase()}-${Date.now().toString().slice(-6)}`;

    const newMeeting = {
      id: `m-${Date.now()}`,
      title: newTitle,
      projectId: proj.id,
      projectKey: proj.key,
      time: newTime || 'Tomorrow, 02:00 PM',
      duration: newDuration || '30 mins',
      host: 'Alex Rivera',
      url: generatedUrl,
      attendees: selectedAttendees.length > 0 ? selectedAttendees : ['Alex Rivera', 'Sarah Chen'],
      status: 'upcoming',
    };

    setMeetingsList([newMeeting, ...meetingsList]);
    setIsScheduleOpen(false);
    setNewTitle('');
    setSelectedAttendees([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 min-h-[calc(100vh-64px)] space-y-6">
      {/* Header & Subtabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Project Standups & Meetings
            </span>
            <span className="text-xs font-mono text-slate-400">
              Active Project: <strong className="text-white">{activeProject?.name}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Video className="w-7 h-7 text-indigo-400" />
            <span>Project Video Syncs & Recordings</span>
          </h1>
        </div>

        {/* Project Selector & Subtabs */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                Project: {p.name} ({p.key})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setActiveSubTab('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'upcoming'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Upcoming Syncs
            </button>

            <button
              onClick={() => setActiveSubTab('recordings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeSubTab === 'recordings'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recordings ({filteredRecordings.length})
            </button>

            <button
              onClick={() => setActiveSubTab('ai-summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                activeSubTab === 'ai-summary'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>AI Summaries</span>
            </button>
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Project Meeting</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: UPCOMING SYNCS */}
      {activeSubTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Upcoming Video Syncs for {activeProject?.name} ({filteredMeetings.length})
            </h2>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-400">
                No upcoming syncs scheduled for project <strong className="text-white">{activeProject?.name}</strong>.
              </p>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs"
              >
                + Schedule Sync for {activeProject?.key}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeetings.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {m.projectKey} Project Sync
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {m.time}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base">{m.title}</h3>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Hosted by: <strong className="text-slate-200">{m.host}</strong></div>
                      <div>Duration: <span className="font-mono">{m.duration}</span></div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {m.attendees.map((att) => (
                          <span
                            key={att}
                            className="text-[10px] font-medium bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                          >
                            {att}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                      {m.url}
                    </span>

                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: RECORDINGS */}
      {activeSubTab === 'recordings' && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Past Recorded Meetings for {activeProject?.name} ({filteredRecordings.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecordings.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition space-y-4"
              >
                {/* Video Preview Box */}
                <div className="relative h-48 bg-slate-950 overflow-hidden group">
                  <img
                    src={rec.videoThumbnail}
                    alt={rec.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-transparent" />

                  <button
                    onClick={() => alert(`Playing recording: ${rec.title}`)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>

                  <span className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 font-mono text-[10px] text-slate-200">
                    ⏱️ {rec.duration}
                  </span>
                </div>

                <div className="p-5 space-y-3 pt-0">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{rec.date}</span>
                    <span>Host: {rec.host}</span>
                  </div>

                  <h3 className="font-bold text-white text-base">{rec.title}</h3>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Key Decisions Taken:
                    </span>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {rec.decisions.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: AI SUMMARIES */}
      {activeSubTab === 'ai-summary' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">AI Meeting Transcripts & Action Extractor</h3>
          </div>
          <p className="text-xs text-slate-400">
            Gemini automatically parses voice logs, extracts task deliverables, and posts assigned tickets directly into the sprint backlog.
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
            <div className="text-amber-400 font-bold">★ Gemini Summary: Sprint 24 Kickoff Sync</div>
            <p className="leading-relaxed">
              "The team discussed migrating legacy user sessions from Redis single node to a 3-replica Cluster. Sarah Chen took ownership of the Terraform setup. Alex Rivera will review the connection retry handling in auth-service."
            </p>
            <div className="flex items-center gap-2 pt-2 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Extracted 2 new tasks & added to Sprint 24 backlog!</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <form
            onSubmit={handleScheduleSubmit}
            className="bg-[#0e111a] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-slate-100 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Schedule Project Sync</h3>
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Project Target
              </label>
              <input
                type="text"
                readOnly
                value={`${activeProject?.name} (${activeProject?.key})`}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Meeting Topic
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Architecture Sync on Redis Failover"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Duration</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Select Project Attendees
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                {members.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAttendees.includes(m.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAttendees([...selectedAttendees, m.name]);
                        } else {
                          setSelectedAttendees(selectedAttendees.filter((name) => name !== m.name));
                        }
                      }}
                      className="accent-indigo-600 rounded"
                    />
                    <span>{m.name} ({m.role})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsScheduleOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Generate Google Meet Link
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
