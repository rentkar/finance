import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Initialize storage bucket for files
const initStorage = async () => {
  try {
    const { data: bucket } = await supabase.storage.getBucket('purchase-files');
    if (!bucket) {
      await supabase.storage.createBucket('purchase-files', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
      });
    }
  } catch (error) {
    console.error('Storage initialization error:', error);
  }
};

initStorage();