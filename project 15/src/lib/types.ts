export type Purchase = {
  id: string;
  uploader_name: string;
  vendor_name: string;
  purpose: 'Procurement' | 'Salary' | 'Repair' | 'Small Purchase';
  amount: number;
  file_url: string | null;
  file_name: string | null;
  status: 'pending' | 'director_approved' | 'finance_approved' | 'rejected';
  created_at: string;
  payment_date: string;
  payment_sequence: 'payment_first' | 'bill_first' | 'payment_without_bill';
  bill_type: 'quantum' | 'covalent';
  hub: 'mumbai' | 'delhi' | 'bangalore' | 'pune';
  director_approval: {
    approved: boolean;
    date: string;
  } | null;
  finance_approval: {
    approved: boolean;
    date: string;
  } | null;
};

export type Database = {
  public: {
    Tables: {
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, 'id' | 'created_at'>;
        Update: Partial<Purchase>;
      };
    };
  };
};