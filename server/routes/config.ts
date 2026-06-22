import express from 'express';
import { isSupabaseConfigured } from '../supabase';

const router = express.Router();

router.get('/api/config/supabase-status', async (req, res) => {
  res.json({ configured: isSupabaseConfigured() });
});

export default router;
