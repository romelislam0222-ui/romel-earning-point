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
  Edit2,
  MessageSquare,
  UserPlus,
  Film,
  Smartphone,
  Radio,
  LogOut
} from 'lucide-react';
import type { AppDatabaseState, TaskItem, EarnItem, MovieItem, AppItem, NotificationItem } from '../types';

interface ModeratorViewProps {
  db: AppDatabaseState;
  role: 'full' | 'sub';
  subModeratorId?: number | null;
  onUpdateDb: (newDb: AppDatabaseState) => void;
  onApproveProof: (id: number) => void;
  onRejectProof: (id: number, reason?: string) => void;
  onVerifyWithdrawal: (id: number) => void;
  onRejectWithdrawal: (id: number, reason?: string) => void;
  onBroadcastNotif: (notif: { title: string; body: string; type?: 'info' | 'reward' | 'urgent'; targetUserId?: number | 'all' }) => void;
  onAdjustBalance: (userId: number, amount: number) => void;
  onBulkAdjustBalance: (amount: number) => void;
  onApproveRegistration: (id: number) => void;
  onRejectRegistration: (id: number, reason?: string) => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
}

export const ModeratorView: React.FC<ModeratorViewProps> = ({
  db,
  role,
  subModeratorId,
  onUpdateDb,
  onApproveProof,
  onRejectProof,
  onVerifyWithdrawal,
  onRejectWithdrawal,
  onBroadcastNotif,
  onAdjustBalance,
  onBulkAdjustBalance,
  onApproveRegistration,
  onRejectRegistration,
  onLogout,
  onToast
}) => {
  const isFull = role === 'full';
  const [activeTab, setActiveTab] = useState<'submissions' | 'withdrawals' | 'tasks' | 'earns' | 'movies' | 'apps' | 'users' | 'broadcast' | 'settings' | 'support' | 'submods' | 'requests' | 'notices' | 'promocodes' | 'registrations' | 'supportgroups' | 'season2'>('submissions');

  // Balance top-up form (Full Moderator only)
  const [balanceDrafts, setBalanceDrafts] = useState<Record<number, string>>({});
  const [bulkBalanceAmount, setBulkBalanceAmount] = useState('');

  // Registration rejection reason drafts
  const [regRejectDrafts, setRegRejectDrafts] = useState<Record<number, string>>({});

  // Support Group form
  const [groupTitle, setGroupTitle] = useState('');
  const [groupUrl, setGroupUrl] = useState('');
  const [groupEmoji, setGroupEmoji] = useState('💬');

  // Season 2 task form
  const [s2Title, setS2Title] = useState('');
  const [s2Desc, setS2Desc] = useState('');
  const [s2Reward, setS2Reward] = useState('');
  const [s2Link, setS2Link] = useState('');

  // Support reply form
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});

  // Sub-moderator form
  const [subModName, setSubModName] = useState('');
  const [subModPass, setSubModPass] = useState('');

  // Notice form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');


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
  const [referralBonusInput, setReferralBonusInput] = useState(String(db.settings?.referralBonus ?? 25));
  const [regFeeEnabled, setRegFeeEnabled] = useState(db.settings?.registrationFeeEnabled ?? true);
  const [regPaymentNumber, setRegPaymentNumber] = useState(db.settings?.registrationPaymentNumber || '01334788303');
  const [regFeeBefore, setRegFeeBefore] = useState(String(db.settings?.registrationFeeBeforeDeadline ?? 100));
  const [regFeeAfter, setRegFeeAfter] = useState(String(db.settings?.registrationFeeAfterDeadline ?? 150));
  const [apkUrl, setApkUrl] = useState(db.settings?.apkDownloadUrl || '');
  const [season2Coming, setSeason2Coming] = useState(db.settings?.season2ComingSoon ?? true);

  // Promo Code form (Full Moderator only)
  const [promoCodeText, setPromoCodeText] = useState('');
  const [promoAmount, setPromoAmount] = useState('');
  const [promoMaxUses, setPromoMaxUses] = useState('1');

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
        minWithdrawal: Number(minWithdraw) || 700,
        referralBonus: isFull ? (Number(referralBonusInput) || 0) : (db.settings?.referralBonus ?? 25),
        registrationFeeEnabled: isFull ? regFeeEnabled : (db.settings?.registrationFeeEnabled ?? true),
        registrationPaymentNumber: isFull ? regPaymentNumber : (db.settings?.registrationPaymentNumber ?? '01334788303'),
        registrationFeeBeforeDeadline: isFull ? (Number(regFeeBefore) || 100) : (db.settings?.registrationFeeBeforeDeadline ?? 100),
        registrationFeeAfterDeadline: isFull ? (Number(regFeeAfter) || 150) : (db.settings?.registrationFeeAfterDeadline ?? 150),
        apkDownloadUrl: apkUrl,
        season2ComingSoon: season2Coming
      }
    };
    onUpdateDb(updated);
    onToast('⚙️ Platform settings saved successfully!');
  };

  const handleResetRegistrationTimer = () => {
    if (!isFull) return;
    const newDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    onUpdateDb({ ...db, settings: { ...db.settings, registrationDeadline: newDeadline } });
    onToast('⏱️ Registration countdown reset to 48 hours.');
  };

  const handleAddPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFull) {
      onToast('❌ Only the Main Moderator can create promo codes.');
      return;
    }
    const codeTrimmed = promoCodeText.trim().toUpperCase();
    const amountNum = Number(promoAmount);
    const maxUsesNum = Number(promoMaxUses);
    if (!codeTrimmed || !amountNum || amountNum <= 0) {
      onToast('❌ Enter a valid code and amount.');
      return;
    }
    const alreadyExists = (db.promoCodes || []).some(p => p.code.trim().toUpperCase() === codeTrimmed);
    if (alreadyExists) {
      onToast('❌ This promo code already exists.');
      return;
    }
    const newPromo = {
      id: Date.now(),
      code: codeTrimmed,
      amount: amountNum,
      maxUses: maxUsesNum > 0 ? maxUsesNum : 0,
      usedBy: [],
      active: true,
      createdAt: new Date().toLocaleString()
    };
    onUpdateDb({ ...db, promoCodes: [newPromo, ...(db.promoCodes || [])] });
    setPromoCodeText('');
    setPromoAmount('');
    setPromoMaxUses('1');
    onToast(`✅ Promo code "${codeTrimmed}" created.`);
  };

  const handleTogglePromoCode = (id: number) => {
    if (!isFull) return;
    const updated = (db.promoCodes || []).map(p => (p.id === id ? { ...p, active: !p.active } : p));
    onUpdateDb({ ...db, promoCodes: updated });
  };

  const handleDeletePromoCode = (id: number) => {
    if (!isFull) return;
    const updated = (db.promoCodes || []).filter(p => p.id !== id);
    onUpdateDb({ ...db, promoCodes: updated });
    onToast('🗑️ Promo code removed.');
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
              <p className="text-xs text-rose-300 font-semibold">
                {isFull ? 'Master Admin & Real-time Content Control' : 'Sub-Moderator Access'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
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
        {(isFull
          ? [
              { id: 'registrations', label: `Registrations (${(db.pendingRegistrations || []).filter(p => p.status === 'pending').length})` },
              { id: 'submissions', label: `Task Proofs (${pendingSubmissions.length})` },
              { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})` },
              { id: 'tasks', label: `Tasks (${db.tasks.length})` },
              { id: 'earns', label: `Daily Earns (${db.earns.length})` },
              { id: 'movies', label: `Movies (${db.movies.length})` },
              { id: 'apps', label: `Apps (${db.apps.length})` },
              { id: 'season2', label: `Season 2 (${(db.season2Tasks || []).length})` },
              { id: 'requests', label: `Requests (${(db.contentRequests || []).filter(r => r.status === 'pending').length})` },
              { id: 'support', label: `Help Desk (${(db.support || []).filter(s => !s.reply).length})` },
              { id: 'supportgroups', label: `Support Groups (${(db.supportGroups || []).length})` },
              { id: 'users', label: `Users (${db.users.length})` },
              { id: 'submods', label: `Sub-Moderators (${(db.subModerators || []).length})` },
              { id: 'promocodes', label: `Promo Codes (${(db.promoCodes || []).length})` },
              { id: 'notices', label: `Notices (${(db.notices || []).length})` },
              { id: 'broadcast', label: 'Broadcast Notif' },
              { id: 'settings', label: 'Global Settings' }
            ]
          : [
              { id: 'registrations', label: `Registrations (${(db.pendingRegistrations || []).filter(p => p.status === 'pending').length})` },
              { id: 'submissions', label: `Task Proofs (${pendingSubmissions.length})` },
              { id: 'withdrawals', label: `Withdrawals (${pendingWithdrawals.length})` },
              { id: 'tasks', label: `Tasks (${db.tasks.length})` },
              { id: 'earns', label: `Daily Earns (${db.earns.length})` },
              { id: 'movies', label: `Movies (${db.movies.length})` },
              { id: 'apps', label: `Apps (${db.apps.length})` },
              { id: 'season2', label: `Season 2 (${(db.season2Tasks || []).length})` },
              { id: 'requests', label: `Requests (${(db.contentRequests || []).filter(r => r.status === 'pending').length})` },
              { id: 'support', label: `Help Desk (${(db.support || []).filter(s => !s.reply).length})` },
              { id: 'supportgroups', label: `Support Groups (${(db.supportGroups || []).length})` },
              { id: 'users', label: `Users (${db.users.length})` },
              { id: 'notices', label: `Notices (${(db.notices || []).length})` },
              { id: 'broadcast', label: 'Broadcast Notif' },
              { id: 'settings', label: 'Global Settings' }
            ]
        ).map((t) => (
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
          {isFull && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <h3 className="text-sm font-black text-emerald-300 mb-1 flex items-center gap-2">
                <Coins className="w-4 h-4" /> Bulk Add Balance — All Users at Once
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Enter an amount to instantly add it to every registered user's wallet ({db.users.length} users). This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  placeholder="৳ Amount for every user"
                  value={bulkBalanceAmount}
                  onChange={(e) => setBulkBalanceAmount(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                />
                <button
                  onClick={() => {
                    const amount = parseFloat(bulkBalanceAmount);
                    if (!bulkBalanceAmount || isNaN(amount) || amount === 0) {
                      onToast('❌ Enter a valid amount.');
                      return;
                    }
                    if (!window.confirm(`Add ৳${amount} to ALL ${db.users.length} users? This cannot be undone.`)) return;
                    onBulkAdjustBalance(amount);
                    setBulkBalanceAmount('');
                    onToast(`✅ ৳${amount} added to all ${db.users.length} users!`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap"
                >
                  Add to Everyone
                </button>
              </div>
            </div>
          )}

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
                  {isFull && <th className="p-3">Add Balance</th>}
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
                    {isFull && (
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="৳ Amount"
                            value={balanceDrafts[u.id] ?? ''}
                            onChange={(e) => setBalanceDrafts(prev => ({ ...prev, [u.id]: e.target.value }))}
                            className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200"
                          />
                          <button
                            onClick={() => {
                              const raw = (balanceDrafts[u.id] ?? '').trim();
                              const amount = parseFloat(raw);
                              if (!raw || isNaN(amount) || amount === 0) {
                                onToast('❌ Enter a valid amount.');
                                return;
                              }
                              onAdjustBalance(u.id, amount);
                              setBalanceDrafts(prev => ({ ...prev, [u.id]: '' }));
                              onToast(`✅ ৳${amount.toFixed(2)} added to ${u.name}'s balance.`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] whitespace-nowrap flex items-center gap-1"
                          >
                            <Coins className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isFull && (
            <p className="text-[11px] text-slate-500 italic">
              Only the Main Moderator can add balance to a user's account.
            </p>
          )}
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

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Referral Bonus Amount (৳ per invited friend)</label>
              {isFull ? (
                <input
                  type="number"
                  value={referralBonusInput}
                  onChange={(e) => setReferralBonusInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
              ) : (
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500">
                  ৳{db.settings?.referralBonus ?? 25} <span className="italic">(Only the Main Moderator can change this)</span>
                </div>
              )}
            </div>

            {isFull && (
              <>
                <div className="pt-3 border-t border-slate-800">
                  <h4 className="text-xs font-black text-amber-400 mb-3">রেজিস্ট্রেশন পেমেন্ট গেট</h4>

                  <label className="flex items-center gap-2 mb-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regFeeEnabled}
                      onChange={(e) => setRegFeeEnabled(e.target.checked)}
                      className="w-4 h-4 accent-amber-500"
                    />
                    রেজিস্ট্রেশন ফি চালু রাখুন (বন্ধ করলে সবাই ফ্রি রেজিস্টার করতে পারবে)
                  </label>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">bKash Receiving Number</label>
                      <input
                        type="text"
                        value={regPaymentNumber}
                        onChange={(e) => setRegPaymentNumber(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">সময়সীমার আগে ফি (৳)</label>
                        <input
                          type="number"
                          value={regFeeBefore}
                          onChange={(e) => setRegFeeBefore(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">সময়সীমার পরে ফি (৳)</label>
                        <input
                          type="number"
                          value={regFeeAfter}
                          onChange={(e) => setRegFeeAfter(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetRegistrationTimer}
                      className="w-full py-2 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 text-fuchsia-400 font-bold text-xs border border-fuchsia-500/30"
                    >
                      ⏱️ ৪৮ ঘণ্টার কাউন্টডাউন আবার শুরু করুন
                    </button>
                    <p className="text-[10px] text-slate-500">
                      কাউন্টডাউন এখন যেখানে আছে: {db.settings?.registrationDeadline ? new Date(db.settings.registrationDeadline).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">APK ডাউনলোড লিংক</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={apkUrl}
                    onChange={(e) => setApkUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">হেডারের "Download App" বাটন এই লিংকে নিয়ে যাবে।</p>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-black text-xs"
            >
              Save Global Configuration
            </button>
          </form>
        </div>
      )}

      {/* TAB: HELP DESK / SUPPORT TICKETS */}
      {activeTab === 'support' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" /> User Support Tickets
          </h3>
          {(db.support || []).length === 0 ? (
            <p className="text-xs text-slate-500">No support tickets yet.</p>
          ) : (
            <div className="space-y-3">
              {db.support.map((ticket) => (
                <div key={ticket.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-100">{ticket.userName || `User #${ticket.userId}`}</span>
                    <span className="text-[10px] text-slate-500">{ticket.date}</span>
                  </div>
                  <p className="text-xs text-slate-300">{ticket.message}</p>

                  {ticket.reply && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="text-[10px] font-black text-emerald-400 mb-0.5">
                        Replied {ticket.repliedBy ? `by ${ticket.repliedBy}` : ''}
                      </div>
                      <div className="text-xs text-slate-200">{ticket.reply}</div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder={ticket.reply ? 'Update reply...' : 'Write a reply...'}
                      value={replyDrafts[ticket.id] ?? ''}
                      onChange={(e) => setReplyDrafts(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                    <button
                      onClick={() => {
                        const replyText = (replyDrafts[ticket.id] ?? '').trim();
                        if (!replyText) return;
                        const updatedSupport = db.support.map(s =>
                          s.id === ticket.id
                            ? { ...s, reply: replyText, repliedBy: isFull ? 'Moderator' : 'Sub-Moderator', status: 'replied' as const }
                            : s
                        );
                        onUpdateDb({ ...db, support: updatedSupport });
                        setReplyDrafts(prev => ({ ...prev, [ticket.id]: '' }));
                        onToast('✅ Reply sent to user.');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" /> Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CONTENT REQUESTS (movies/apps users asked for) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Film className="w-4 h-4 text-purple-400" /> Movie & App Requests
          </h3>
          {(db.contentRequests || []).length === 0 ? (
            <p className="text-xs text-slate-500">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {(db.contentRequests || []).map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {req.type === 'movie' ? (
                        <Film className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span className="text-xs font-bold text-slate-100">{req.userName || `User #${req.userId}`}</span>
                      <span className="text-[10px] text-slate-500">{req.date}</span>
                    </div>
                    <p className="text-xs text-slate-300">{req.message}</p>
                    <span
                      className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'fulfilled'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {req.status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                    </span>
                  </div>
                  {req.status !== 'fulfilled' && (
                    <button
                      onClick={() => {
                        const updated = (db.contentRequests || []).map(r =>
                          r.id === req.id ? { ...r, status: 'fulfilled' as const } : r
                        );
                        onUpdateDb({ ...db, contentRequests: updated });
                        onToast('✅ Marked as fulfilled.');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] whitespace-nowrap"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SUB-MODERATORS (full moderator only) */}
      {activeTab === 'submods' && isFull && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" /> Add New Sub-Moderator
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Sub-Moderators can only manage Tasks, reply to Help Desk messages, and view content requests. They cannot access withdrawals, users, settings, or broadcast.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!subModName.trim() || !subModPass.trim()) return;
                const newSubMod = {
                  id: Date.now(),
                  name: subModName.trim(),
                  pass: subModPass.trim(),
                  createdAt: new Date().toLocaleString(),
                  active: true
                };
                onUpdateDb({ ...db, subModerators: [...(db.subModerators || []), newSubMod] });
                setSubModName('');
                setSubModPass('');
                onToast('✅ Sub-Moderator added.');
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                required
                placeholder="Sub-Moderator Name"
                value={subModName}
                onChange={(e) => setSubModName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <input
                type="text"
                required
                placeholder="Secret Code / Password"
                value={subModPass}
                onChange={(e) => setSubModPass(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs whitespace-nowrap"
              >
                Add Sub-Moderator
              </button>
            </form>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Current Sub-Moderators ({(db.subModerators || []).length})</h3>
            {(db.subModerators || []).length === 0 ? (
              <p className="text-xs text-slate-500">No sub-moderators added yet.</p>
            ) : (
              (db.subModerators || []).map((sm) => (
                <div key={sm.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-100">{sm.name}</div>
                    <div className="text-[10px] text-slate-500">Added {sm.createdAt}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sm.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {sm.active ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => {
                        const updated = (db.subModerators || []).map(x =>
                          x.id === sm.id ? { ...x, active: !x.active } : x
                        );
                        onUpdateDb({ ...db, subModerators: updated });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold"
                    >
                      {sm.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        const updated = (db.subModerators || []).filter(x => x.id !== sm.id);
                        onUpdateDb({ ...db, subModerators: updated });
                        onToast('🗑️ Sub-Moderator removed.');
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: PROMO CODES (full moderator only — controls money added to the system) */}
      {activeTab === 'promocodes' && isFull && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-fuchsia-400" /> Create New Promo Code
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Users can redeem this code once from their Wallet tab to instantly receive bonus balance. Only the Main Moderator can create or remove promo codes.
            </p>
            <form onSubmit={handleAddPromoCode} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="CODE (e.g. WELCOME50)"
                value={promoCodeText}
                onChange={(e) => setPromoCodeText(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-mono uppercase"
              />
              <input
                type="number"
                required
                placeholder="৳ Amount"
                value={promoAmount}
                onChange={(e) => setPromoAmount(e.target.value)}
                className="w-full sm:w-28 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <input
                type="number"
                placeholder="Max Uses (0 = unlimited)"
                value={promoMaxUses}
                onChange={(e) => setPromoMaxUses(e.target.value)}
                className="w-full sm:w-40 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-xs whitespace-nowrap"
              >
                Create Code
              </button>
            </form>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Existing Promo Codes ({(db.promoCodes || []).length})</h3>
            {(db.promoCodes || []).length === 0 ? (
              <p className="text-xs text-slate-500">No promo codes created yet.</p>
            ) : (
              (db.promoCodes || []).map((pc) => (
                <div key={pc.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-black text-fuchsia-300">{pc.code}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ৳{pc.amount} • Used {(pc.usedBy || []).length}{pc.maxUses > 0 ? ` / ${pc.maxUses}` : ' (unlimited uses)'} • Created {pc.createdAt}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pc.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {pc.active ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => handleTogglePromoCode(pc.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold"
                    >
                      {pc.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => handleDeletePromoCode(pc.id)}
                      className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: REGISTRATIONS — Manual payment verification (Both Main & Sub Moderator) */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200">
            Pending Registrations ({(db.pendingRegistrations || []).filter(p => p.status === 'pending').length})
          </h3>
          <p className="text-[11px] text-slate-500">
            চেক করে দেখুন bKash অ্যাপে টাকা এসেছে কিনা এবং Transaction ID মিলছে কিনা, তারপর Approve বা Reject করুন।
          </p>
          {(db.pendingRegistrations || []).filter(p => p.status === 'pending').length === 0 ? (
            <p className="text-xs text-slate-500">কোনো পেন্ডিং রেজিস্ট্রেশন নেই।</p>
          ) : (
            (db.pendingRegistrations || [])
              .filter(p => p.status === 'pending')
              .map((reg) => (
                <div key={reg.id} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <div className="text-slate-500">Name</div>
                      <div className="text-slate-200 font-bold">{reg.name}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Email</div>
                      <div className="text-slate-200 font-bold truncate">{reg.email}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">bKash Number</div>
                      <div className="text-slate-200 font-mono font-bold">{reg.bkashNumber || '—'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Amount</div>
                      <div className="text-amber-400 font-black">৳{reg.amountPaid}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-slate-950 rounded-xl px-3 py-2 border border-slate-800">
                    <span className="text-[11px] text-slate-400">TrxID:</span>
                    <span className="text-xs font-mono font-black text-slate-100">{reg.trxId}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Submitted: {reg.date}</div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      onClick={() => onApproveRegistration(reg.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Rejection reason..."
                        value={regRejectDrafts[reg.id] ?? ''}
                        onChange={(e) => setRegRejectDrafts(prev => ({ ...prev, [reg.id]: e.target.value }))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-[11px] text-slate-200"
                      />
                      <button
                        onClick={() => {
                          onRejectRegistration(reg.id, regRejectDrafts[reg.id] || 'Payment could not be verified');
                          setRegRejectDrafts(prev => ({ ...prev, [reg.id]: '' }));
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs whitespace-nowrap flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}

          {(db.pendingRegistrations || []).filter(p => p.status !== 'pending').length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-400 mb-2">সাম্প্রতিক ইতিহাস</h4>
              <div className="space-y-1.5">
                {(db.pendingRegistrations || [])
                  .filter(p => p.status !== 'pending')
                  .slice(0, 15)
                  .map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 text-[11px]">
                      <span className="text-slate-300">{reg.name} ({reg.email})</span>
                      <span className={reg.status === 'approved' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {reg.status === 'approved' ? 'Approved ✓' : 'Rejected ✕'}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: SUPPORT GROUPS management */}
      {activeTab === 'supportgroups' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3">নতুন সাপোর্ট গ্রুপ যোগ করুন</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!groupTitle.trim() || !groupUrl.trim()) {
                  onToast('❌ Title ও Link দুটোই দিতে হবে।');
                  return;
                }
                const newGroup = {
                  id: Date.now(),
                  title: groupTitle.trim(),
                  url: groupUrl.trim(),
                  emoji: groupEmoji.trim() || '💬',
                  active: true,
                  createdAt: new Date().toLocaleString()
                };
                onUpdateDb({ ...db, supportGroups: [newGroup, ...(db.supportGroups || [])] });
                setGroupTitle('');
                setGroupUrl('');
                setGroupEmoji('💬');
                onToast('✅ Support group যোগ হয়েছে।');
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                placeholder="Emoji"
                value={groupEmoji}
                onChange={(e) => setGroupEmoji(e.target.value)}
                className="w-full sm:w-16 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 text-center"
              />
              <input
                type="text"
                placeholder="Group Title (e.g. Official Telegram)"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <input
                type="text"
                placeholder="https://..."
                value={groupUrl}
                onChange={(e) => setGroupUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs whitespace-nowrap">
                Add Group
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {(db.supportGroups || []).length === 0 ? (
              <p className="text-xs text-slate-500">এখনো কোনো সাপোর্ট গ্রুপ যোগ করা হয়নি।</p>
            ) : (
              (db.supportGroups || []).map((g) => (
                <div key={g.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{g.emoji || '💬'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-100 truncate">{g.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{g.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${g.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {g.active ? 'Active' : 'Hidden'}
                    </span>
                    <button
                      onClick={() => {
                        const updated = (db.supportGroups || []).map(x => x.id === g.id ? { ...x, active: !x.active } : x);
                        onUpdateDb({ ...db, supportGroups: updated });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold"
                    >
                      {g.active ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => {
                        const updated = (db.supportGroups || []).filter(x => x.id !== g.id);
                        onUpdateDb({ ...db, supportGroups: updated });
                        onToast('🗑️ Group removed.');
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: SEASON 2 management */}
      {activeTab === 'season2' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-fuchsia-300">Season 2 — "Coming Soon" মোড</h3>
              <p className="text-[11px] text-slate-400 mt-1">অন রাখলে ইউজাররা শুধু "Coming Soon" দেখবে, অফ করলে নিচের টাস্কগুলো দেখতে পাবে।</p>
            </div>
            <button
              onClick={() => {
                const newVal = !season2Coming;
                setSeason2Coming(newVal);
                onUpdateDb({ ...db, settings: { ...db.settings, season2ComingSoon: newVal } });
                onToast(newVal ? '🔒 Season 2 আবার "Coming Soon" করা হলো।' : '🚀 Season 2 চালু হয়ে গেছে!');
              }}
              className={`px-4 py-2 rounded-xl font-black text-xs whitespace-nowrap ${
                season2Coming ? 'bg-slate-800 text-slate-300' : 'bg-fuchsia-500 text-white'
              }`}
            >
              {season2Coming ? 'Coming Soon চালু আছে' : 'লাইভ আছে'}
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3">নতুন Season 2 টাস্ক যোগ করুন</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const rewardNum = Number(s2Reward);
                if (!s2Title.trim() || !s2Desc.trim() || !rewardNum) {
                  onToast('❌ Title, Description ও Reward দিতে হবে।');
                  return;
                }
                const newTask = {
                  id: Date.now(),
                  title: s2Title.trim(),
                  desc: s2Desc.trim(),
                  reward: rewardNum,
                  status: 'active' as const,
                  link: s2Link.trim() || undefined,
                  createdAt: new Date().toLocaleString()
                };
                onUpdateDb({ ...db, season2Tasks: [newTask, ...(db.season2Tasks || [])] });
                setS2Title('');
                setS2Desc('');
                setS2Reward('');
                setS2Link('');
                onToast('✅ Season 2 টাস্ক যোগ হয়েছে।');
              }}
              className="space-y-2.5"
            >
              <input
                type="text"
                placeholder="Task Title"
                value={s2Title}
                onChange={(e) => setS2Title(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <textarea
                placeholder="Task Description"
                value={s2Desc}
                onChange={(e) => setS2Desc(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="৳ Reward"
                  value={s2Reward}
                  onChange={(e) => setS2Reward(e.target.value)}
                  className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                />
                <input
                  type="text"
                  placeholder="Task Link (optional)"
                  value={s2Link}
                  onChange={(e) => setS2Link(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
                />
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-xs">
                Add Season 2 Task
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {(db.season2Tasks || []).length === 0 ? (
              <p className="text-xs text-slate-500">এখনো কোনো Season 2 টাস্ক যোগ করা হয়নি।</p>
            ) : (
              (db.season2Tasks || []).map((t) => (
                <div key={t.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-100 truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-500">৳{t.reward} • {t.status}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        const updated = (db.season2Tasks || []).map(x => x.id === t.id ? { ...x, status: (x.status === 'active' ? 'paused' : 'active') as 'active' | 'paused' } : x);
                        onUpdateDb({ ...db, season2Tasks: updated });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold"
                    >
                      {t.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {
                        const updated = (db.season2Tasks || []).filter(x => x.id !== t.id);
                        onUpdateDb({ ...db, season2Tasks: updated });
                        onToast('🗑️ Task removed.');
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: DASHBOARD NOTICES (full moderator only) */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" /> Post a Dashboard Notice
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              This notice will show on every user's dashboard, on top of every tab.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noticeTitle.trim() || !noticeMessage.trim()) return;
                const newNotice = {
                  id: Date.now(),
                  title: noticeTitle.trim(),
                  message: noticeMessage.trim(),
                  date: new Date().toLocaleString()
                };
                onUpdateDb({ ...db, notices: [newNotice, ...(db.notices || [])] });
                setNoticeTitle('');
                setNoticeMessage('');
                onToast('📢 Notice posted to all users.');
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                placeholder="Notice Title"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200"
              />
              <textarea
                required
                rows={3}
                placeholder="Notice message..."
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs"
              >
                Post Notice
              </button>
            </form>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200">Posted Notices ({(db.notices || []).length})</h3>
            {(db.notices || []).length === 0 ? (
              <p className="text-xs text-slate-500">No notices posted yet.</p>
            ) : (
              (db.notices || []).map((n) => (
                <div key={n.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-100">{n.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{n.date}</div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = (db.notices || []).filter(x => x.id !== n.id);
                      onUpdateDb({ ...db, notices: updated });
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};