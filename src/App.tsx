import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Coins, 
  Film, 
  Smartphone, 
  Wallet, 
  Share2, 
  HelpCircle, 
  Shield, 
  Bell, 
  Download, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  TrendingUp, 
  Users, 
  Globe, 
  LogOut, 
  Radio, 
  Send,
  MessageSquare,
  Gift,
  Search,
  Lock,
  Unlock,
  AlertCircle,
  UserCheck,
  Copy,
  XCircle
} from 'lucide-react';
import type { 
  AppDatabaseState, 
  User, 
  TaskItem, 
  EarnItem, 
  MovieItem, 
  AppItem, 
  SubmissionItem, 
  WithdrawalItem, 
  NotificationItem, 
  WSMessage 
} from './types';
import { COUNTRIES, COUNTRY_FLAGS, LANGUAGES, PROMOTION_CATEGORIES } from './constants';
import { ModeratorView } from './components/ModeratorView';
import { BroadcastBanner } from './components/BroadcastBanner';
import { NotificationModal } from './components/NotificationModal';
import { DownloadModal } from './components/DownloadModal';
import { OnboardingFlow } from './components/OnboardingFlow';

const initialAppState: AppDatabaseState = {
  users: [],
  balances: {},
  transactions: {},
  tasks: [],
  earns: [],
  movies: [],
  apps: [],
  submissions: [],
  withdrawals: [],
  promotions: [],
  support: [],
  subModerators: [],
  contentRequests: [],
  notices: [],
  promoCodes: [],
  pendingRegistrations: [],
  supportGroups: [],
  season2Tasks: [],
  unlockedMovies: {},
  unlockedApps: {},
  referrals: {},
  notifications: [],
  settings: {
    compact: false,
    autosave: true,
    broadcastBanner: '📢 Welcome to ROMEL EARNING POINT!',
    bannerActive: true,
    promotionPaymentNumber: '01334788303',
    minWithdrawal: 700,
    referralBonus: 25,
    registrationFeeEnabled: true,
    registrationPaymentNumber: '01334788303',
    registrationFeeBeforeDeadline: 100,
    registrationFeeAfterDeadline: 150,
    registrationDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    season2ComingSoon: true,
    apkDownloadUrl: ''
  }
};

