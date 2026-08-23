import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// @ts-ignore
import archiverPkg from 'archiver';
const archiver = archiverPkg;
import type { AppDatabaseState, NotificationItem, WSMessage } from './src/types';

const __dirname = process.cwd();

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const initialDb: AppDatabaseState = {
  users: [],
  balances: {},
  transactions: {},
  tasks: [
    {
      id: 101,
      title: 'Join Official Telegram Channel',
      desc: 'Join our official Telegram community to get daily promo codes, earning tips, and updates.',
      reward: 30,
      proof: 'Telegram Username & Screenshot link',
      status: 'active',
      link: 'https://telegram.org',
      details: 'Click the link, join the group, and submit your username as proof.',
      category: 'Social Media',
      deadline: 'Anytime',
      extra: 'Reward will be credited after moderator verification.'
    },
    {
      id: 102,
      title: 'Subscribe YouTube Channel & Like Video',
      desc: 'Subscribe to our official YouTube channel, like our latest video and turn on notification bell.',
      reward: 45,
      proof: 'YouTube Channel Name / Screenshot',
      status: 'active',
      link: 'https://youtube.com',
      details: 'Watch at least 1 minute of video and subscribe.',
      category: 'YouTube Task',
      deadline: '24 Hours',
      extra: 'Instant ৳45 point credit on approval.'
    },
    {
      id: 103,
      title: 'Install & Review Partner App',
      desc: 'Download the partner finance app from Play Store and give a 5-star positive review.',
      reward: 70,
      proof: 'Play Store Review Profile Name',
      status: 'active',
      link: 'https://play.google.com',
      details: 'Keep the app installed for at least 24 hours.',
      category: 'App Install',
      deadline: '48 Hours',
      extra: 'Top earner reward task.'
    }
  ],
  earns: [
    {
      id: 201,
      title: 'Daily Check-in Bonus',
      desc: 'Claim your daily attendance reward every 24 hours.',
      reward: 10,
      limit: 'Daily 1 Time',
      details: 'Log in and claim bonus points to boost your balance.',
      category: 'Bonus'
    },
    {
      id: 202,
      title: 'Watch Sponsored Short Videos',
      desc: 'Watch partner educational and promotional video reels.',
      reward: 15,
      limit: '5 Times / Day',
      link: 'https://youtube.com',
      details: 'Watch full video and submit verification code.',
      category: 'Video Earn'
    },
    {
      id: 203,
      title: 'Quick Opinion Survey',
      desc: 'Answer 5 simple questions about your favorite online services.',
      reward: 35,
      limit: 'Weekly 3 Times',
      details: 'Complete accurate answers.',
      category: 'Survey'
    }
  ],
  movies: [
    {
      id: 301,
      title: 'Avengers: Secret Wars (HD)',
      price: 250,
      emoji: '🎬',
      url: 'https://drive.google.com'
    },
    {
      id: 302,
      title: 'Inception 2: Dream Beyond (4K)',
      price: 320,
      emoji: '🍿',
      url: 'https://drive.google.com'
    },
    {
      id: 303,
      title: 'Cyberpunk 2099: The Beginning',
      price: 180,
      emoji: '🎥',
      url: 'https://drive.google.com'
    }
  ],
  apps: [
    {
      id: 401,
      title: 'Romel Video Editor Pro (Unlocked)',
      price: 350,
      emoji: '💎',
      url: 'https://drive.google.com'
    },
    {
      id: 402,
      title: 'Auto Clicker & Task Automator VIP',
      price: 280,
      emoji: '⚡',
      url: 'https://drive.google.com'
    },
    {
      id: 403,
      title: 'VPN Master Unlimited Premium',
      price: 190,
      emoji: '🛡️',
      url: 'https://drive.google.com'
    }
  ],
  submissions: [],
  withdrawals: [],
  promotions: [],
  support: [],
  unlockedMovies: {},
  unlockedApps: {},
  referrals: {},
  notifications: [
    {
      id: 1,
      title: '🎉 Welcome to ROMEL EARNING POINT',
      body: 'Complete tasks, unlock premium movies & apps, and earn rewards daily!',
      type: 'info',
      date: new Date().toLocaleString(),
      targetUserId: 'all'
    },
    {
      id: 2,
      title: '⚡ Real-time Moderator Sync Enabled',
      body: 'All task updates, approvals, and notifications now sync across devices instantly!',
      type: 'urgent',
      date: new Date().toLocaleString(),
      targetUserId: 'all'
    }
  ],
  settings: {
    compact: false,
    autosave: true,
    broadcastBanner: '📢 Welcome to ROMEL EARNING POINT! New tasks added by Moderator. Withdrawals processed via bKash & Nagad.',
    bannerActive: true,
    promotionPaymentNumber: '01334788303',
    minWithdrawal: 700
  }
};

