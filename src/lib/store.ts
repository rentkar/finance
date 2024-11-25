import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Purchase } from './types';

interface PurchaseStore {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'status' | 'createdAt' | 'directorApproval' | 'financeApproval'>) => void;
  updatePurchaseStatus: (id: string, status: Purchase['status'], approvalType?: 'director' | 'finance') => void;
}

export const usePurchaseStore = create<PurchaseStore>()(
  persist(
    (set, get) => ({
      purchases: [],
      loading: false,
      error: null,

      addPurchase: (purchase) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          purchases: [
            { 
              ...purchase, 
              id,
              status: 'pending',
              createdAt: new Date(),
              directorApproval: null,
              financeApproval: null,
            }, 
            ...state.purchases
          ],
        }));
      },

      updatePurchaseStatus: (id, status, approvalType) => {
        const currentPurchase = get().purchases.find(p => p.id === id);
        if (!currentPurchase) return;

        const now = new Date();

        if (status === 'rejected') {
          set((state) => ({
            purchases: state.purchases.map((p) =>
              p.id === id ? { 
                ...p, 
                status: 'rejected',
                directorApproval: null,
                financeApproval: null
              } : p
            ),
          }));
          return;
        }

        let updates = {};

        if (approvalType === 'director') {
          updates = { 
            directorApproval: { approved: true, date: now },
            status: 'director_approved'
          };
        } 
        else if (approvalType === 'finance') {
          updates = { 
            financeApproval: { approved: true, date: now },
            status: 'finance_approved'
          };
        }

        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
    }),
    {
      name: 'purchase-store',
      version: 1,
    }
  )
);