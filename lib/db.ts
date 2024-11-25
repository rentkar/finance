import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Purchase = {
  id: string;
  uploader_name: string;
  vendor_name: string;
  purpose: 'Procurement' | 'Salary' | 'Repair' | 'Small Purchase';
  amount: number;
  file_url?: string;
  file_name?: string;
  status: 'pending' | 'director_approved' | 'finance_approved' | 'rejected';
  created_at: string;
  payment_date: string;
  payment_sequence: 'payment_first' | 'bill_first' | 'payment_without_bill';
  bill_type: 'quantum' | 'covalent';
  hub: 'mumbai' | 'delhi' | 'bangalore' | 'pune';
  director_approval?: {
    approved: boolean;
    date: string;
  };
  finance_approval?: {
    approved: boolean;
    date: string;
  };
  ocr_data?: {
    vendorName?: string;
    amount?: number;
    invoiceNumber?: string;
    taxNumber?: string;
    confidence?: number;
  };
};