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
const REQUEST_TIMEOUT_MS = 30000;

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

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return await res.json() as T;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const supportsAbortTimeout = typeof AbortController !== 'undefined';
  const controller = supportsAbortTimeout ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    : null;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      ...(controller ? { signal: controller.signal } : {}),
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      const data = await parseJsonSafe<{ error?: string }>(res);
      throw new Error(data?.error || `请求失败（${res.status}）`);
    }

    const data = await parseJsonSafe<T>(res);
    if (data === null) {
      throw new Error('服务器返回了无法识别的数据');
    }

    return data;
  } catch (error: any) {
    if (timeoutId) clearTimeout(timeoutId);

    if (error?.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }

    if (error instanceof TypeError) {
      throw new Error('网络连接失败，请检查当前网络');
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
