import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type JournalEntry = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  type: 'text' | 'voice';
  content: string;
  audio_url?: string;
  duration?: number;
  title?: string;
};