let db: AppDatabaseState = { ...initialDb };

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir', e);
  }
}

if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    db = {
      ...initialDb,
      ...parsed,
      settings: { ...initialDb.settings, ...(parsed.settings || {}) }
    };
  } catch (e) {
    console.error('Failed to read db file, using initial', e);
  }
}

function persistDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving db.json', e);
  }
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set<WebSocket>();

function broadcast(msg: WSMessage, exclude?: WebSocket) {
  const data = JSON.stringify(msg);
  for (const client of clients) {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (err) {
        console.error('WS broadcast error', err);
      }
    }
  }
}

function broadcastOnlineCount() {
  broadcast({
    type: 'ONLINE_COUNT',
    count: clients.size
  });
}

wss.on('connection', (ws) => {
  clients.add(ws);

  const initMsg: WSMessage = {
    type: 'INIT_STATE',
    payload: db,
    onlineCount: clients.size
  };
  ws.send(JSON.stringify(initMsg));
  broadcastOnlineCount();

  ws.on('message', (messageRaw) => {
    try {
      const msg: WSMessage = JSON.parse(messageRaw.toString());
      if (msg.type === 'CLIENT_ACTION') {
        handleClientAction(msg.action, msg.data, msg.userId, msg.isModerator, ws);
      } else if (msg.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (e) {
      console.error('WS message handling error', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastOnlineCount();
  });
});

function handleClientAction(action: string, data: any, userId?: number | null, isModerator?: boolean, originWs?: WebSocket) {
  const nowStr = new Date().toLocaleString();

  switch (action) {
    case 'CREATE_USER': {
      const newUser = {
        id: Date.now(),
        name: data.name || 'User',
        email: data.email || '',
        pass: data.pass || '',
        country: data.country || 'Bangladesh',
        language: data.language || 'Bangla',
        createdAt: nowStr
      };
      db.users.push(newUser);
      db.balances[newUser.id] = 50; // Welcome signup bonus
      db.transactions[newUser.id] = [
        {
          id: Date.now(),
          amount: 50,
          type: 'BONUS',
          note: 'Welcome Signup Bonus 🎉',
          date: nowStr
        }
      ];

      if (data.referralId) {
        const refId = Number(data.referralId);
        if (db.balances[refId] !== undefined) {
          db.balances[refId] = (db.balances[refId] || 0) + 25;
          if (!db.referrals[refId]) db.referrals[refId] = [];
          db.referrals[refId].push(newUser.id);
          if (!db.transactions[refId]) db.transactions[refId] = [];
          db.transactions[refId].unshift({
            id: Date.now() + 1,
            amount: 25,
            type: 'REFERRAL',
            note: `Referral bonus from ${newUser.name}`,
            date: nowStr
          });
        }
      }

      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: db });
      break;
    }

    case 'SUBMIT_TASK_PROOF': {
      const sub = {
        id: Date.now(),
        userId: data.userId,
        userName: data.userName,
        taskId: data.taskId,
        earnId: data.earnId,
        task: data.task,
        reward: Number(data.reward) || 0,
        proof: data.proof,
        status: 'pending' as const,
        date: nowStr,
        kind: data.kind || 'task'
      };
      db.submissions.unshift(sub);
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: { submissions: db.submissions } });
      break;
    }

    case 'APPROVE_TASK_PROOF': {
      const subId = Number(data.id);
      const sub = db.submissions.find(s => s.id === subId);
      if (sub && sub.status === 'pending') {
        sub.status = 'correct';
        const uId = sub.userId;
        db.balances[uId] = (db.balances[uId] || 0) + sub.reward;
        if (!db.transactions[uId]) db.transactions[uId] = [];
        db.transactions[uId].unshift({
          id: Date.now(),
          amount: sub.reward,
          type: 'TASK_REWARD',
          note: `Reward for "${sub.task}" approved`,
          date: nowStr
        });

        const notif: NotificationItem = {
          id: Date.now() + 2,
          title: '✅ Task Approved & Reward Credited!',
          body: `Your submission for "${sub.task}" was approved! ৳${sub.reward} has been added to your balance.`,
          type: 'reward',
          date: nowStr,
          targetUserId: uId
        };
        db.notifications.unshift(notif);
        broadcast({ type: 'NOTIFICATION_BROADCAST', payload: notif });
      }
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: db });
      break;
    }

    case 'REJECT_TASK_PROOF': {
      const subId = Number(data.id);
      const sub = db.submissions.find(s => s.id === subId);
      if (sub) {
        sub.status = 'incorrect';
        const notif: NotificationItem = {
          id: Date.now(),
          title: '❌ Task Proof Rejected',
          body: `Your submission for "${sub.task}" was rejected. Reason: ${data.reason || 'Invalid proof'}.`,
          type: 'urgent',
          date: nowStr,
          targetUserId: sub.userId
        };
        db.notifications.unshift(notif);
        broadcast({ type: 'NOTIFICATION_BROADCAST', payload: notif });
      }
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: { submissions: db.submissions, notifications: db.notifications } });
      break;
    }

    case 'SUBMIT_WITHDRAWAL': {
      const wItem = {
        id: Date.now(),
        userId: data.uId,
        userName: data.userName,
        amount: Number(data.amount),
        method: data.method,
        account: data.account,
        status: 'pending' as const,
        date: nowStr
      };
      db.balances[data.uId] = Math.max(0, (db.balances[data.uId] || 0) - wItem.amount);
      if (!db.transactions[data.uId]) db.transactions[data.uId] = [];
      db.transactions[data.uId].unshift({
        id: Date.now(),
        amount: -wItem.amount,
        type: 'WITHDRAW',
        note: `Withdrawal request to ${wItem.method} (${wItem.account})`,
        date: nowStr
      });
      db.withdrawals.unshift(wItem);
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: db });
      break;
    }

    case 'VERIFY_WITHDRAWAL': {
      const wId = Number(data.id);
      const item = db.withdrawals.find(w => w.id === wId);
      if (item && item.status === 'pending') {
        item.status = 'verified';
        const notif: NotificationItem = {
          id: Date.now(),
          title: '💸 Withdrawal Payment Sent!',
          body: `Your ৳${item.amount} withdrawal via ${item.method} (${item.account}) has been processed successfully!`,
          type: 'reward',
          date: nowStr,
          targetUserId: item.userId
        };
        db.notifications.unshift(notif);
        broadcast({ type: 'NOTIFICATION_BROADCAST', payload: notif });
      }
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: db });
      break;
    }

    case 'REJECT_WITHDRAWAL': {
      const wId = Number(data.id);
      const item = db.withdrawals.find(w => w.id === wId);
      if (item && item.status === 'pending') {
        item.status = 'rejected';
        db.balances[item.userId] = (db.balances[item.userId] || 0) + item.amount;
        if (!db.transactions[item.userId]) db.transactions[item.userId] = [];
        db.transactions[item.userId].unshift({
          id: Date.now(),
          amount: item.amount,
          type: 'REFUND',
          note: `Refund for rejected withdrawal: ${data.reason || 'Invalid info'}`,
          date: nowStr
        });
      }
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: db });
      break;
    }

    case 'SEND_NOTIFICATION': {
      const notif: NotificationItem = {
        id: Date.now(),
        title: data.title || 'Announcement',
        body: data.body || '',
        icon: data.icon || '🔔',
        type: data.type || 'info',
        targetUserId: data.targetUserId || 'all',
        date: nowStr
      };
      db.notifications.unshift(notif);
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: { notifications: db.notifications } });
      broadcast({ type: 'NOTIFICATION_BROADCAST', payload: notif });
      break;
    }

    case 'SAVE_MODERATOR_DB': {
      if (data.db) {
        db = { ...db, ...data.db };
        persistDb();
        broadcast({ type: 'STATE_UPDATE', payload: db });
      }
      break;
    }

    default:
      persistDb();
      broadcast({ type: 'STATE_UPDATE', payload: db });
      break;
  }
}

