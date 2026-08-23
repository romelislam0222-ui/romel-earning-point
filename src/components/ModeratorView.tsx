import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  PlusCircle,
  Trash2,
  Send,
  Users,
  Coins,
  DollarSign,
  Layers,
  Settings,
  Megaphone,
  Download,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  Edit2
} from 'lucide-react';
import type { AppDatabaseState, TaskItem, EarnItem, MovieItem, AppItem, NotificationItem } from '../types';

interface ModeratorViewProps {
  db: AppDatabaseState;
  onUpdateDb: (newDb: AppDatabaseState) => void;
  onApproveProof: (id: number) => void;
  onRejectProof: (id: number, reason?: string) => void;
  onVerifyWithdrawal: (id: number) => void;
  onRejectWithdrawal: (id: number, reason?: string) => void;
  onBroadcastNotif: (notif: { title: string; body: string; type?: 'info' | 'reward' | 'urgent'; targetUserId?: number | 'all' }) => void;
  onToast: (msg: string) => void;
}

export const ModeratorView: React.FC<ModeratorViewProps> = ({
  db,
  onUpdateDb,
  onApproveProof,
  onRejectProof,
  onVerifyWithdrawal,
  onRejectWithdrawal,
  onBroadcastNotif,
  onToast
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'withdrawals' | 'tasks' | 'earns' | 'movies' | 'apps' | 'users' | 'broadcast' | 'settings'>('submissions');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState('30');
  const [taskProof, setTaskProof] = useState('');
  const [taskLink, setTaskLink] = useState('');
  const [taskCategory, setTaskCategory] = useState('Social Media');

  // New Earn Form
  const [earnTitle, setEarnTitle] = useState('');
  const [earnDesc, setEarnDesc] = useState('');
  const [earnReward, setEarnReward] = useState('15');
  const [earnLimit, setEarnLimit] = useState('Daily 1 Time');
  const [earnLink, setEarnLink] = useState('');

  // New Movie Form
  const [movieTitle, setMovieTitle] = useState('');
  const [moviePrice, setMoviePrice] = useState('250');
  const [movieUrl, setMovieUrl] = useState('');
  const [movieEmoji, setMovieEmoji] = useState('🎬');

  // New App Form
  const [appTitle, setAppTitle] = useState('');
  const [appPrice, setAppPrice] = useState('300');
  const [appUrl, setAppUrl] = useState('');
  const [appEmoji, setAppEmoji] = useState('💎');

  // Notification Broadcast Form
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'reward' | 'urgent'>('info');

  // Settings
  const [bannerText, setBannerText] = useState(db.settings?.broadcastBanner || '');
  const [paymentPhone, setPaymentPhone] = useState(db.settings?.promotionPaymentNumber || '01334788303');
  const [minWithdraw, setMinWithdraw] = useState(String(db.settings?.minWithdrawal || 700));

  // Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    const newTask: TaskItem = {
      id: Date.now(),
      title: taskTitle,
      desc: taskDesc,
      reward: Number(taskReward) || 20,
      proof: taskProof || 'Username / Screenshot',
      status: 'active',
      link: taskLink,
      category: taskCategory
    };
    const updated = { ...db, tasks: [newTask, ...db.tasks] };
    onUpdateDb(updated);
    onToast(`✅ Task "${newTask.title}" added live!`);
    setTaskTitle('');
    setTaskDesc('');
    setTaskProof('');
    setTaskLink('');
  };

  const handleDeleteTask = (id: number) => {
    const updated = { ...db, tasks: db.tasks.filter(t => t.id !== id) };
    onUpdateDb(updated);
    onToast('🗑️ Task removed from database');
  };

  const handleAddEarn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!earnTitle) return;
    const newEarn: EarnItem = {
      id: Date.now(),
      title: earnTitle,
      desc: earnDesc,
      reward: Number(earnReward) || 10,
      limit: earnLimit,
      link: earnLink
    };
    const updated = { ...db, earns: [newEarn, ...db.earns] };
    onUpdateDb(updated);
    onToast(`✅ Daily earn "${newEarn.title}" added!`);
    setEarnTitle('');
    setEarnDesc('');
    setEarnLink('');
  };

  const handleDeleteEarn = (id: number) => {
    const updated = { ...db, earns: db.earns.filter(e => e.id !== id) };
    onUpdateDb(updated);
    onToast('🗑️ Earn item removed');
  };

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle || !movieUrl) return;
    const newMovie: MovieItem = {
      id: Date.now(),
      title: movieTitle,
      price: Number(moviePrice) || 200,
      emoji: movieEmoji || '🎬',
      url: movieUrl
    };
    const updated = { ...db, movies: [newMovie, ...db.movies] };
    onUpdateDb(updated);
    onToast(`🍿 Movie "${newMovie.title}" added!`);
    setMovieTitle('');
    setMovieUrl('');
  };

  const handleDeleteMovie = (id: number) => {
    const updated = { ...db, movies: db.movies.filter(m => m.id !== id) };
    onUpdateDb(updated);
    onToast('🗑️ Movie removed');
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appTitle || !appUrl) return;
    const newApp: AppItem = {
      id: Date.now(),
      title: appTitle,
      price: Number(appPrice) || 250,
      emoji: appEmoji || '💎',
      url: appUrl
    };
    const updated = { ...db, apps: [newApp, ...db.apps] };
    onUpdateDb(updated);
    onToast(`💎 App "${newApp.title}" added!`);
    setAppTitle('');
    setAppUrl('');
  };

  const handleDeleteApp = (id: number) => {
    const updated = { ...db, apps: db.apps.filter(a => a.id !== id) };
    onUpdateDb(updated);
    onToast('🗑️ App removed');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) return;
    onBroadcastNotif({
      title: notifTitle,
      body: notifBody,
      type: notifType,
      targetUserId: 'all'
    });
    onToast('📢 Announcement broadcasted to all users!');
    setNotifTitle('');
    setNotifBody('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...db,
      settings: {
        ...db.settings,
        broadcastBanner: bannerText,
        promotionPaymentNumber: paymentPhone,
        minWithdrawal: Number(minWithdraw) || 700
      }
    };
    onUpdateDb(updated);
    onToast('⚙️ Platform settings saved successfully!');
  };

  const pendingSubmissions = db.submissions.filter(s => s.status === 'pending');
  const pendingWithdrawals = db.withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Top Moderator Stats & Status */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100">MODERATOR COMMAND CENTER</h2>
              <p className="text-xs text-rose-300 font-semibold">Master Admin & Real-time Content Control</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Pending Proofs</div>
            <div className="text-sm font-black text-amber-400">{pendingSubmissions.length}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Pending Cashouts</div>
            <div className="text-sm font-black text-rose-400">{pendingWithdrawals.length}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Total Users</div>
            <div className="text-sm font-black text-indigo-400">{db.users.length}</div>
          </div>
        </div>
      </div>

      {/* Moderator Sub-Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'submissions', label: `Task Proofs (${pendingSubmissions.length})` },
          { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})` },
          { id: 'tasks', label: `Tasks (${db.tasks.length})` },
          { id: 'earns', label: `Daily Earns (${db.earns.length})` },
          { id: 'movies', label: `Movies (${db.movies.length})` },
          { id: 'apps', label: `Apps (${db.apps.length})` },
          { id: 'users', label: `Users (${db.users.length})` },
          { id: 'broadcast', label: 'Broadcast Notif' },
          { id: 'settings', label: 'Global Settings' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SUBMISSIONS VERIFICATION */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Pending User Task Submissions</h3>
          {db.submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No task submissions submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {db.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    sub.status === 'pending'
                      ? 'bg-slate-900 border-amber-500/40'
                      : sub.status === 'correct'
                      ? 'bg-slate-950/60 border-emerald-500/20'
                      : 'bg-slate-950/60 border-rose-500/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{sub.userName || 'User'}</span>
                      <span className="text-[10px] text-slate-500">• {sub.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'correct' ? 'bg-emerald-500/20 text-emerald-400' :
                        sub.status === 'incorrect' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-amber-300 mt-1">
                      Task: {sub.task} (+৳{sub.reward})
                    </div>
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 select-all">
                      Proof: {sub.proof}
                    </div>
                  </div>

                  {sub.status === 'pending' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onApproveProof(sub.id)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve (+৳{sub.reward})
                      </button>
                      <button
                        onClick={() => {
                          const r = prompt('Reason for rejection:');
                          onRejectProof(sub.id, r || undefined);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WITHDRAWAL VERIFICATION */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">User Withdrawal Requests</h3>
          {db.withdrawals.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              No withdrawal requests pending.
            </div>
          ) : (
            <div className="space-y-3">
              {db.withdrawals.map((w) => (
                <div
                  key={w.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    w.status === 'pending'
                      ? 'bg-slate-900 border-rose-500/40'
                      : w.status === 'verified'
                      ? 'bg-slate-950/60 border-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">{w.userName}</span>
                      <span className="text-[10px] text-slate-500">• {w.date}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        w.status === 'verified' ? 'bg-emerald-500/20 text-emerald-400' :
                        w.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {w.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-base font-black text-rose-400 mt-1">
                      ৳{w.amount} via {w.method}
                    </div>
                    <div className="text-xs text-slate-300 font-mono mt-0.5 select-all">
                      Account: {w.account}
                    </div>
                  </div>

                  {w.status === 'pending' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onVerifyWithdrawal(w.id)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Paid & Verify
                      </button>
                      <button
                        onClick={() => {
                          const r = prompt('Reason for rejection & refund:');
                          onRejectWithdrawal(w.id, r || undefined);
                        }}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-black flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Refund
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAGE TASKS */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Task Form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" /> Add New Micro Task
            </h3>
            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Join Facebook VIP Group"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Reward (৳)</label>
                <input
                  type="number"
                  required
                  value={taskReward}
                  onChange={(e) => setTaskReward(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="Social Media">Social Media</option>
                  <option value="YouTube Task">YouTube Task</option>
                  <option value="App Install">App Install</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={taskLink}
                  onChange={(e) => setTaskLink(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Proof Required</label>
                <input
                  type="text"
                  placeholder="e.g. Profile username"
                  value={taskProof}
                  onChange={(e) => setTaskProof(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Instructions / Description</label>
                <textarea
                  rows={2}
                  placeholder="What should the user do?"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
              >
                Publish Live Task
              </button>
            </form>
          </div>

          {/* Task List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Active Tasks ({db.tasks.length})</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {db.tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{t.title}</div>
                    <div className="text-[11px] text-amber-400 font-semibold mt-0.5">Reward: +৳{t.reward} • {t.category}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGE EARNS */}
      {activeTab === 'earns' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" /> Add Daily Earn
            </h3>
            <form onSubmit={handleAddEarn} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Earn Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Bonus"
                  value={earnTitle}
                  onChange={(e) => setEarnTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Reward (৳)</label>
                <input
                  type="number"
                  required
                  value={earnReward}
                  onChange={(e) => setEarnReward(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Limit / Frequency</label>
                <input
                  type="text"
                  value={earnLimit}
                  onChange={(e) => setEarnLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={earnDesc}
                  onChange={(e) => setEarnDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
              >
                Publish Earn Item
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Active Earn Items ({db.earns.length})</h3>
            <div className="space-y-2">
              {db.earns.map((e) => (
                <div
                  key={e.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-100">{e.title}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Reward: +৳{e.reward} • {e.limit}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteEarn(e.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MOVIES */}
      {activeTab === 'movies' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-rose-400" /> Add Premium Movie
            </h3>
            <form onSubmit={handleAddMovie} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inception 2 (HD)"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Price (Points ৳)</label>
                <input
                  type="number"
                  required
                  value={moviePrice}
                  onChange={(e) => setMoviePrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Google Drive Link / URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={movieUrl}
                  onChange={(e) => setMovieUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs"
              >
                Save Movie
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Movies & Series ({db.movies.length})</h3>
            <div className="space-y-2">
              {db.movies.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.emoji || '🎬'}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{m.title}</div>
                      <div className="text-[11px] text-rose-400 font-semibold">Price: ৳{m.price}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMovie(m.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: APPS */}
      {activeTab === 'apps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-400" /> Add Unlocked App
            </h3>
            <form onSubmit={handleAddApp} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">App Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Romel Video Editor VIP"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Price (Points ৳)</label>
                <input
                  type="number"
                  required
                  value={appPrice}
                  onChange={(e) => setAppPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Download Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/..."
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs"
              >
                Save App
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Premium Apps ({db.apps.length})</h3>
            <div className="space-y-2">
              {db.apps.map((a) => (
                <div
                  key={a.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{a.emoji || '💎'}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-100">{a.title}</div>
                      <div className="text-[11px] text-indigo-400 font-semibold">Cost: ৳{a.price}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteApp(a.id)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Registered Users Directory ({db.users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Country</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {db.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-mono text-slate-500">{u.id}</td>
                    <td className="p-3 font-bold text-slate-200">{u.name}</td>
                    <td className="p-3 text-slate-400">{u.email}</td>
                    <td className="p-3">{u.country || 'Bangladesh'}</td>
                    <td className="p-3 font-black text-amber-400">৳{(db.balances[u.id] || 0).toFixed(2)}</td>
                    <td className="p-3 text-slate-500 text-[11px]">{u.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: BROADCAST NOTIFICATION */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-400" /> Send Instant Live Notification
          </h3>
          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. 🎁 Weekend Promo Bonus Active!"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Type</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="info">Info / General</option>
                <option value="reward">Reward Alert</option>
                <option value="urgent">Urgent Notice</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Message Body</label>
              <textarea
                rows={3}
                required
                placeholder="Details of the announcement..."
                value={notifBody}
                onChange={(e) => setNotifBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Send className="w-4 h-4" /> Broadcast to All Online Users
            </button>
          </form>
        </div>
      )}

      {/* TAB 9: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-xl p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" /> Platform Configuration
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Marquee Broadcast Banner</label>
              <textarea
                rows={2}
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Promotion / Official bKash/Nagad Number</label>
              <input
                type="text"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Minimum Withdrawal Limit (৳)</label>
              <input
                type="number"
                value={minWithdraw}
                onChange={(e) => setMinWithdraw(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-black text-xs"
            >
              Save Global Configuration
            </button>
          </form>
        </div>
      )}

    </div>
  );
};