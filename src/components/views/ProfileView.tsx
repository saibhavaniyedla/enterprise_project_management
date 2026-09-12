import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  CheckSquare,
  Share2,
  Award,
  Users,
  Edit3,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Task } from '../../types';

interface ProfileViewProps {
  tasks?: Task[];
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onUpdateProfile?: (data: { name: string; role: string; avatar: string; email?: string; phone?: string; bio?: string }) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  tasks = [],
  userName = 'Yedla Sai Bhavani',
  userRole = 'Principal Software Engineer • Cloud Architecture',
  userAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'activity'>('overview');

  // Custom Profile Saved State
  const [hasCustomProfile, setHasCustomProfile] = useState<boolean>(() => {
    return !!localStorage.getItem('fusionsprint_user_profile');
  });

  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(!hasCustomProfile);

  // Form Fields
  const [editName, setEditName] = useState(userName);
  const [editRole, setEditRole] = useState(userRole);
  const [editAvatar, setEditAvatar] = useState(userAvatar);
  const [editEmail, setEditEmail] = useState('saibhavani.y@acme.corp');
  const [editPhone, setEditPhone] = useState('+1 (555) 234-5678');
  const [editDepartment, setEditDepartment] = useState('Cloud Architecture & Infra Squad');
  const [editBio, setEditBio] = useState('Passionate Cloud Architect & Full-Stack Developer specializing in distributed systems, PostgreSQL, and React applications.');

