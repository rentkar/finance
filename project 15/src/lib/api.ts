import { supabase } from './supabase';
import type { Purchase } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function fetchPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPurchase(purchase: Omit<Purchase, 'id' | 'created_at' | 'status'>): Promise<Purchase> {
  const { data, error } = await supabase
    .from('purchases')
    .insert([{
      ...purchase,
      status: 'pending',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePurchaseStatus(
  id: string, 
  status: Purchase['status'],
  approvalType?: 'director' | 'finance'
): Promise<Purchase> {
  const updates: any = { status };
  
  if (approvalType) {
    const approvalField = `${approvalType}_approval`;
    updates[approvalField] = {
      approved: true,
      date: new Date().toISOString()
    };
  }

  const { data, error } = await supabase
    .from('purchases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}