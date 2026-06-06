import { create } from 'zustand';
import { api } from '@/utils/api';

interface AppState {
  sections: any[];
  bonds: any[];
  results: any[];
  refunds: any[];
  vouchers: any[];
  materials: any[];
  stats: { sections: number; bonds: number; pendingRefunds: number; vouchers: number };
  loading: boolean;
  error: string | null;
  fetchSections: () => Promise<void>;
  fetchBonds: () => Promise<void>;
  fetchResults: () => Promise<void>;
  fetchRefunds: () => Promise<void>;
  fetchVouchers: () => Promise<void>;
  fetchMaterials: () => Promise<void>;
  fetchMaterialsBySection: (sectionId: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  createSection: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateSection: (id: number, data: any) => Promise<{ success: boolean; error?: string }>;
  createBond: (data: any) => Promise<{ success: boolean; error?: string }>;
  createResult: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateResult: (id: number, data: any) => Promise<{ success: boolean; error?: string }>;
  createRefund: (data: any) => Promise<{ success: boolean; error?: string }>;
  approveRefund: (id: number) => Promise<{ success: boolean; error?: string }>;
  rejectRefund: (id: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  createVoucher: (data: any) => Promise<{ success: boolean; error?: string }>;
  createMaterial: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateMaterial: (id: number, data: any) => Promise<{ success: boolean; error?: string }>;
  submitMaterial: (id: number) => Promise<{ success: boolean; error?: string }>;
  approveMaterial: (id: number) => Promise<{ success: boolean; error?: string }>;
  rejectMaterial: (id: number, comment: string) => Promise<{ success: boolean; error?: string }>;
  deleteMaterial: (id: number) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  sections: [],
  bonds: [],
  results: [],
  refunds: [],
  vouchers: [],
  materials: [],
  stats: { sections: 0, bonds: 0, pendingRefunds: 0, vouchers: 0 },
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchSections: async () => {
    set({ loading: true });
    const res = await api.sections.list();
    if (res.success) set({ sections: res.data || [], loading: false });
    else set({ error: res.error, loading: false });
  },

  fetchBonds: async () => {
    set({ loading: true });
    const res = await api.bonds.list();
    if (res.success) set({ bonds: res.data || [], loading: false });
    else set({ error: res.error, loading: false });
  },

  fetchResults: async () => {
    set({ loading: true });
    const res = await api.results.list();
    if (res.success) set({ results: res.data || [], loading: false });
    else set({ error: res.error, loading: false });
  },

  fetchRefunds: async () => {
    set({ loading: true });
    const res = await api.refunds.list();
    if (res.success) set({ refunds: res.data || [], loading: false });
    else set({ error: res.error, loading: false });
  },

  fetchVouchers: async () => {
    set({ loading: true });
    const res = await api.vouchers.list();
    if (res.success) set({ vouchers: res.data || [], loading: false });
    else set({ error: res.error, loading: false });
  },

  fetchStats: async () => {
    const res = await api.stats();
    if (res.success) set({ stats: res.data || { sections: 0, bonds: 0, pendingRefunds: 0, vouchers: 0 } });
  },

  createSection: async (data) => {
    const res = await api.sections.create(data);
    if (res.success) { await get().fetchSections(); return { success: true }; }
    return { success: false, error: res.error };
  },

  updateSection: async (id, data) => {
    const res = await api.sections.update(id, data);
    if (res.success) { await get().fetchSections(); return { success: true }; }
    return { success: false, error: res.error };
  },

  createBond: async (data) => {
    const res = await api.bonds.create(data);
    if (res.success) { await get().fetchBonds(); return { success: true }; }
    return { success: false, error: res.error };
  },

  createResult: async (data) => {
    const res = await api.results.create(data);
    if (res.success) { await get().fetchResults(); return { success: true }; }
    return { success: false, error: res.error };
  },

  updateResult: async (id, data) => {
    const res = await api.results.update(id, data);
    if (res.success) { await get().fetchResults(); return { success: true }; }
    return { success: false, error: res.error };
  },

  createRefund: async (data) => {
    const res = await api.refunds.create(data);
    if (res.success) { await get().fetchRefunds(); return { success: true }; }
    return { success: false, error: res.error };
  },

  approveRefund: async (id) => {
    const res = await api.refunds.approve(id);
    if (res.success) { await get().fetchRefunds(); return { success: true }; }
    return { success: false, error: res.error };
  },

  rejectRefund: async (id, reason) => {
    const res = await api.refunds.reject(id, reason);
    if (res.success) { await get().fetchRefunds(); return { success: true }; }
    return { success: false, error: res.error };
  },

  createVoucher: async (data) => {
    const res = await api.vouchers.create(data);
    if (res.success) { await get().fetchVouchers(); await get().fetchRefunds(); return { success: true }; }
    return { success: false, error: res.error };
  },

  fetchMaterials: async () => {
    set({ loading: true });
    const res = await api.materials.list();
    if (res.success) set({ materials: res.data || [], loading: false });
    else set({ error: res.error, loading: false });
  },

  fetchMaterialsBySection: async (sectionId: number) => {
    set({ loading: true });
    const res = await api.materials.listBySection(sectionId);
    if (res.success) set({ materials: res.data || [], loading: false });
    else set({ error: res.error, loading: false });
  },

  createMaterial: async (data) => {
    const res = await api.materials.create(data);
    if (res.success) { await get().fetchMaterials(); return { success: true }; }
    return { success: false, error: res.error };
  },

  updateMaterial: async (id, data) => {
    const res = await api.materials.update(id, data);
    if (res.success) { await get().fetchMaterials(); return { success: true }; }
    return { success: false, error: res.error };
  },

  submitMaterial: async (id) => {
    const res = await api.materials.submit(id);
    if (res.success) { await get().fetchMaterials(); return { success: true }; }
    return { success: false, error: res.error };
  },

  approveMaterial: async (id) => {
    const res = await api.materials.approve(id);
    if (res.success) { await get().fetchMaterials(); return { success: true }; }
    return { success: false, error: res.error };
  },

  rejectMaterial: async (id, comment) => {
    const res = await api.materials.reject(id, comment);
    if (res.success) { await get().fetchMaterials(); return { success: true }; }
    return { success: false, error: res.error };
  },

  deleteMaterial: async (id) => {
    const res = await api.materials.remove(id);
    if (res.success) { await get().fetchMaterials(); return { success: true }; }
    return { success: false, error: res.error };
  },
}));
