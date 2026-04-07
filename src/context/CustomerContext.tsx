import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '../types';
import * as api from '../lib/api';
import { useUser } from './UserContext';

const DATA_URL_PREFIX = 'data:';

function getCustomerSnapshotKey(userId?: string, phone?: string) {
  if (!userId && !phone) return null;
  return `yichen_customers_snapshot:${userId || 'unknown'}:${phone || 'unknown'}`;
}

function readCustomerSnapshot(userId?: string, phone?: string): Customer[] {
  const key = getCustomerSnapshotKey(userId, phone);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCustomerSnapshot(customers: Customer[], userId?: string, phone?: string) {
  const key = getCustomerSnapshotKey(userId, phone);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(customers));
  } catch {}
}

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  archiveCustomer: (id: string) => Promise<void>;
  restoreCustomer: (id: string) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

function hasPendingImages(customer: Omit<Customer, 'id'>) {
  return Boolean(
    customer.avatar?.startsWith(DATA_URL_PREFIX) ||
    customer.ziWeiChart?.startsWith(DATA_URL_PREFIX) ||
    customer.fengShuiImages?.some((img) => img.startsWith(DATA_URL_PREFIX)) ||
    customer.familyMembers?.some((member) =>
      member.avatar?.startsWith(DATA_URL_PREFIX) || member.ziWeiChart?.startsWith(DATA_URL_PREFIX)
    )
  );
}

function stripInlineImages(customer: Omit<Customer, 'id'>): Omit<Customer, 'id'> {
  return {
    ...customer,
    avatar: customer.avatar?.startsWith(DATA_URL_PREFIX) ? '' : customer.avatar,
    ziWeiChart: customer.ziWeiChart?.startsWith(DATA_URL_PREFIX) ? '' : customer.ziWeiChart,
    fengShuiImages: (customer.fengShuiImages || []).filter((img) => !img.startsWith(DATA_URL_PREFIX)),
    familyMembers: (customer.familyMembers || []).map((member) => ({
      ...member,
      avatar: member.avatar?.startsWith(DATA_URL_PREFIX) ? '' : member.avatar,
      ziWeiChart: member.ziWeiChart?.startsWith(DATA_URL_PREFIX) ? '' : member.ziWeiChart,
    })),
  };
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useUser();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    const snapshot = readCustomerSnapshot(user.id, user.phone);
    if (snapshot.length > 0) {
      setCustomers(snapshot);
      setLoading(false);
    } else {
      setLoading(true);
    }

    let cancelled = false;
    const fetchCustomers = async () => {
      try {
        const res = await api.getCustomers(user.id, user.phone);
        if (cancelled) return;
        const nextCustomers = res.customers || [];
        setCustomers(nextCustomers);
        writeCustomerSnapshot(nextCustomers, user.id, user.phone);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCustomers();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user.id, user.phone]);

  const persist = (next: Customer[]) => {
    setCustomers(next);
    writeCustomerSnapshot(next, user.id, user.phone);
  };

  const addCustomer = async (data: Omit<Customer, 'id'>) => {
    try {
      const pendingUpload = hasPendingImages(data);
      const basePayload = pendingUpload ? stripInlineImages(data) : data;
      const res = await api.createCustomer(basePayload);
      const immediateCustomer = { ...res.customer, syncStatus: pendingUpload ? 'uploading' : 'idle' };
      const next = [immediateCustomer, ...customers];
      persist(next);

      if (pendingUpload) {
        api.updateCustomer(res.customer.id, data)
          .then((updateRes) => {
            persist(next.map(c => (c.id === res.customer.id ? { ...updateRes.customer, syncStatus: 'idle' } : c)));
          })
          .catch(() => {
            persist(next.map(c => (c.id === res.customer.id ? { ...c, syncStatus: 'failed' } : c)));
          });
      }
    } catch (error: any) {
      alert(error.message || '添加客户失败');
      throw error;
    }
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    const optimistic = customers.map(c => (c.id === id ? { ...c, ...data } : c));
    persist(optimistic);
    try {
      const res = await api.updateCustomer(id, data);
      persist(optimistic.map(c => (c.id === id ? res.customer : c)));
    } catch (error: any) {
      alert(error.message || '更新客户失败');
      throw error;
    }
  };

  const archiveCustomer = async (id: string) => {
    await updateCustomer(id, { archived: true });
  };

  const restoreCustomer = async (id: string) => {
    await updateCustomer(id, { archived: false });
  };

  const deleteCustomer = async (id: string) => {
    const previous = customers;
    const next = previous.filter(c => c.id !== id);
    persist(next);
    try {
      await api.removeCustomer(id);
    } catch (error: any) {
      persist(previous);
      alert(error.message || '删除客户失败');
      throw error;
    }
  };

  return (
    <CustomerContext.Provider value={{
      customers,
      loading,
      addCustomer,
      updateCustomer,
      archiveCustomer,
      restoreCustomer,
      deleteCustomer,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