// REST endpoints
app.get('/api/state', (req: Request, res: Response) => {
  res.json({ ok: true, data: db, onlineCount: clients.size });
});

app.post('/api/action', (req: Request, res: Response) => {
  const { action, data, userId, isModerator } = req.body;
  handleClientAction(action, data, userId, isModerator);
  res.json({ ok: true, state: db });
});

// Full Project Source ZIP Download Endpoint
app.get('/api/download-zip', (req: Request, res: Response) => {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="romel-earning-point-source.zip"');

    archive.on('error', (err: any) => {
      console.error('Archiver error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create zip archive' });
      }
    });

    archive.pipe(res);

    const rootDir = process.cwd();
    const filesToInclude = [
      'package.json',
      'server.ts',
      'index.html',
      'tsconfig.json',
      'vite.config.ts',
      'metadata.json',
      '.env.example',
      'README.md'
    ];

    filesToInclude.forEach((file) => {
      const p = path.join(rootDir, file);
      if (fs.existsSync(p)) {
        archive.file(p, { name: file });
      }
    });

    const srcDir = path.join(rootDir, 'src');
    if (fs.existsSync(srcDir)) {
      archive.directory(srcDir, 'src');
    }

    const publicDir = path.join(rootDir, 'public');
    if (fs.existsSync(publicDir)) {
      archive.directory(publicDir, 'public');
    }

    const dataDir = path.join(rootDir, 'data');
    if (fs.existsSync(dataDir)) {
      archive.directory(dataDir, 'data');
    }

    archive.finalize();
  } catch (err) {
    console.error('Error generating zip:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate zip file' });
    }
  }
});

// Vite & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Romel Earning Point server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
