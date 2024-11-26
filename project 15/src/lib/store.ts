import { create } from 'zustand';
import { supabase } from './supabase';
import type { Purchase } from './types';

interface PurchaseStore {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  fetchPurchases: () => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'status' | 'director_approval' | 'finance_approval'>) => Promise<void>;
  updatePurchaseStatus: (id: string, status: Purchase['status'], approvalType?: 'director' | 'finance') => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchases: [],
  loading: false,
  error: null,

  fetchPurchases: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ purchases: data || [], error: null });
    } catch (error) {
      set({ error: 'Failed to fetch purchases' });
    } finally {
      set({ loading: false });
    }
  },

  addPurchase: async (purchase) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([{
          ...purchase,
          status: 'pending',
          director_approval: null,
          finance_approval: null
        }])
        .select()
        .single();

      if (error) throw error;
      
      const { purchases } = get();
      set({ 
        purchases: [data, ...purchases],
        error: null 
      });
    } catch (error) {
      set({ error: 'Failed to add purchase' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updatePurchaseStatus: async (id, status, approvalType) => {
    set({ loading: true });
    try {
      const now = new Date().toISOString();
      const updates: any = { 
        status,
        updated_at: now
      };

      if (approvalType === 'director') {
        updates.director_approval = { approved: true, date: now };
      } else if (approvalType === 'finance') {
        updates.finance_approval = { approved: true, date: now };
      }

      const { data, error } = await supabase
        .from('purchases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { purchases } = get();
      set({
        purchases: purchases.map(p => p.id === id ? data : p),
        error: null
      });
    } catch (error) {
      set({ error: 'Failed to update purchase status' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deletePurchase: async (id) => {
    set({ loading: true });
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { purchases } = get();
      set({
        purchases: purchases.filter(p => p.id !== id),
        error: null
      });
    } catch (error) {
      set({ error: 'Failed to delete purchase' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));