export default function App() {
  const [db, setDb] = useState<AppDatabaseState>(initialAppState);
  const [activeTab, setActiveTab] = useState<'tasks' | 'earn' | 'movies' | 'apps' | 'wallet' | 'promotion' | 'support' | 'moderator' | 'updates' | 'season2' | 'supportgroups'>('tasks');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [pendingRegistrationId, setPendingRegistrationId] = useState<number | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [modPassword, setModPassword] = useState('');
  const [modNameInput, setModNameInput] = useState('');
  const [moderatorRole, setModeratorRole] = useState<'full' | 'sub' | null>(null);
  const [subModeratorId, setSubModeratorId] = useState<number | null>(null);
  const [showModLogin, setShowModLogin] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Modals
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter & Form States
  const [taskFilter, setTaskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForProof, setSelectedTaskForProof] = useState<TaskItem | null>(null);
  const [selectedEarnForProof, setSelectedEarnForProof] = useState<EarnItem | null>(null);
  const [proofInput, setProofInput] = useState('');

  // Wallet form
  const [withdrawMethod, setWithdrawMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('700');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  // Promotion form
  const [promoCategory, setPromoCategory] = useState(PROMOTION_CATEGORIES[0]);
  const [promoLink, setPromoLink] = useState('');
  const [promoDetails, setPromoDetails] = useState('');
  const [promoTxn, setPromoTxn] = useState('');

  // Support form
  const [supportMessage, setSupportMessage] = useState('');

  // Content request forms
  const [movieRequestText, setMovieRequestText] = useState('');
  const [appRequestText, setAppRequestText] = useState('');

  // Promo code redemption
  const [promoCodeInput, setPromoCodeInput] = useState('');

  const wsRef = useRef<WebSocket | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Connect WebSocket & REST fallback
  useEffect(() => {
    // Initial REST state fetch
    fetch('/api/state')
      .then(res => res.json())
      .then(json => {
        if (json.ok && json.data) {
          setDb(json.data);
          if (json.onlineCount) setOnlineCount(json.onlineCount);
        }
      })
      .catch(err => console.error('REST init error:', err));

    // Connect WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        if (msg.type === 'INIT_STATE') {
          setDb(msg.payload);
          if (msg.onlineCount) setOnlineCount(msg.onlineCount);
        } else if (msg.type === 'STATE_UPDATE') {
          setDb(prev => ({ ...prev, ...msg.payload }));
          if (msg.onlineCount) setOnlineCount(msg.onlineCount);
        } else if (msg.type === 'ONLINE_COUNT') {
          setOnlineCount(msg.count);
        } else if (msg.type === 'NOTIFICATION_BROADCAST') {
          const n = msg.payload;
          if (n.targetUserId === 'all' || n.targetUserId === currentUser?.id) {
            showToast(`🔔 ${n.title}: ${n.body}`);
          }
        } else if (msg.type === 'REGISTRATION_SUBMITTED') {
          const id = msg.payload.id;
          setPendingRegistrationId(id);
          localStorage.setItem('romel_pending_registration', String(id));
          setShowOnboarding(false);
        }
      } catch (err) {
        console.error('WS Parse Error:', err);
      }
    };

    socket.onclose = () => {
      setWsConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [currentUser?.id]);

  // Handle local user session
  useEffect(() => {
    const savedUser = localStorage.getItem('romel_user');
    const savedPendingReg = localStorage.getItem('romel_pending_registration');

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        if (savedPendingReg) {
          setPendingRegistrationId(Number(savedPendingReg));
        } else {
          setShowOnboarding(true);
        }
      }
    } else if (savedPendingReg) {
      setPendingRegistrationId(Number(savedPendingReg));
    } else {
      setShowOnboarding(true);
    }

    // Restore a previously logged-in Moderator / Sub-Moderator session
    // so they don't have to re-enter their password after closing the app.
    const savedMod = localStorage.getItem('romel_moderator_session');
    if (savedMod) {
      try {
        const parsed = JSON.parse(savedMod);
        if (parsed && (parsed.role === 'full' || parsed.role === 'sub')) {
          setIsModerator(true);
          setModeratorRole(parsed.role);
          setSubModeratorId(parsed.subModeratorId ?? null);
        }
      } catch (e) {
        localStorage.removeItem('romel_moderator_session');
      }
    }
  }, []);

  // If a restored Sub-Moderator session's account was later disabled or
  // removed by the Main Moderator, revoke access automatically.
  useEffect(() => {
    if (isModerator && moderatorRole === 'sub' && subModeratorId != null && db.subModerators) {
      const stillValid = db.subModerators.some(sm => sm.id === subModeratorId && sm.active);
      if (!stillValid) {
        setIsModerator(false);
        setModeratorRole(null);
        setSubModeratorId(null);
        localStorage.removeItem('romel_moderator_session');
        showToast('❌ Your Sub-Moderator access has been revoked.');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.subModerators]);

  // Ask for browser notification permission once the Moderator opens the panel,
  // so they can get an instant alert when a new registration payment comes in.
  useEffect(() => {
    if (isModerator && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, [isModerator]);

  // Fire a native browser notification to the Moderator whenever a brand-new
  // pending registration arrives (best-effort — only works while this tab/app is open).
  const prevPendingRegCount = useRef<number>(0);
  useEffect(() => {
    const pendingCount = (db.pendingRegistrations || []).filter(p => p.status === 'pending').length;
    if (isModerator && pendingCount > prevPendingRegCount.current) {
      const latest = (db.pendingRegistrations || []).find(p => p.status === 'pending');
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('💰 New Registration Payment!', {
            body: latest ? `${latest.name} sent ৳${latest.amountPaid} — verify their TrxID now.` : 'A new registration is waiting for approval.'
          });
        } catch (e) {
          /* ignore */
        }
      }
      showToast('🔔 New registration payment received — check the Registrations tab!');
    }
    prevPendingRegCount.current = pendingCount;
  }, [db.pendingRegistrations, isModerator]);

  const handleModeratorLogout = () => {
    setIsModerator(false);
    setModeratorRole(null);
    setSubModeratorId(null);
    setActiveTab('tasks');
    localStorage.removeItem('romel_moderator_session');
    showToast('👋 Logged out of Moderator panel.');
  };

  // Watch the tracked pending registration for approval / rejection.
  useEffect(() => {
    if (pendingRegistrationId == null) return;
    const entry = (db.pendingRegistrations || []).find(p => p.id === pendingRegistrationId);
    if (!entry) return;

    if (entry.status === 'approved') {
      const matchedUser = db.users.find(u => u.email.toLowerCase() === entry.email.toLowerCase());
      if (matchedUser) {
        setCurrentUser(matchedUser);
        localStorage.setItem('romel_user', JSON.stringify(matchedUser));
        localStorage.removeItem('romel_pending_registration');
        setPendingRegistrationId(null);
        showToast('✅ Payment verified! Welcome to ROMEL EARNING POINT 🎉');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.pendingRegistrations, db.users]);

  const handleCancelPendingRegistration = () => {
    setPendingRegistrationId(null);
    localStorage.removeItem('romel_pending_registration');
    setShowOnboarding(true);
  };

  const sendAction = (action: string, data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'CLIENT_ACTION',
        action,
        data,
        userId: currentUser?.id || null,
        isModerator
      }));
    } else {
      // Fallback to REST API
      fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data, userId: currentUser?.id, isModerator })
      }).catch(err => console.error('API Action Error:', err));
    }
  };

  const handleOnboardingComplete = (userData: {
    name: string;
    email: string;
    pass: string;
    country: string;
    language: string;
    referralId?: string;
    bkashNumber?: string;
    trxId?: string;
    amountPaid?: number;
    bypassCode?: string;
  }) => {
    // Prevent duplicate signups with an email already registered.
    const emailTaken = db.users.some(u => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (emailTaken) {
      showToast('❌ This email is already registered. Please log in instead.');
      return;
    }

    sendAction('SUBMIT_REGISTRATION', {
      ...userData,
      email: userData.email.trim(),
      bkashNumber: (userData.bkashNumber || '').trim(),
      trxId: (userData.trxId || '').trim(),
      bypassCode: (userData.bypassCode || '').trim()
    });

    setShowOnboarding(false);
    showToast('📨 Registration submitted! Waiting for verification...');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrimmed = loginEmail.trim().toLowerCase();
    const matched = db.users.find(
      u => u.email.toLowerCase() === emailTrimmed && u.pass === loginPass
    );
    if (!matched) {
      showToast('❌ Incorrect email or password.');
      return;
    }
    setCurrentUser(matched);
    localStorage.setItem('romel_user', JSON.stringify(matched));
    setShowLoginForm(false);
    setShowOnboarding(false);
    setLoginEmail('');
    setLoginPass('');
    showToast(`👋 Welcome back, ${matched.name}!`);
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('romel_user');
    setShowProfileMenu(false);
    setShowOnboarding(true);
    showToast('👋 You have been logged out.');
  };

  // Registration fee live status, based on the moderator-configured deadline.
  const getRegistrationFeeStatus = () => {
    const deadlineStr = db.settings?.registrationDeadline;
    const before = db.settings?.registrationFeeBeforeDeadline ?? 100;
    const after = db.settings?.registrationFeeAfterDeadline ?? 150;
    if (!deadlineStr) return { amount: after, msLeft: 0, expired: true };
    const deadline = new Date(deadlineStr).getTime();
    const msLeft = deadline - Date.now();
    if (msLeft <= 0) return { amount: after, msLeft: 0, expired: true };
    return { amount: before, msLeft, expired: false };
  };

  const handleContentRequest = (type: 'movie' | 'app') => {
    const text = type === 'movie' ? movieRequestText : appRequestText;
    if (!text.trim() || !currentUser) return;
    const newRequest = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      type,
      message: text.trim(),
      status: 'pending' as const,
      date: new Date().toLocaleString()
    };
    const updated = [newRequest, ...(db.contentRequests || [])];
    setDb(prev => ({ ...prev, contentRequests: updated }));
    sendAction('SAVE_MODERATOR_DB', { db: { contentRequests: updated } });
    if (type === 'movie') setMovieRequestText('');
    else setAppRequestText('');
    showToast('✅ Your request has been sent to the Moderator team.');
  };

  const handleRedeemPromoCode = () => {
    if (!currentUser) return;
    const code = promoCodeInput.trim();
    if (!code) {
      showToast('❌ Please enter a promo code.');
      return;
    }
    const promo = (db.promoCodes || []).find(
      p => p.code.trim().toLowerCase() === code.toLowerCase()
    );
    if (!promo) {
      showToast('❌ Invalid promo code.');
      return;
    }
    if (!promo.active) {
      showToast('❌ This promo code is no longer active.');
      return;
    }
    if ((promo.usedBy || []).includes(currentUser.id)) {
      showToast('❌ You have already used this promo code.');
      return;
    }
    if (promo.maxUses > 0 && (promo.usedBy || []).length >= promo.maxUses) {
      showToast('❌ This promo code has reached its usage limit.');
      return;
    }

    const newBal = (db.balances[currentUser.id] || 0) + promo.amount;
    const newTxn = {
      id: Date.now(),
      amount: promo.amount,
      type: 'PROMO_CODE',
      note: `Promo code redeemed: ${promo.code}`,
      date: new Date().toLocaleString()
    };
    const updatedPromoCodes = db.promoCodes.map(p =>
      p.id === promo.id ? { ...p, usedBy: [...(p.usedBy || []), currentUser.id] } : p
    );
    const newDb = {
      ...db,
      balances: { ...db.balances, [currentUser.id]: newBal },
      transactions: {
        ...db.transactions,
        [currentUser.id]: [newTxn, ...(db.transactions[currentUser.id] || [])]
      },
      promoCodes: updatedPromoCodes
    };
    setDb(newDb);
    sendAction('SAVE_MODERATOR_DB', { db: newDb });
    setPromoCodeInput('');
    showToast(`🎁 Promo code applied! ৳${promo.amount} added to your balance.`);
  };

  // Only the Main (Full) Moderator is allowed to top-up a user's balance.
  const handleAdjustBalance = (userId: number, amount: number) => {
    if (moderatorRole !== 'full') {
      showToast('❌ Only the Main Moderator can add balance.');
      return;
    }
    const currentBal = db.balances[userId] || 0;
    const newBal = currentBal + amount;
    const newTxn = {
      id: Date.now(),
      amount,
      type: 'MODERATOR_TOPUP',
      note: 'Balance added by Main Moderator',
      date: new Date().toLocaleString()
    };
    const newDb = {
      ...db,
      balances: { ...db.balances, [userId]: newBal },
      transactions: {
        ...db.transactions,
        [userId]: [newTxn, ...(db.transactions[userId] || [])]
      }
    };
    setDb(newDb);
    sendAction('SAVE_MODERATOR_DB', { db: newDb });
  };

  // Bulk add balance to every registered user at once (Main Moderator only)
  const handleBulkAdjustBalance = (amount: number) => {
    if (moderatorRole !== 'full') {
      showToast('❌ Only the Main Moderator can add balance.');
      return;
    }
    const nowStr = new Date().toLocaleString();
    const newBalances = { ...db.balances };
    const newTransactions = { ...db.transactions };
    db.users.forEach((u) => {
      newBalances[u.id] = (newBalances[u.id] || 0) + amount;
      const newTxn = {
        id: Date.now() + u.id,
        amount,
        type: 'MODERATOR_BULK_TOPUP',
        note: 'Bulk balance added by Main Moderator',
        date: nowStr
      };
      newTransactions[u.id] = [newTxn, ...(newTransactions[u.id] || [])];
    });
    const newDb = { ...db, balances: newBalances, transactions: newTransactions };
    setDb(newDb);
    sendAction('SAVE_MODERATOR_DB', { db: newDb });
  };

  const handleApproveRegistration = (id: number) => {
    sendAction('APPROVE_REGISTRATION', { id });
  };

  const handleRejectRegistration = (id: number, reason?: string) => {
    sendAction('REJECT_REGISTRATION', { id, reason });
  };

  const handleModeratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (modPassword === '01334788303') {
      setIsModerator(true);
      setModeratorRole('full');
      setSubModeratorId(null);
      setShowModLogin(false);
      setActiveTab('moderator');
      localStorage.setItem('romel_moderator_session', JSON.stringify({ role: 'full', subModeratorId: null }));
      showToast('⚡ Welcome Moderator! Full control unlocked.');
      return;
    }
    const subMod = (db.subModerators || []).find(
      sm => sm.active && sm.name.trim().toLowerCase() === modNameInput.trim().toLowerCase() && sm.pass === modPassword
    );
    if (subMod) {
      setIsModerator(true);
      setModeratorRole('sub');
      setSubModeratorId(subMod.id);
      setShowModLogin(false);
      setActiveTab('moderator');
      localStorage.setItem('romel_moderator_session', JSON.stringify({ role: 'sub', subModeratorId: subMod.id }));
      showToast(`⚡ Welcome ${subMod.name}! Sub-Moderator access unlocked.`);
    } else {
      showToast('❌ Incorrect Moderator Name or Secret Code');
    }
  };

  const currentBalance = currentUser ? (db.balances[currentUser.id] || 0) : 0;
  const userTransactions = currentUser ? (db.transactions[currentUser.id] || []) : [];
  const userSubmissions = currentUser ? db.submissions.filter(s => s.userId === currentUser.id) : [];
  const userWithdrawals = currentUser ? db.withdrawals.filter(w => w.userId === currentUser.id) : [];

  // Submit proof for Task
  const handleTaskProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedTaskForProof || !proofInput) return;

    sendAction('SUBMIT_TASK_PROOF', {
      userId: currentUser.id,
      userName: currentUser.name,
      taskId: selectedTaskForProof.id,
      task: selectedTaskForProof.title,
      reward: selectedTaskForProof.reward,
      proof: proofInput,
      kind: 'task'
    });

    showToast('✅ Task proof submitted! Pending moderator review.');
    setSelectedTaskForProof(null);
    setProofInput('');
  };

  // Submit proof for Earn
  const handleEarnProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedEarnForProof || !proofInput) return;

    const todaysAttempts = userSubmissions.filter(
      s => s.kind === 'earn' &&
        s.earnId === selectedEarnForProof.id &&
        new Date(s.date).toDateString() === new Date().toDateString()
    ).length;
    if (todaysAttempts >= 2) {
      showToast('❌ You can only complete this task up to 2 times per day. Try again tomorrow!');
      return;
    }

    sendAction('SUBMIT_TASK_PROOF', {
      userId: currentUser.id,
      userName: currentUser.name,
      earnId: selectedEarnForProof.id,
      task: selectedEarnForProof.title,
      reward: selectedEarnForProof.reward,
      proof: proofInput,
      kind: 'earn'
    });

    showToast('✅ Daily earn submitted for verification!');
    setSelectedEarnForProof(null);
    setProofInput('');
  };

  // Submit Withdrawal
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const amountNum = Number(withdrawAmount);
    const minW = db.settings.minWithdrawal || 700;

    if (amountNum < minW) {
      showToast(`❌ Minimum withdrawal is ৳${minW}`);
      return;
    }
    if (amountNum > currentBalance) {
      showToast('❌ Insufficient balance in wallet');
      return;
    }
    if (!withdrawAccount || withdrawAccount.length < 11) {
      showToast('❌ Enter a valid 11-digit mobile wallet number');
      return;
    }

    sendAction('SUBMIT_WITHDRAWAL', {
      uId: currentUser.id,
      userName: currentUser.name,
      amount: amountNum,
      method: withdrawMethod,
      account: withdrawAccount
    });

    showToast('💸 Withdrawal requested successfully!');
    setWithdrawAccount('');
  };

  // Submit Promotion
  const handlePromotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !promoLink || !promoTxn) return;

    const newPromo = {
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      category: promoCategory,
      link: promoLink,
      details: promoDetails,
      txn: promoTxn,
      status: 'pending' as const,
      date: new Date().toLocaleString()
    };

    setDb(prev => ({ ...prev, promotions: [newPromo, ...prev.promotions] }));
    sendAction('SAVE_MODERATOR_DB', { db: { promotions: [newPromo, ...db.promotions] } });

    showToast('🚀 Promotion order submitted! Will be live after bKash verification.');
    setPromoLink('');
    setPromoDetails('');
    setPromoTxn('');
  };

  // Unlock Digital Product
  const handleUnlockMovie = (movie: MovieItem) => {
    if (!currentUser) return;
    const userUnlocked = db.unlockedMovies[currentUser.id] || [];
    if (userUnlocked.includes(movie.id)) {
      window.open(movie.url, '_blank');
      return;
    }

    if (currentBalance < movie.price) {
      showToast(`❌ Insufficient balance. You need ৳${movie.price} to unlock.`);
      return;
    }

    // Deduct & unlock
    const newBal = currentBalance - movie.price;
    const updatedUnlocked = [...userUnlocked, movie.id];
    const newTxn = {
      id: Date.now(),
      amount: -movie.price,
      type: 'DIGITAL_PURCHASE',
      note: `Unlocked Movie: ${movie.title}`,
      date: new Date().toLocaleString()
    };

    const newDb = {
      ...db,
      balances: { ...db.balances, [currentUser.id]: newBal },
      unlockedMovies: { ...db.unlockedMovies, [currentUser.id]: updatedUnlocked },
      transactions: {
        ...db.transactions,
        [currentUser.id]: [newTxn, ...(db.transactions[currentUser.id] || [])]
      }
    };

    setDb(newDb);
    sendAction('SAVE_MODERATOR_DB', { db: newDb });
    showToast(`🍿 Unlocked "${movie.title}" successfully!`);
    window.open(movie.url, '_blank');
  };

  const handleUnlockApp = (app: AppItem) => {
    if (!currentUser) return;
    const userUnlocked = db.unlockedApps[currentUser.id] || [];
    if (userUnlocked.includes(app.id)) {
      window.open(app.url, '_blank');
      return;
    }

    if (currentBalance < app.price) {
      showToast(`❌ Insufficient balance. You need ৳${app.price} to unlock.`);
      return;
    }

    const newBal = currentBalance - app.price;
    const updatedUnlocked = [...userUnlocked, app.id];
    const newTxn = {
      id: Date.now(),
      amount: -app.price,
      type: 'DIGITAL_PURCHASE',
      note: `Unlocked App: ${app.title}`,
      date: new Date().toLocaleString()
    };

    const newDb = {
      ...db,
      balances: { ...db.balances, [currentUser.id]: newBal },
      unlockedApps: { ...db.unlockedApps, [currentUser.id]: updatedUnlocked },
      transactions: {
        ...db.transactions,
        [currentUser.id]: [newTxn, ...(db.transactions[currentUser.id] || [])]
      }
    };

    setDb(newDb);
    sendAction('SAVE_MODERATOR_DB', { db: newDb });
    showToast(`💎 Unlocked "${app.title}" successfully!`);
    window.open(app.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-amber-300 font-semibold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Broadcast Announcement Bar */}
      <BroadcastBanner 
        message={db.settings?.broadcastBanner} 
        isActive={db.settings?.bannerActive !== false} 
      />

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Platform Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-100 flex items-center gap-1.5">
                  ROMEL EARNING POINT
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    VIP HUB
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30">
                    SEASON 1
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isModerator ? `${onlineCount} Live Active` : 'Live'}
                </span>
                <span>•</span>
                <span>Auto Sync v2.5</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & User Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Download App (APK) */}
            <a
              href={db.settings?.apkDownloadUrl || '#'}
              onClick={(e) => {
                if (!db.settings?.apkDownloadUrl) {
                  e.preventDefault();
                  showToast('📦 APK link not set yet. Please check back soon!');
                } else {
                  showToast('Downloading ROMEL EARNING POINT app... 📲');
                }
              }}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-950/60 border border-purple-400/40 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
            >
              <span>📲</span>
              <span className="hidden sm:inline">Download App</span>
            </a>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifModal(true)}
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {db.notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {db.notifications.length}
                </span>
              )}
            </button>

            {/* User Wallet Badge */}
            {currentUser && (
              <div 
                onClick={() => setActiveTab('wallet')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer transition-all"
              >
                <div className="text-right">
                  <div className="text-[10px] text-amber-300 font-semibold leading-tight">Balance</div>
                  <div className="text-xs font-black text-amber-400">৳{currentBalance.toFixed(2)}</div>
                </div>
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Profile Icon / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(prev => !prev)}
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 border-2 border-slate-800"
                  title="Profile"
                >
                  {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                </button>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden">
                      <div className="p-3.5 border-b border-slate-800">
                        <div className="text-xs font-black text-slate-100 truncate">{currentUser.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                      </div>
                      <button
                        onClick={() => { setActiveTab('wallet'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <Wallet className="w-3.5 h-3.5" /> My Wallet
                      </button>
                      <button
                        onClick={() => { setActiveTab('support'); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Help & Support
                      </button>
                      <button
                        onClick={handleUserLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => { setShowLoginForm(true); setShowOnboarding(false); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* Moderator Login / Panel Button */}
            {isModerator ? (
              <button
                onClick={() => setActiveTab('moderator')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Mode</span>
              </button>
            ) : (
              <button
                onClick={() => setShowModLogin(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                title="Moderator Access"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Moderator</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="bg-slate-900/60 border-b border-slate-800/80 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'tasks'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" /> Micro Tasks
          </button>

          <button
            onClick={() => setActiveTab('earn')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'earn'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Coins className="w-3.5 h-3.5" /> Daily Earn
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'movies'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> Movies & Series
          </button>

          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'apps'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Premium Apps
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'wallet'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> Wallet & Withdraw
          </button>

          <button
            onClick={() => setActiveTab('promotion')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'promotion'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Buy Promotion
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'support'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Help & Support
          </button>

          <button
            onClick={() => setActiveTab('supportgroups')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'supportgroups'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Support Group
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'updates'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Updates
          </button>

          <button
            onClick={() => setActiveTab('season2')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'season2'
                ? 'bg-fuchsia-500 text-white shadow-md shadow-fuchsia-500/30'
                : 'text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Season 2
          </button>

          {isModerator && (
            <button
              onClick={() => setActiveTab('moderator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeTab === 'moderator'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Moderator Panel
            </button>
          )}
        </div>
      </nav>

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* NOTICE BOARD (visible to all users on every tab except moderator panel) */}
        {activeTab !== 'moderator' && db.notices && db.notices.length > 0 && (
          <div className="space-y-2">
            {db.notices.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-sky-300">{notice.title}</div>
                  <div className="text-xs text-slate-300 mt-0.5 whitespace-pre-wrap break-words">{notice.message}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{notice.date}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 1: MICRO TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            
            {/* Header / Hero Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Earn Everyday
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
                  Complete Micro Tasks & Get Paid
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Perform simple tasks like subscribing to channels, joining Telegram, reviewing apps, and submit proof to receive cash points.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[100px]">
                  <div className="text-[10px] text-slate-400">Available</div>
                  <div className="text-base font-black text-amber-400">{db.tasks.length} Jobs</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[100px]">
                  <div className="text-[10px] text-slate-400">Completed</div>
                  <div className="text-base font-black text-emerald-400">{userSubmissions.length}</div>
                </div>
              </div>
            </div>

            {/* Task Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {['all', 'Social Media', 'YouTube Task', 'App Install'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTaskFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      taskFilter === cat
                        ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {db.tasks
                .filter(t => taskFilter === 'all' || t.category === taskFilter)
                .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((task) => (
                  <div
                    key={task.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {task.category || 'Micro Job'}
                        </span>
                        <div className="text-sm font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                          +৳{task.reward}
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {task.desc}
                      </p>

                      {task.details && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300">
                          <span className="font-semibold text-amber-400/90">Instructions: </span>
                          {task.details}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                      {task.link && (
                        <a
                          href={task.link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Open Task Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedTaskForProof(task)}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.02]"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Submit Proof
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 2: DAILY EARN */}
        {activeTab === 'earn' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Daily Income
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
                Daily Check-ins, Videos & Instant Earning
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Claim your recurring daily attendance rewards, watch sponsored videos, and complete quick opinion surveys.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {db.earns.map((earn) => (
                <div
                  key={earn.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 border border-slate-700">
                        {earn.limit}
                      </span>
                      <div className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        +৳{earn.reward}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-100">{earn.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{earn.desc}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                    {earn.link && (
                      <a
                        href={earn.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedEarnForProof(earn)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <Coins className="w-3.5 h-3.5" /> Claim Reward
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MOVIES & SERIES */}
        {activeTab === 'movies' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-transparent border border-rose-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Digital Cinema
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
                Unlock Premium HD Movies & Series
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Use your earned wallet points to instantly unlock exclusive movies, blockbusters, and premium Google Drive links.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {db.movies.map((movie) => {
                const isUnlocked = currentUser && (db.unlockedMovies[currentUser.id] || []).includes(movie.id);

                return (
                  <div
                    key={movie.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-rose-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-28 rounded-xl bg-gradient-to-tr from-slate-950 to-slate-800 flex items-center justify-center text-4xl mb-3 border border-slate-800 shadow-inner">
                        {movie.emoji || '🎬'}
                      </div>
                      <h3 className="text-sm font-bold text-slate-100">{movie.title}</h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <span>Price:</span>
                        <span className="text-rose-400 font-bold">৳{movie.price}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                      {isUnlocked ? (
                        <button
                          onClick={() => window.open(movie.url, '_blank')}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Watch / Download
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockMovie(movie)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
                        >
                          <Lock className="w-3.5 h-3.5" /> Unlock for ৳{movie.price}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Request a Movie */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-400" /> Can't find your movie?
              </h3>
              <p className="text-xs text-slate-400 mb-3">Tell us which movie or series you want. Your request goes straight to the Moderator team.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. Dune Part 3 (2026) HD..."
                  value={movieRequestText}
                  onChange={(e) => setMovieRequestText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => handleContentRequest('movie')}
                  className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" /> Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PREMIUM APPS */}
        {activeTab === 'apps' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent border border-indigo-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                VIP Tools
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
                Unlocked Android Apps & VIP Tools
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Get premium unlocked APKs, video editors, automation bots, and VPN master tools with instant link access.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {db.apps.map((app) => {
                const isUnlocked = currentUser && (db.unlockedApps[currentUser.id] || []).includes(app.id);

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-full h-28 rounded-xl bg-gradient-to-tr from-slate-950 to-slate-800 flex items-center justify-center text-4xl mb-3 border border-slate-800 shadow-inner">
                        {app.emoji || '💎'}
                      </div>
                      <h3 className="text-sm font-bold text-slate-100">{app.title}</h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <span>Cost:</span>
                        <span className="text-indigo-400 font-bold">৳{app.price}</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                      {isUnlocked ? (
                        <button
                          onClick={() => window.open(app.url, '_blank')}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Download App Link
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockApp(app)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20"
                        >
                          <Lock className="w-3.5 h-3.5" /> Unlock App for ৳{app.price}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Request an App */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-400" /> Looking for a specific app?
              </h3>
              <p className="text-xs text-slate-400 mb-3">Tell us which app or tool you need unlocked. Your request goes straight to the Moderator team.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. CapCut Pro Unlocked..."
                  value={appRequestText}
                  onChange={(e) => setAppRequestText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleContentRequest('app')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" /> Send Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: WALLET & WITHDRAW */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            
            {/* Balance Overview Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-500/5 to-slate-900 border border-amber-500/30">
                <div className="text-xs text-amber-300 font-bold">Available Earning Balance</div>
                <div className="text-3xl font-black text-amber-400 mt-2">৳{currentBalance.toFixed(2)}</div>
                <div className="text-[11px] text-slate-400 mt-2">
                  Min Withdraw: ৳{db.settings.minWithdrawal || 700}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-bold">Total Withdrawals</div>
                <div className="text-3xl font-black text-slate-200 mt-2">
                  ৳{userWithdrawals.filter(w => w.status === 'verified').reduce((acc, w) => acc + w.amount, 0)}
                </div>
                <div className="text-[11px] text-emerald-400 mt-2">
                  {userWithdrawals.filter(w => w.status === 'verified').length} Paid Requests
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 font-bold">Referral Bonus</div>
                <div className="text-3xl font-black text-slate-200 mt-2">
                  {currentUser ? (db.referrals[currentUser.id] || []).length : 0} Users
                </div>
                <div className="text-[11px] text-amber-400 mt-2">
                  Earn ৳{db.settings?.referralBonus ?? 25} for every active invited friend
                </div>
              </div>
            </div>

            {/* Share Referral Link */}
            {currentUser && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <h3 className="text-sm font-black text-slate-100 mb-1 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-amber-400" /> Share Your Referral Link
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Invite friends with this link — when they register, you earn ৳{db.settings?.referralBonus ?? 25} instantly.
                </p>
                <div className="flex items-center justify-between bg-slate-950 rounded-xl px-3 py-2.5 border border-slate-800 gap-2">
                  <span className="text-[11px] font-mono text-slate-300 truncate">
                    {typeof window !== 'undefined' ? window.location.origin : ''}?ref={currentUser.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}?ref=${currentUser.id}`;
                      navigator.clipboard?.writeText(link).then(() => showToast('🔗 Referral link copied!')).catch(() => {});
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
              </div>
            )}

            {/* Promo Code Redemption */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 border border-fuchsia-500/30">
              <h3 className="text-sm font-black text-slate-100 mb-1 flex items-center gap-2">
                🎁 Have a Promo Code?
              </h3>
              <p className="text-xs text-slate-400 mb-3">Enter a promo code from the Moderator to instantly add bonus balance to your wallet.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code..."
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500 uppercase"
                />
                <button
                  onClick={handleRedeemPromoCode}
                  className="px-4 py-2.5 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-xs whitespace-nowrap"
                >
                  Redeem Code
                </button>
              </div>
            </div>

            {/* Withdraw Form & History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-base font-black text-slate-100 mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  Request Cash Withdrawal
                </h3>

                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['bKash', 'Nagad', 'Rocket'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setWithdrawMethod(m)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                            withdrawMethod === m
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Withdraw Amount (৳)</label>
                    <input
                      type="number"
                      min={db.settings.minWithdrawal || 700}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      {withdrawMethod} Personal Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 mt-4"
                  >
                    <Send className="w-4 h-4" /> Submit Withdrawal Request
                  </button>
                </form>
              </div>

              {/* Transactions History */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col">
                <h3 className="text-base font-black text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Recent Wallet History
                </h3>

                <div className="overflow-y-auto space-y-2.5 flex-1 max-h-[340px]">
                  {userTransactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No transaction history recorded yet.
                    </div>
                  ) : (
                    userTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-200">{tx.note}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{tx.date}</div>
                        </div>
                        <div className={`text-xs font-black ${tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.amount >= 0 ? `+৳${tx.amount}` : `-৳${Math.abs(tx.amount)}`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* My Withdrawal Requests — status tracking */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
              <h3 className="text-base font-black text-slate-100 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                My Withdrawal Requests
              </h3>
              {userWithdrawals.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No withdrawal requests yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userWithdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          ৳{w.amount} via {w.method}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {w.account} • {w.date}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full whitespace-nowrap ${
                          w.status === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : w.status === 'rejected'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {w.status === 'verified' ? 'Sent' : w.status === 'rejected' ? 'Rejected' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: BUY PROMOTION */}
        {activeTab === 'promotion' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-transparent border border-purple-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Sponsorship
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
                Promote Your Channels, Facebook & Products
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Get real followers, members, subscribers, and targeted organic traffic from our thousands of active earners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promotion Form */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-base font-black text-slate-100 mb-4">Create Promotion Order</h3>

                <form onSubmit={handlePromotionSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Promotion Category</label>
                    <select
                      value={promoCategory}
                      onChange={(e) => setPromoCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {PROMOTION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Link / URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://facebook.com/yourpage or telegram channel"
                      value={promoLink}
                      onChange={(e) => setPromoLink(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      bKash / Nagad Transaction ID (Send ৳500 to {db.settings?.promotionPaymentNumber || '01334788303'})
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9J3K88L0"
                      value={promoTxn}
                      onChange={(e) => setPromoTxn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Requirements / Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Special instructions for subscribers/reviewers..."
                      value={promoDetails}
                      onChange={(e) => setPromoDetails(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60"
                  >
                    <Sparkles className="w-4 h-4" /> Submit Promotion Order
                  </button>
                </form>
              </div>

              {/* Instructions */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-100">Payment Steps:</h3>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-1">Step 1: Send Money</span>
                      Send ৳500 (Send Money) to bKash/Nagad Personal Number: <strong className="text-white font-mono">{db.settings?.promotionPaymentNumber || '01334788303'}</strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-1">Step 2: Copy TrxID</span>
                      Copy the TrxID from your SMS/app receipt and paste it into the order form.
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-1">Step 3: Live Campaign</span>
                      Within 15 minutes of verification, your task will be published to all earners!
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 mt-4">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  100% Real, Active & Permanent Subscribers Guaranteed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: HELP & SUPPORT */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                24/7 Helpline
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">
                Help & Community Support
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Have questions about earnings, withdrawals, or task verification? Contact our moderator team directly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-base font-black text-slate-100 mb-4">Send a Support Ticket</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!supportMessage || !currentUser) return;
                    const newSup = {
                      id: Date.now(),
                      userId: currentUser.id,
                      userName: currentUser.name,
                      message: supportMessage,
                      date: new Date().toLocaleString()
                    };
                    const updated = [newSup, ...db.support];
                    setDb(prev => ({ ...prev, support: updated }));
                    sendAction('SAVE_MODERATOR_DB', { db: { support: updated } });
                    showToast('📩 Ticket sent to moderator desk!');
                    setSupportMessage('');
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Your Message / Issue</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Describe your issue with task, payment or balance..."
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Ticket
                  </button>
                </form>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-100 mb-3">Official Channels</h3>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100">Telegram Community</div>
                        <div className="text-slate-400 text-[11px]">Daily promo codes & fast support</div>
                      </div>
                      <a
                        href="https://telegram.org"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-blue-500 text-slate-950 font-bold text-xs"
                      >
                        Join
                      </a>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100">Official Helpline Number</div>
                        <div className="text-slate-400 text-[11px]">01334788303 (10 AM - 10 PM)</div>
                      </div>
                      <span className="text-emerald-400 font-bold text-xs">Active</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400">Moderator Desk Response Time: </span>
                  <span className="text-xs font-bold text-amber-400">Under 15 Minutes</span>
                </div>
              </div>
            </div>

            {/* My Support Tickets & Replies */}
            {currentUser && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
                <h3 className="text-base font-black text-slate-100 mb-4">My Support Tickets</h3>
                <div className="space-y-3">
                  {db.support.filter(s => s.userId === currentUser.id).length === 0 && (
                    <p className="text-xs text-slate-500">You haven't sent any support tickets yet.</p>
                  )}
                  {db.support
                    .filter(s => s.userId === currentUser.id)
                    .map((ticket) => (
                      <div key={ticket.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                        <div className="text-xs text-slate-200">{ticket.message}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{ticket.date}</div>
                        {ticket.reply ? (
                          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <div className="text-[10px] font-black text-emerald-400 mb-1">
                              Moderator Reply{ticket.repliedBy ? ` — ${ticket.repliedBy}` : ''}
                            </div>
                            <div className="text-xs text-slate-200">{ticket.reply}</div>
                          </div>
                        ) : (
                          <div className="mt-2 text-[10px] text-amber-400 font-semibold">⏳ Waiting for moderator reply...</div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: SUPPORT GROUP */}
        {activeTab === 'supportgroups' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-transparent border border-sky-500/20">
              <h2 className="text-xl font-black text-slate-100">Support Groups</h2>
              <p className="text-xs text-slate-400 mt-1">Join our official community groups for updates, help, and networking.</p>
            </div>
            {(db.supportGroups || []).filter(g => g.active).length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No support groups added yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(db.supportGroups || [])
                  .filter(g => g.active)
                  .map((g) => (
                    <a
                      key={g.id}
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 flex items-center gap-3 transition-all"
                    >
                      <div className="text-2xl">{g.emoji || '💬'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-100 truncate">{g.title}</div>
                        <div className="text-[10px] text-sky-400 flex items-center gap-1 mt-0.5">
                          Join Group <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </a>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: UPDATES (Moderator broadcast notices, full history) */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-transparent border border-sky-500/20">
              <h2 className="text-xl font-black text-slate-100">Latest Updates</h2>
              <p className="text-xs text-slate-400 mt-1">Official announcements from the Moderator team.</p>
            </div>
            {(db.notices || []).length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No updates posted yet.</div>
            ) : (
              <div className="space-y-2.5">
                {db.notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-start gap-3"
                  >
                    <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-sky-300">{notice.title}</div>
                      <div className="text-xs text-slate-300 mt-0.5 whitespace-pre-wrap break-words">{notice.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{notice.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SEASON 2 */}
        {activeTab === 'season2' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-transparent border border-fuchsia-500/20">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                New Season
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-2">SEASON 2 Tasks</h2>
            </div>

            {(db.settings?.season2ComingSoon ?? true) ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-3xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-100">COMING SOON</h3>
                <p className="text-xs text-slate-500 mt-1">New Season 2 tasks are on the way. Stay tuned!</p>
              </div>
            ) : (db.season2Tasks || []).filter(t => t.status === 'active').length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No Season 2 tasks available right now.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(db.season2Tasks || [])
                  .filter(t => t.status === 'active')
                  .map((t) => (
                    <div key={t.id} className="p-5 rounded-2xl bg-slate-900 border border-fuchsia-500/20">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-black text-slate-100">{t.title}</h3>
                        <span className="text-xs font-black text-fuchsia-400 whitespace-nowrap">৳{t.reward}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">{t.desc}</p>
                      {t.link && (
                        <a
                          href={t.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-fuchsia-400 hover:text-fuchsia-300"
                        >
                          Open Task <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: MODERATOR DASHBOARD (FULL ADMIN ENGINE) */}
        {activeTab === 'moderator' && isModerator && (
          <ModeratorView
            db={db}
            role={moderatorRole || 'full'}
            subModeratorId={subModeratorId}
            onUpdateDb={(newDb) => {
              setDb(newDb);
              sendAction('SAVE_MODERATOR_DB', { db: newDb });
            }}
            onApproveProof={(id) => sendAction('APPROVE_TASK_PROOF', { id })}
            onRejectProof={(id, reason) => sendAction('REJECT_TASK_PROOF', { id, reason })}
            onVerifyWithdrawal={(id) => sendAction('VERIFY_WITHDRAWAL', { id })}
            onRejectWithdrawal={(id, reason) => sendAction('REJECT_WITHDRAWAL', { id, reason })}
            onBroadcastNotif={(notif) => sendAction('SEND_NOTIFICATION', notif)}
            onAdjustBalance={handleAdjustBalance}
            onBulkAdjustBalance={handleBulkAdjustBalance}
            onApproveRegistration={handleApproveRegistration}
            onRejectRegistration={handleRejectRegistration}
            onLogout={handleModeratorLogout}
            onToast={showToast}
          />
        )}

      </main>

      {/* Task Proof Submission Modal */}
      {selectedTaskForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Submit Proof for Task
            </h3>
            <p className="text-xs text-amber-400 font-semibold mb-4">
              {selectedTaskForProof.title} (+৳{selectedTaskForProof.reward})
            </p>

            <form onSubmit={handleTaskProofSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Required Proof Information:
                </label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 mb-2">
                  {selectedTaskForProof.proof || 'Username / Screenshot link'}
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Paste your username, transaction ID, or proof link here..."
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForProof(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20"
                >
                  Confirm & Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Earn Claim Modal */}
      {selectedEarnForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Claim Daily Bonus / Earn
            </h3>
            <p className="text-xs text-emerald-400 font-semibold mb-4">
              {selectedEarnForProof.title} (+৳{selectedEarnForProof.reward})
            </p>

            <form onSubmit={handleEarnProofSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Verification Note / Code:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Bonus Claimed / Video Watched"
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEarnForProof(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black"
                >
                  Claim ৳{selectedEarnForProof.reward}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderator Login Dialog */}
      {showModLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Moderator Access</h3>
                <p className="text-[11px] text-slate-400">Admin or Sub-Moderator Login</p>
              </div>
            </div>

            <form onSubmit={handleModeratorLogin} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Sub-Moderator Name (leave blank for Admin)"
                  value={modNameInput}
                  onChange={(e) => setModNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter Secret Code..."
                  value={modPassword}
                  onChange={(e) => setModPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModLogin(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <NotificationModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        notifications={db.notifications}
        currentUserId={currentUser?.id}
      />

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSwitchToLogin={() => { setShowOnboarding(false); setShowLoginForm(true); }}
        registrationFeeEnabled={db.settings?.registrationFeeEnabled ?? true}
        feeBeforeDeadline={db.settings?.registrationFeeBeforeDeadline ?? 100}
        feeAfterDeadline={db.settings?.registrationFeeAfterDeadline ?? 150}
        deadlineIso={db.settings?.registrationDeadline || ''}
        paymentNumber={db.settings?.registrationPaymentNumber || '01334788303'}
      />

      {/* Login Modal for returning users */}
      {showLoginForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
                <UserCheck className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-100">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1">Log in to continue earning</p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs mt-2 shadow-lg shadow-amber-500/20"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => { setShowLoginForm(false); setShowOnboarding(true); }}
                className="w-full text-center text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
              >
                New here? <span className="font-bold underline">Create an account</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pending Registration — waiting for Moderator payment verification */}
      {pendingRegistrationId != null && (() => {
        const entry = (db.pendingRegistrations || []).find(p => p.id === pendingRegistrationId);
        if (!entry) return null;
        if (entry.status === 'approved') return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 sm:p-8 text-center">
              {entry.status === 'pending' ? (
                <>
                  <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 animate-pulse">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-black text-slate-100 mb-2">Verifying Your Payment</h2>
                  <p className="text-xs text-slate-400 mb-4">
                    Our Moderator team is checking your bKash Transaction ID. This usually takes a little while — keep this page open or check back later.
                  </p>
                  <div className="text-left bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1 mb-4">
                    <div>TrxID: <span className="text-slate-200 font-mono">{entry.trxId}</span></div>
                    <div>Amount: <span className="text-amber-400 font-bold">৳{entry.amountPaid}</span></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
                    <XCircle className="w-7 h-7" />
                  </div>
                  <h2 className="text-lg font-black text-slate-100 mb-2">Verification Failed</h2>
                  <p className="text-xs text-slate-400 mb-4">{entry.rejectionReason || 'We could not verify your payment.'}</p>
                </>
              )}
              <button
                onClick={handleCancelPendingRegistration}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                {entry.status === 'rejected' ? 'Try Again' : 'Cancel & Start Over'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            © {new Date().getFullYear()} ROMEL EARNING POINT. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Instant Sync Enabled</span>
            <span>•</span>
            <span>bKash & Nagad Supported</span>
          </div>
        </div>
      </footer>
    </div>
  );
}