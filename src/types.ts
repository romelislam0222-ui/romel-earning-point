export interface User {
  id: number;
  name: string;
  email: string;
  pass: string;
  country?: string;
  language?: string;
  balance?: number;
  status?: 'active' | 'banned' | 'premium';
  createdAt: string;
}

export interface TaskItem {
  id: number;
  title: string;
  desc: string;
  reward: number;
  proof: string;
  status: 'active' | 'paused';
  link?: string;
  details?: string;
  category?: string;
  deadline?: string;
  extra?: string;
}

export interface EarnItem {
  id: number;
  title: string;
  desc: string;
  reward: number;
  limit: string;
  link?: string;
  details?: string;
  category?: string;
  deadline?: string;
  extra?: string;
}

export interface MovieItem {
  id: number;
  title: string;
  price: number;
  emoji: string;
  url: string;
}

export interface AppItem {
  id: number;
  title: string;
  price: number;
  emoji: string;
  url: string;
}

export interface SubmissionItem {
  id: number;
  userId: number;
  userName?: string;
  taskId?: number;
  earnId?: number;
  task: string;
  reward: number;
  proof: string;
  status: 'pending' | 'correct' | 'incorrect';
  date: string;
  kind?: 'task' | 'earn';
}

export interface WithdrawalItem {
  id: number;
  userId: number;
  userName?: string;
  amount: number;
  method: string;
  account: string;
  status: 'pending' | 'verified' | 'rejected';
  date: string;
}

export interface PromotionItem {
  id: number;
  userId: number;
  userName?: string;
  category: string;
  link: string;
  details: string;
  txn: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface SupportMessage {
  id: number;
  userId: number;
  userName?: string;
  message: string;
  reply?: string;
  date: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  icon?: string;
  type?: 'info' | 'reward' | 'urgent' | 'promo' | 'task';
  targetUserId?: number | 'all';
  date: string;
  readBy?: number[];
  link?: string;
}

export interface TransactionItem {
  id: number;
  amount: number;
  type: string;
  note: string;
  date: string;
}

export interface AppSettings {
  compact: boolean;
  autosave: boolean;
  broadcastBanner?: string;
  bannerActive?: boolean;
  promotionPaymentNumber: string;
  minWithdrawal: number;
}

export interface AppDatabaseState {
  users: User[];
  balances: Record<number, number>;
  transactions: Record<number, TransactionItem[]>;
  tasks: TaskItem[];
  earns: EarnItem[];
  movies: MovieItem[];
  apps: AppItem[];
  submissions: SubmissionItem[];
  withdrawals: WithdrawalItem[];
  promotions: PromotionItem[];
  support: SupportMessage[];
  unlockedMovies: Record<number, number[]>;
  unlockedApps: Record<number, number[]>;
  referrals: Record<number, number[]>;
  notifications: NotificationItem[];
  settings: AppSettings;
  driveDataUrl?: string;
  driveFileId?: string;
  driveConnected?: boolean;
  driveLastSync?: string;
  driveRecords?: number;
  driveAutoSync?: boolean;
}

export type WSMessage =
  | { type: 'INIT_STATE'; payload: AppDatabaseState; onlineCount: number }
  | { type: 'STATE_UPDATE'; payload: Partial<AppDatabaseState>; onlineCount?: number }
  | { type: 'NOTIFICATION_BROADCAST'; payload: NotificationItem }
  | { type: 'CLIENT_ACTION'; action: string; data: any; userId?: number | null; isModerator?: boolean }
  | { type: 'ONLINE_COUNT'; count: number }
  | { type: 'PING' }
  | { type: 'PONG' };