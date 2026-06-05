const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export const api = {
  sections: {
    list: () => request<any[]>('/sections'),
    get: (id: number) => request<any>(`/sections/${id}`),
    create: (data: any) => request<any>('/sections', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/sections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  bonds: {
    list: () => request<any[]>('/bonds'),
    get: (id: number) => request<any>(`/bonds/${id}`),
    create: (data: any) => request<any>('/bonds', { method: 'POST', body: JSON.stringify(data) }),
  },
  results: {
    list: () => request<any[]>('/results'),
    create: (data: any) => request<any>('/results', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  refunds: {
    list: () => request<any[]>('/refunds'),
    create: (data: any) => request<any>('/refunds', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: number) => request<any>(`/refunds/${id}/approve`, { method: 'PUT' }),
    reject: (id: number, reason: string) => request<any>(`/refunds/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reject_reason: reason }) }),
  },
  vouchers: {
    list: () => request<any[]>('/vouchers'),
    create: (data: any) => request<any>('/vouchers', { method: 'POST', body: JSON.stringify(data) }),
  },
  stats: () => request<any>('/stats'),
};
