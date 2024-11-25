import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vemmgjsuqyxddlxbkmzx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlbW1nanN1cXl4ZGRseGJrbXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1MzM3MjgsImV4cCI6MjA0ODEwOTcyOH0.RRAjdG9IIQ_s-74_PMKZykUSlrGY9XOvWKFZ3uZu1Oc';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: File): Promise<{ url: string; name: string } | null> {
  try {
    if (!file) return null;

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName; // Remove the 'public/' prefix

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('bills')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage
      .from('bills')
      .getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      name: file.name,
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

export async function createPurchase(data: any) {
  try {
    const { data: purchase, error } = await supabase
      .from('purchases')
      .insert([{
        ...data,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return purchase;
  } catch (error) {
    console.error('Create purchase error:', error);
    throw error;
  }
}

export async function updatePurchaseStatus(
  id: string,
  status: string,
  approvalType?: 'director' | 'finance'
) {
  try {
    const updates: any = { status };

    if (approvalType) {
      updates[`${approvalType}_approval`] = {
        approved: true,
        date: new Date().toISOString(),
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
  } catch (error) {
    console.error('Update purchase status error:', error);
    throw error;
  }
}

export async function fetchPurchases() {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch purchases error:', error);
    throw error;
  }
}