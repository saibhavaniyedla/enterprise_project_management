import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../../types';
import saiBhavaniAvatar from '../../assets/images/sai_bhavani_avatar_1785863794855.jpg';
import bhargaviAvatar from '../../assets/images/bhargavi_avatar_1785863811137.jpg';
import {
  Camera,
  Upload,
  X,
  Check,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  Download,
  RefreshCw,
  VideoOff,
  FolderKanban,
  Tag,
  Clock,
  Plus,
} from 'lucide-react';

interface WikiViewProps {
  currentProject?: Project | null;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'Architecture' | 'UI Wireframes' | 'Camera Snapshot' | 'Diagram' | 'Artifact';
  createdAt: string;
}

export const WikiView: React.FC<WikiViewProps> = ({ currentProject }) => {
  const projectId = currentProject?.id || 'default-project';
  const storageKey = `wiki_assets_${projectId}`;

  // Local state handler for captured assets
  const [assets, setAssets] = useState<ProjectAsset[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse local wiki assets', e);
    }
    return [
      {
        id: 'asset-default-1',
        projectId,
        title: 'Project Architecture Overview',
        description: 'High-level system topology diagram captured for project documentation.',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800',
        category: 'Architecture',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];
  });

  // Camera modal state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);

  // New asset form details
  const [assetTitle, setAssetTitle] = useState('');
  const [assetDescription, setAssetDescription] = useState('');
  const [assetCategory, setAssetCategory] = useState<ProjectAsset['category']>('Camera Snapshot');

  // Preview Modal
  const [previewAsset, setPreviewAsset] = useState<ProjectAsset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize assets with localStorage whenever assets state changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(assets));
    } catch (e) {
      console.error('Failed to save wiki assets to localStorage', e);
    }
  }, [assets, storageKey]);

  // Reload assets when project changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`wiki_assets_${projectId}`);
      if (saved) {
        setAssets(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load project assets', e);
    }
  }, [projectId]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedDataUrl(null);
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.message || 'Unable to access camera. Please verify camera permissions in your browser.'
      );
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedDataUrl(null);
    setCameraError(null);
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedDataUrl(dataUrl);
        stopCameraStream();
      }
    }
  };

  const handleRetake = () => {
    setCapturedDataUrl(null);
    startCamera();
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedDataUrl) return;

    const newAsset: ProjectAsset = {
      id: `asset-${Date.now()}`,
      projectId,
      title: assetTitle.trim() || `Visual Asset ${assets.length + 1}`,
      description: assetDescription.trim() || 'Captured via Camera API for visual project documentation.',
      imageUrl: capturedDataUrl,
      category: assetCategory,
      createdAt: new Date().toISOString(),
    };

    setAssets((prev) => [newAsset, ...prev]);

    // Reset Form
    setAssetTitle('');
    setAssetDescription('');
    setCapturedDataUrl(null);
    setIsCameraOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const newAsset: ProjectAsset = {
          id: `asset-upload-${Date.now()}`,
          projectId,
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Uploaded file (${(file.size / 1024).toFixed(1)} KB) for ${currentProject?.name || 'Project'} documentation.`,
          imageUrl: result,
          category: 'UI Wireframes',
          createdAt: new Date().toISOString(),
        };

        setAssets((prev) => [newAsset, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (previewAsset?.id === id) {
      setPreviewAsset(null);
    }
  };

  const filteredAssets = categoryFilter === 'All'
    ? assets
    : assets.filter((a) => a.category === categoryFilter);

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#090b10] text-slate-100 space-y-8 min-h-[calc(100vh-120px)]">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Outer Card Container */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* About This Platform Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d0f17] border border-slate-800/80 space-y-4 shadow-xl">
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400 font-mono">
            ABOUT THIS PLATFORM
          </span>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Enterprise Project Management SaaS
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            This is the central collaboration platform for managing workspaces, projects, tasks, team communication, scheduling, and delivery analytics.
          </p>
        </div>

        {/* Visual Documentation & Camera Asset Capture Handler */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d0f17] border border-slate-800/80 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Camera className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold text-white">Project Visual Assets & Documentation</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Capture real-time snapshots with camera or attach diagrams for <strong className="text-white">{currentProject?.name || 'Current Project'}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={startCamera}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Snap with Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 text-xs">
              {['All', 'Camera Snapshot', 'Architecture', 'UI Wireframes', 'Diagram', 'Artifact'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-slate-500 shrink-0">
              {filteredAssets.length} Asset{filteredAssets.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Asset Grid Gallery */}
          {filteredAssets.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No Visual Assets Captured Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use your device camera or upload image files to document wireframes, physical whiteboards, and system architecture.
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition inline-flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden group hover:border-indigo-500/40 transition flex flex-col"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img
                      src={asset.imageUrl}
                      alt={asset.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        className="p-2 rounded-xl bg-slate-900/90 text-white hover:bg-indigo-600 transition shadow-lg"
                        title="View Fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="p-2 rounded-xl bg-slate-900/90 text-rose-400 hover:bg-rose-600 hover:text-white transition shadow-lg"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 text-indigo-300 backdrop-blur-md px-2 py-0.5 rounded-lg border border-indigo-500/20">
                      {asset.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1">{asset.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{asset.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        className="text-indigo-400 hover:text-indigo-300 font-sans font-bold text-xs"
                      >
                        View &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Overview & Stack Details */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d0f17] border border-slate-800/80 space-y-8 shadow-xl">
          {/* Overview */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Overview</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The platform provides a single source of truth for execution across business and engineering teams, with traceable progress from ideation to release.
            </p>
          </div>

          {/* Core Features */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Core Features</h2>
            <div className="flex flex-wrap gap-2.5">
              {[
                'Workspace Dashboard',
                'Project Management',
                'Team Management',
                'Meeting Scheduler',
                'Developer Hub',
                'Executive Analytics',
                'Notification Center',
                'Visual Camera Assets',
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800 text-slate-200 shadow-xs"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Architecture */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Architecture</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Modular frontend pages communicate with dedicated backend services that enforce workspace-aware access, persistence, and project-scoped collaboration.
            </p>
          </div>

          {/* Technology Stack */}
          <div className="space-y-3 pt-2">
            <h2 className="text-lg font-bold text-white">Technology Stack</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Frontend Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <h3 className="text-sm font-bold text-indigo-400">Frontend</h3>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>HTML</li>
                  <li>CSS</li>
                  <li>JavaScript / TypeScript</li>
                  <li>Camera API Integration</li>
                </ul>
              </div>

              {/* Backend Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <h3 className="text-sm font-bold text-indigo-400">Backend</h3>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>FastAPI</li>
                  <li>Python</li>
                </ul>
              </div>

              {/* Database Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <h3 className="text-sm font-bold text-indigo-400">Database</h3>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>MongoDB</li>
                </ul>
              </div>

              {/* Deployment Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <h3 className="text-sm font-bold text-indigo-400">Deployment</h3>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  <li>Render</li>
                  <li>Vercel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d0f17] border border-slate-800/80 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white">Team Members</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sai Bhavani Yedla */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 hover:border-indigo-500/40 transition group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-xl group-hover:scale-105 transition duration-300">
                <img
                  src={saiBhavaniAvatar}
                  alt="Sai Bhavani Yedla"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sai Bhavani Yedla</h3>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">Product Engineer • CBIT 3rd Year</p>
                <a
                  href="mailto:saibhavaniyedla35@gmail.com"
                  className="text-xs text-slate-400 hover:text-indigo-300 font-mono mt-1.5 block"
                >
                  saibhavaniyedla35@gmail.com
                </a>
              </div>
            </div>

            {/* Bhargavi */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 hover:border-indigo-500/40 transition group">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-xl group-hover:scale-105 transition duration-300">
                <img
                  src={bhargaviAvatar}
                  alt="Bhargavi"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bhargavi</h3>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">Frontend Engineer • Vasavi 3rd Year</p>
                <a
                  href="mailto:bhargavi@example.com"
                  className="text-xs text-slate-400 hover:text-indigo-300 font-mono mt-1.5 block"
                >
                  bhargavi@example.com
                </a>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-white">Support</h3>
            <div className="space-y-1 text-xs">
              <p className="text-slate-300">
                Email: <a href="mailto:saibhavaniyedla35@gmail.com" className="text-indigo-400 hover:underline font-mono">saibhavaniyedla35@gmail.com</a>
              </p>
              <p className="text-slate-300">
                Email: <a href="mailto:bhargavi@example.com" className="text-indigo-400 hover:underline font-mono">bhargavi@example.com</a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800/80 text-xs text-slate-400 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white">Acme Corp</h3>
                <p className="text-slate-400 text-xs">Enterprise project management, built for real teams.</p>
              </div>

              <div className="space-y-1 font-mono text-[11px] text-slate-300 pt-2">
                <div>
                  <span className="font-bold text-white">Sai Bhavani Yedla</span> • CBIT • 3rd Year •{' '}
                  <span className="text-indigo-400">saibhavaniyedla35@gmail.com</span>
                </div>
                <div>
                  <span className="font-bold text-white">Bhargavi</span> • Vasavi • 3rd Year •{' '}
                  <span className="text-indigo-400">bhargavi@example.com</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                © 2026 Acme Corp. All rights reserved.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-slate-300">
              <div className="flex items-center gap-4">
                <a href="#home" className="hover:text-white transition">Home</a>
                <a href="#about" className="hover:text-white transition">About</a>
                <a href="#contact" className="hover:text-white transition">Contact</a>
                <a href="#feedback" className="hover:text-white transition">Feedback</a>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Support: <a href="mailto:saibhavaniyedla35@gmail.com" className="text-indigo-400 hover:underline">saibhavaniyedla35@gmail.com</a>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* Offscreen Canvas for Snapshot Capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* CAMERA SNAPSHOT MODAL */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Camera Visual Capture</h3>
                  <p className="text-xs text-slate-400">Take a picture for project documentation</p>
                </div>
              </div>
              <button
                onClick={handleCloseCamera}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewport / Captured Preview */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {cameraError ? (
                <div className="p-8 text-center space-y-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <VideoOff className="w-10 h-10 text-rose-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm">Camera Stream Error</h4>
                    <p className="text-xs text-rose-200 mt-1 max-w-md mx-auto">{cameraError}</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    Upload Image File Instead
                  </button>
                </div>
              ) : capturedDataUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={capturedDataUrl}
                      alt="Captured snapshot"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-mono">
                      Snapshot Ready
                    </span>
                  </div>

                  <form onSubmit={handleSaveAsset} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Asset Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. System Topology Whiteboard"
                          value={assetTitle}
                          onChange={(e) => setAssetTitle(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Category
                        </label>
                        <select
                          value={assetCategory}
                          onChange={(e) => setAssetCategory(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Camera Snapshot">Camera Snapshot</option>
                          <option value="Architecture">Architecture</option>
                          <option value="UI Wireframes">UI Wireframes</option>
                          <option value="Diagram">Diagram</option>
                          <option value="Artifact">Artifact</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Description / Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Add notes describing this visual documentation asset..."
                        value={assetDescription}
                        onChange={(e) => setAssetDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake Photo</span>
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save to Project Assets</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-rose-500/80 text-white px-2 py-0.5 rounded-md font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>Live Camera Feed</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center pt-2">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xl shadow-indigo-600/40 transition flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Capture Snapshot</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW FULLSCREEN MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white">{previewAsset.title}</h3>
                <span className="text-xs font-mono text-indigo-400">{previewAsset.category} • {new Date(previewAsset.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[60vh] flex items-center justify-center">
                <img
                  src={previewAsset.imageUrl}
                  alt={previewAsset.title}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <h4 className="text-xs font-bold text-slate-300">Description / Documentation Notes</h4>
                <p className="text-xs text-slate-400">{previewAsset.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleDeleteAsset(previewAsset.id)}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Asset</span>
                </button>

                <a
                  href={previewAsset.imageUrl}
                  download={`${previewAsset.title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

