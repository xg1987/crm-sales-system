import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '../types';
import * as api from '../lib/api';
import { useUser } from './UserContext';

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

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useUser();

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!isAuthenticated) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await api.getCustomers();
        setCustomers(res.customers || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [isAuthenticated]);

  const addCustomer = async (data: Omit<Customer, 'id'>) => {
    try {
      const res = await api.createCustomer(data);
      setCustomers(prev => [res.customer, ...prev]);
    } catch (error: any) {
      alert(error.message || '添加客户失败');
      throw error;
    }
  };

  const updateCustomer = async (id: string, data: Partial<Customer>) => {
    try {
      const res = await api.updateCustomer(id, data);
      setCustomers(prev => prev.map(c => (c.id === id ? res.customer : c)));
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
      setCustomers(prev => prev.filter(c => c.id !== id));
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
