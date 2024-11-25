import { supabase } from './supabase';

export async function signIn(username: string, password: string) {
  try {
    // For demo purposes, we'll use hardcoded credentials
    if (username === 'director' && password === '1234') {
      return { 
        success: true, 
        role: 'director' as const
      };
    }
    
    if (username === 'finance' && password === '1234') {
      return { 
        success: true, 
        role: 'finance' as const
      };
    }

    return { 
      success: false, 
      error: 'Invalid credentials' 
    };
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, error: 'Invalid credentials' };
  }
}

export async function signOut() {
  return { success: true };
}