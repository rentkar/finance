import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vemmgjsuqyxddlxbkmzx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbW1nanN1cXl4ZGRseGJrbXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MzM3MjgsImV4cCI6MjA0ODEwOTcyOH0.RRAjdG9IIQ_s-74_PMKZykUSlrGY9XOvWKFZ3uZu1Oc';

export const supabase = createClient(supabaseUrl, supabaseKey);