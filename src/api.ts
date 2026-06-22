/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_BASE = ''; // relative paths to work cleanly across same-site reverse proxies

function getSafeLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('LocalStorage is blocked or disabled in this environment:', e);
    return null;
  }
}

function setSafeLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('LocalStorage set is blocked or disabled in this environment:', e);
  }
}

function removeSafeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('LocalStorage remove is blocked or disabled in this environment:', e);
  }
}

function getHeaders() {
  const token = getSafeLocalStorage('ajudae_auth_token');
  const userId = getSafeLocalStorage('ajudae_user_id');
  const authValue = token || userId;
  return {
    'Content-Type': 'application/json',
    ...(authValue ? { 'Authorization': `Bearer ${authValue}` } : {})
  };
}

async function request(url: string, options: RequestInit = {}) {
  const headers = { ...getHeaders(), ...options.headers };
  const response = await fetch(`${API_BASE}${url}`, { credentials: 'same-origin', ...options, headers });
  
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Erro de rede: ${response.status}`);
  }
  return response.json();
}

export const api = {
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  // --- Auth ---
  async register(data: any) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async login(credentials: any) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async me() {
    return request('/api/auth/me');
  },

  async getHomeStats() {
    return request('/api/auth/me_stats');
  },

  async updateProfile(data: { nome_completo: string; cidade: string; estado: string; email: string; telefone: string }) {
    return request('/api/auth/update_profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePix(chave_pix: string, banco_pix: string) {
    return request('/api/auth/update_pix', {
      method: 'POST',
      body: JSON.stringify({ chave_pix, banco_pix })
    });
  },

  async updatePassword(data: any) {
    return request('/api/auth/update_password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // --- Groups ---
  async getAdminGroups() {
    return request('/api/groups/admin_groups');
  },

  async getActiveGroups() {
    return request('/api/groups/active_groups');
  },

  async getInvitedGroups() {
    return request('/api/groups/invited_groups');
  },

  async getGroupDetails(id: string) {
    return request(`/api/groups/details/${id}`);
  },

  async registerInviteClick(code: string) {
    return request('/api/groups/invite_click', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  },

  async deleteInvitedGroup(id: string) {
    return request('/api/groups/invited_groups/delete', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },

  // --- Pix Payments ---
  async createPayment(group_id: string) {
    return request('/api/payments/create', {
      method: 'POST',
      body: JSON.stringify({ group_id })
    });
  },

  async simulatePayment(id: string) {
    return request(`/api/payments/simulate/${id}`, {
      method: 'POST'
    });
  },

  async activateInvitedGroup(id: string) {
    return request('/api/groups/invited_groups/activate', {
      method: 'POST',
      body: JSON.stringify({ id })
    });
  },

  async getPaymentStatus(id: string) {
    return request(`/api/payments/status/${id}`);
  },



  // --- Wallet & Withdrawals ---
  async getWalletInfo() {
    return request('/api/wallet/info');
  },

  async requestWithdrawal(valor: number) {
    return request('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ valor })
    });
  },

  // --- Notifications ---
  async getNotifications() {
    return request('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return request(`/api/notifications/read/${id}`, {
      method: 'POST'
    });
  },

  // --- ADMIN PANEL API ---
  async getAdminStats() {
    return request('/api/admin/stats');
  },

  async getAdminUsers() {
    return request('/api/admin/users');
  },

  async updateAdminUser(data: any) {
    return request('/api/admin/users/update', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async adjustAdminInviteLimit(invite_code: string, max_uses: number) {
    return request('/api/admin/users/invite_limit', {
      method: 'POST',
      body: JSON.stringify({ invite_code, max_uses })
    });
  },

  async getAdminWithdrawals() {
    return request('/api/admin/withdrawals');
  },

  async processAdminWithdrawal(id: string, action: 'autorizado' | 'rejeitado' | 'excluido', motivo?: string) {
    return request(`/api/admin/withdrawals/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, motivo })
    });
  },

  async createAdminGroup(data: any) {
    return request('/api/admin/groups/create', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async editAdminGroup(id: string, data: any) {
    return request(`/api/admin/groups/edit/${id}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminGroup(id: string) {
    return request(`/api/admin/groups/delete/${id}`, {
      method: 'POST'
    });
  },

  async getAdminWallets() {
    return request('/api/admin/wallets');
  },

  async adjustWalletBalance(userId: string, amount: number, description: string) {
    return request('/api/admin/wallets/adjust', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, amount, description })
    });
  },

  async getAdminMessages() {
    return request('/api/admin/messages');
  },

  async createAdminMessage(data: {titulo: string, mensagem: string, tipo: string}) {
    return request('/api/admin/messages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAdminMessage(id: string, data: {titulo: string, mensagem: string}) {
    return request(`/api/admin/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAdminMessage(id: string) {
    return request(`/api/admin/messages/${id}`, {
      method: 'DELETE'
    });
  },

  async getSupabaseConfigured() {
    return request('/api/config/supabase-status');
  }
};
