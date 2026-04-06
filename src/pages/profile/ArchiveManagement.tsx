import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, RefreshCw, Trash2, Search, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomers } from '../../context/CustomerContext';

export default function ArchiveManagement() {
  const navigate = useNavigate();
  const { customers, restoreCustomer, deleteCustomer } = useCustomers();
  const archivedCustomers = customers.filter(c => c.archived);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = archivedCustomers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const handleRestore = (id: string) => {
    restoreCustomer(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要永久删除该学员的所有记录吗？此操作不可撤销。')) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-secondary" />
          </button>
          <h2 className="font-headline text-3xl font-black text-primary">归档管理</h2>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/40" />
          <input 
            type="text"
            placeholder="搜索已归档学员..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filtered.map((customer, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={customer.id}
              className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 grayscale opacity-60">
                  <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-lg text-secondary">{customer.name}</h4>
                  <p className="text-xs font-medium text-outline/60">{customer.phone}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleRestore(customer.id)}
                  className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  title="恢复学员"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors"
                  title="永久删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20">
            <Archive className="w-16 h-16 text-outline/20 mx-auto mb-4" />
            <p className="text-secondary font-medium">暂无归档记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
