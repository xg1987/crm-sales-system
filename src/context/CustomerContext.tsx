import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '../types';
import * as api from '../lib/api';
import { useUser } from './UserContext';

const CUSTOMER_CACHE_KEY = 'yichen_customers_cache';

function readCachedCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedCustomers(customers: Customer[]) {
  try {
    localStorage.setItem(CUSTOMER_CACHE_KEY, JSON.stringify(customers));
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

const DATA_URL_PREFIX = 'data:';

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

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(readCachedCustomers);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useUser();

  useEffect(() => {
    if (!customers.length) return;
    writeCachedCustomers(customers);
  }, [customers]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!isAuthenticated) {
        setCustomers([]);
        writeCachedCustomers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(customers.length === 0);
        const res = await api.getCustomers();
        const nextCustomers = res.customers || [];
        setCustomers(nextCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers(prev => prev);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [isAuthenticated]);

  const addCustomer = async (data: Omit<Customer, 'id'>) => {
    try {
      const basePayload = hasPendingImages(data) ? stripInlineImages(data) : data;
      const res = await api.createCustomer(basePayload);
      setCustomers(prev => {
        const next = [{ ...res.customer, syncStatus: hasPendingImages(data) ? 'uploading' : 'idle' }, ...prev];
        writeCachedCustomers(next);
        return next;
      });

      if (hasPendingImages(data)) {
        api.updateCustomer(res.customer.id, data)
          .then((updateRes) => {
            setCustomers(prev => {
              const next = prev.map(c => (c.id === res.customer.id ? { ...updateRes.customer, syncStatus: 'idle' } : c));
              writeCachedCustomers(next);
              return next;
            });
          })
          .catch(() => {
            setCustomers(prev => {
              const next = prev.map(c => (c.id === res.customer.id ? { ...c, syncStatus: 'failed' } : c));
              writeCachedCustomers(next);
              return next;
            });
          });
      }
    } catch (error: any) {
      alert(error.message || '添加客户失败');
      throw error;
    }
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    try {
      const res = await api.updateCustomer(id, data);
      setCustomers(prev => {
        const next = prev.map(c => (c.id === id ? res.customer : c));
        writeCachedCustomers(next);
        return next;
      });
    } catch (error: any) {
      alert(error.message || '更新客户失败');
      throw error;
    }
  };

  const archiveCustomer = async (id: string) => {
    try {
      await updateCustomer(id, { archived: true });
    } catch (error: any) {
      alert(error.message || '归档客户失败');
      throw error;
    }
  };

  const restoreCustomer = async (id: string) => {
    try {
      await updateCustomer(id, { archived: false });
    } catch (error: any) {
      alert(error.message || '恢复客户失败');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await api.removeCustomer(id);
      setCustomers(prev => {
        const next = prev.filter(c => c.id !== id);
        writeCachedCustomers(next);
        return next;
      });
    } catch (error: any) {
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