  useEffect(() => {
    const saved = localStorage.getItem('fusionsprint_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setEditName(parsed.name);
        if (parsed.role) setEditRole(parsed.role);
        if (parsed.avatar) setEditAvatar(parsed.avatar);
        if (parsed.email) setEditEmail(parsed.email);
        if (parsed.phone) setEditPhone(parsed.phone);
        if (parsed.department) setEditDepartment(parsed.department);
        if (parsed.bio) setEditBio(parsed.bio);
      } catch (e) {
        console.warn('Failed to parse saved profile:', e);
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const profileData = {
      name: editName.trim() || 'Yedla Sai Bhavani',
      role: editRole.trim() || 'Lead Engineer',
      avatar: editAvatar.trim() || userAvatar,
      email: editEmail.trim(),
      phone: editPhone.trim(),
      department: editDepartment.trim(),
      bio: editBio.trim(),
    };

    try {
      localStorage.setItem('fusionsprint_user_profile', JSON.stringify(profileData));
      setHasCustomProfile(true);
      setIsEditingProfile(false);
      if (onUpdateProfile) {
        onUpdateProfile({
          name: profileData.name,
          role: profileData.role,
          avatar: profileData.avatar,
          email: profileData.email,
          phone: profileData.phone,
          bio: profileData.bio,
        });
      }
    } catch (err) {
      console.error('Failed to store profile in localStorage', err);
    }
  };

  // Status state
  const [statusText, setStatusText] = useState('Focus Mode Active');
  const [isSettingStatus, setIsSettingStatus] = useState(false);
  const [newStatusInput, setNewStatusInput] = useState('');

  // Clock live time
  const [estTime, setEstTime] = useState('12:19:38 PM');
  const [cetTime, setCetTime] = useState('06:19:38 PM');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setEstTime(
        now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: true })
      );
      setCetTime(
        now.toLocaleTimeString('en-US', { timeZone: 'Europe/Berlin', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tasks state
  const [activeTasks, setActiveTasks] = useState([
    {
      id: 'pt-1',
      title: 'Shard routing configurations on Cloud Infra v2',
      description: 'Ensure database sharding maps align across regional edge clusters.',
      badge: 'IN PR',
      completed: true,
    },
    {
      id: 'pt-2',
      title: 'Validate Kubernetes release manifest variables',
      description: 'Map credentials out of YAML files into production Vault secrets.',
      badge: 'TODAY',
      completed: false,
    },
    {
      id: 'pt-3',
      title: 'Resolve staging cluster deployment bottlenecks',
      description: 'Investigate edge-cache purge timers during rollout pipeline.',
      badge: 'CRITICAL',
      completed: false,
    },
  ]);

  const completedCount = activeTasks.filter((t) => t.completed).length;

  const toggleTask = (id: string) => {
    setActiveTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Skills & Endorsements state
  const [skills, setSkills] = useState([
    { name: 'Cloud Sharding', count: 14 },
    { name: 'Kubernetes', count: 9 },
    { name: 'Terraform', count: 11 },
    { name: 'React Architecture', count: 16 },
  ]);

  const endorseSkill = (index: number) => {
    setSkills((prev) =>
      prev.map((s, i) => (i === index ? { ...s, count: s.count + 1 } : s))
    );
  };

  const handleShareProfile = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Profile URL copied to clipboard!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 min-h-[calc(100vh-64px)] space-y-6">
      {/* Profile Center Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Profile Center</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditingProfile(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-500/20"
          >
            <Edit3 className="w-4 h-4" />
            <span>{hasCustomProfile ? 'Edit Profile' : 'Create Profile'}</span>
          </button>

          {/* Subtabs: Overview | My Tasks | Activity Log */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Tasks
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Activity Log
            </button>
          </div>
        </div>
      </div>

      {/* Account Setup Notice Banner if Profile not created yet */}
      {!hasCustomProfile && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-400 shrink-0 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-white">Create Your Profile</h3>
              <p className="text-xs text-indigo-300">
                Please create your custom profile to personalize your avatar, contact details, role title, and skills.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shrink-0"
          >
            Create Profile Now
          </button>
        </div>
      )}

      {/* Create / Edit Profile Modal Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-[#0d0f17] border border-indigo-500/30 rounded-3xl shadow-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base text-white">
                  {hasCustomProfile ? 'Edit Your User Profile' : 'Create User Profile'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Yedla Sai Bhavani"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="e.g. Principal Architect • Cloud Infrastructure"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Department / Squad</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Core Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Work Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="saibhavani@acme.corp"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Avatar Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]"
                  />
                  <img
                    src={editAvatar}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Bio & Executive Summary</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell your team about your expertise and focus..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold transition shadow-lg shadow-indigo-600/30"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Row: Main User Card + Remote Clock */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card (Col span 2) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative shrink-0">
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-2xl"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#090b10]" />
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-xl font-extrabold text-white">{userName}</h2>
                    <button
                      onClick={() => setIsSettingStatus(!isSettingStatus)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Set Status</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{userRole}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                      L7 Principal
                    </span>
                    <span className="text-[11px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                      EST Timezone
                    </span>
                    <span className="text-[11px] font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <span>{statusText}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleShareProfile}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-indigo-500/20 shrink-0 self-start sm:self-center"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </button>
            </div>

            {/* Remote Clock Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">Remote Clock</h3>
                </div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  EST ZONE
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Your Local Time
                    </span>
                    <span className="text-lg font-black font-mono text-white tracking-wider">
                      {estTime}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">EST (GMT-5)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Berlin ({userName.split(' ')[0]})
                    </span>
                    <span className="text-lg font-black font-mono text-white tracking-wider">
                      {cetTime}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">CET (GMT+1)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Status Modal / Input */}
          {isSettingStatus && (
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-3">
              <span className="text-xs font-bold text-white">Update Status Message</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. In Deep Focus Mode until 3PM"
                  value={newStatusInput}
                  onChange={(e) => setNewStatusInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    if (newStatusInput.trim()) setStatusText(newStatusInput.trim());
                    setIsSettingStatus(false);
                    setNewStatusInput('');
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Middle Row: My Active Tasks & Skills & Endorsements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Active Tasks Card (Col span 2) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-sm text-white">My Active Tasks</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Completed: <strong className="text-white">0{completedCount}/03</strong>
                </span>
              </div>

              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
                      task.completed
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`font-bold text-xs ${
                            task.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                            task.badge === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300'
                              : task.badge === 'IN PR'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {task.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Endorsements Card */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Skills & Endorsements</h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Click any specific skill badge below to endorse {userName} for that domain.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1">
                {skills.map((skill, index) => (
                  <button
                    key={skill.name}
                    onClick={() => endorseSkill(index)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-950/20 text-xs font-bold text-slate-200 flex items-center gap-2 transition group shadow-sm"
                  >
                    <span>{skill.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-mono text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition">
                      {skill.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Card: Teams & Hierarchy */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Teams & Hierarchy</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Manager</span>
                <p className="text-xs font-bold text-white">Elena Rostova</p>
                <span className="text-[10px] text-slate-500">VP of Cloud Engineering</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Team</span>
                <p className="text-xs font-bold text-white">Architecture & Infra Squad</p>
                <span className="text-[10px] text-slate-500">8 Senior Engineers</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                <p className="text-xs font-bold text-white">San Francisco HQ / Remote</p>
                <span className="text-[10px] text-slate-500">EST Timezone Offset</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Detailed Sprint Task History</h3>
          <p className="text-xs text-slate-400">All deliverables assigned across active sprints.</p>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-indigo-400 font-bold">{t.key}</span>
                  <h4 className="text-xs font-bold text-white mt-0.5">{t.title}</h4>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Recent System Activity Log</h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Merged PR #1042: PgBouncer connection pooling fix</span>
              <span className="text-slate-500">10m ago</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Approved release tag v2.4.0-rc1</span>
              <span className="text-slate-500">1h ago</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
              <span className="text-slate-300">Updated Cloud SQL read replica autoscaling limits</span>
              <span className="text-slate-500">3h ago</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
