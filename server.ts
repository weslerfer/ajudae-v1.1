/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'express-async-errors';
import { xssProtection, csrfProtection } from './server/middleware/security';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import path from 'path';
import { randomUUID, randomBytes } from 'crypto';
import { 
  isSupabaseConfigured, 
  registerAuthUserInSupabase, 
  loginUserInSupabase 
} from './server/supabase';
import { 
  UserProfile, 
  AdminGroup, 
  ActiveGroup, 
  GroupMember, 
  Invite, 
  UserInvitedGroup,
  WalletTransaction, 
  Withdrawal, 
  PaymentPix, 
  SystemNotification 
} from './src/types';
import authRouter from "./server/routes/auth";
import groupsRouter from "./server/routes/groups";
import paymentsRouter from "./server/routes/payments";
import webhooksRouter from "./server/routes/webhooks";
import adminRouter from "./server/routes/admin";
import walletRouter from "./server/routes/wallet";
import notificationsRouter from "./server/routes/notifications";
import configRouter from "./server/routes/config";
import v1Router from "./server/routes/v1";

import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = 3000;

// Security Hardening
app.use(helmet({
  contentSecurityPolicy: false, // Avoid breaking Vite/React frontend in dev
}));

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || '*' : '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições desta IP, tente novamente em 15 minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 30, // Limit each IP to 30 auth requests per `window`
  message: { error: 'Muitas tentativas de login, tente novamente mais tarde.' }
});

// app.use('/api/', apiLimiter);
// app.use('/api/auth/', authLimiter);

app.use(express.json());
app.use(cookieParser());
app.use(xssProtection);
app.use(csrfProtection);


// --- SEED SEVERAL DUMMY USERS ON STARTUP TO ASSIST SYSTEM INITIATION ---

// --- MIDDLEWARE TO AUTHENTICATE USER VIA AUTH HEADER ---
// --- MIDDLEWARE FOR ADMIN ONLY ---
// ==========================================
// 1. AUTH & USER PROFILE ROUTES
// ==========================================
// ==========================================
// 2. GROUPS & ACTIVATION ENGINES
// ==========================================

// Get all AdminCreated Groups (Coluna A)
// Get User's Active Groups (Coluna B) - where the user is one of the 4 active participants
// Get User's Invited Groups (which user entered via link but hasn't activated/paid yet)
// Get single group details (Supports both AdminGroups and ActiveGroups)
// Trigger Invite Click (When a user navigates to an invite code link)
// A simple memory lock to prevent double-insert race conditions
const inviteProcessingLocks = new Set<string>();
// Delete an un-activated Invite Group from user's "Grupos de Convite"
// Activate an Invite Group (Generate PIX)
// ==========================================
// 3. PIX GENERATION & PAYMENTS (EFI BANK)
// ==========================================

const pendingPaymentLocks = new Set<string>();

// Create a Pix charge to activate an AdminGroup (Menu Grupos Disponíveis)
// Fetch payment status
// ==========================================
// 4. CORE ENGINE: WEBHOOK & FUND DISTRIBUTION & MEMBER GIRO
// ==========================================

/**
 * PRODUCING AUTOMATION ON CONFRIMED PAYMENT:
 * 1. Distribute 1/5 each (valor_base) to the 4 participating members.
 * 2. Create platform earnings transactions.
 * 3. Clone/copy the group to ActiveGroups (Coluna B).
 * 4. Execute Giro: shift positions, remove 1, insert new activating user in position 4.
 * 5. Generate a shared Invite Link with 10 max_uses for the new group.
 * 6. Deduct invitation usage if applicable + notify users.
 */
// Éfi Bank (Gerencianet) Raw Webhook Receiver (Useful for production Setup)
// Admin configure webhook in Efi manually
// ==========================================
// 5. CARTEIRA & WITHDRAWAL (SAQUES)
// ==========================================

// Get user financial data
// Request withdrawal (Saque)
// ==========================================
// 6. SYSTEM NOTIFICATIONS
// ==========================================
// ==========================================
// 7. ADMINISTRATIVE PANEL (PAINEL ADMIN)
// ==========================================

// Fetch admin global numbers & statistics
// Fetch admin notifications or users list
// Update user details manually by Admin
// Edit invite limits on specific invite codes
// Get all withdrawals list
// Handle withdrawal triggers
// Admin Group Operations
// View all wallets and transactions
// Adjust wallet balance manually
// Admin Global Messages
// ==========================================
// 8. VITE MIDDLEWARE & STATIC ASSET DELIVERY
// ==========================================

import { startPixRecoveryCron } from './server/services/pixRecovery';
import { container } from './server/shared/container';

app.use(authRouter);
app.use(groupsRouter);
app.use(paymentsRouter);
app.use(webhooksRouter);
app.use(adminRouter);
app.use(walletRouter);
app.use(notificationsRouter);
app.use(configRouter);
app.use(v1Router);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errorMsg = 'Erro interno no servidor.';
  console.error('[Global Error Handler]', err?.message || err);
  if (!res.headersSent) {
    res.status(500).json({ error: errorMsg });
  }
});

async function startServer() {
  // Start Background Cron Jobs
  startPixRecoveryCron();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', async (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

// Ensure workers are registered even on Vercel
container.jobService.startWorkers();

export default app;
