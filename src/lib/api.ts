import { Customer, FamilyMember, FollowUpRecord } from '../types';
import { UserProfile } from '../context/UserContext';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

export interface ApiCustomerPayload {
  name: string;
  phone: string;
  wechatId?: string;
  city?: string;
  birthInfo?: {
    date: string;
    time: string;
    type: 'solar' | 'lunar';
  };
  avatar: string;
  ziWeiChart?: string;
  fengShuiImages?: string[];
  status: 'to-follow' | 'closed' | 'following';
  level: Customer['level'];
  nextFollowUpDate?: string;
  followUpRecords: FollowUpRecord[];
  familyMembers?: FamilyMember[];
  archived?: boolean;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'yichen_auth_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.warn('localStorage is not available:', e);
    return null;
  }
}

export function setStoredToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn('localStorage is not available:', e);
  }
}

export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn('localStorage is not available:', e);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let message = '请求失败';
      try {
        const data = await res.json() as { error?: string };
        message = data.error || message;
      } catch {}
      throw new Error(message);
    }

    return res.json() as Promise<T>;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接或稍后重试');
    }
    throw error;
  }
}

export async function register(payload: { phone: string; password: string; name: string }) {
  return request<{ success: boolean; token: string; user: UserProfile }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { phone: string; password: string }) {
  return request<{ success: boolean; token: string; user: UserProfile }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  return request<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getMe() {
  return request<{ user: UserProfile }>('/me');
}

export async function updateMe(payload: Partial<UserProfile>) {
  return request<{ success: boolean; user: UserProfile }>('/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function getCustomers() {
  return request<{ customers: Customer[] }>('/customers');
}

export async function createCustomer(payload: ApiCustomerPayload) {
  return request<{ success: boolean; customer: Customer }>('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCustomer(id: string, payload: Partial<ApiCustomerPayload>) {
  return request<{ success: boolean; customer: Customer }>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function removeCustomer(id: string) {
  return request<{ success: boolean }>(`/customers/${id}`, {
    method: 'DELETE',
  });
}
