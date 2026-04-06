import React, { useState, useMemo } from 'react';
import { Search, Archive, Filter, UserPlus, Users, TrendingUp, History, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StatsCard from '../components/StatsCard';
import CustomerCard from '../components/CustomerCard';
import AddCustomerModal from '../components/AddCustomerModal';
import { useCustomers } from '../context/CustomerContext';
import { Customer } from '../types';

export default function Dashboard() {
  const { customers, addCustomer, updateCustomer, archiveCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const total = customers.length;
    const toFollow = customers.filter(c => c.nextFollowUpDate === today).length;
    return {
      total,
      toFollow
    };
  }, [customers]);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Customer['status'] | 'all' | 'today'>('all');
  const [levelFilter, setLevelFilter] = useState<Customer['level'] | 'all'>('all');

  const filteredCustomers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return customers.filter(c => {
      if (c.archived) return false;
      
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.phone.includes(searchQuery) ||
                           (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesStatus = true;
      if (statusFilter === 'today') {
        matchesStatus = c.nextFollowUpDate === today;
      } else if (statusFilter !== 'all') {
        matchesStatus = c.status === statusFilter;
      }

      let matchesLevel = true;
      if (levelFilter !== 'all') {
        matchesLevel = c.level === levelFilter;
      }
      
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [customers, searchQuery, statusFilter, levelFilter]);

  const handleAddOrUpdateCustomer = (data: Omit<Customer, 'id'>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
    } else {
      addCustomer(data);
    }
    setEditingCustomer(undefined);
  };

  const handleArchive = (id: string) => {
    archiveCustomer(id);
  };

  const openAddModal = () => {
    setEditingCustomer(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* Dashboard Header */}
      <section className="relative bg-primary rounded-3xl p-10 text-center shadow-2xl shadow-primary/20">
        {/* Subtle Cultural Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden rounded-3xl">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="cultural-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="white" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.2"/>
            </pattern>
            <rect width="100" height="100" fill="url(#cultural-grid)" />
          </svg>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="font-headline text-4xl font-black text-white tracking-[0.2em] drop-shadow-md">CRM系统</h2>
          
          <div className="relative max-w-lg mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white transition-colors" />
            <input 
              type="text"
              placeholder="搜索姓名、手机号或城市..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-16 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-medium text-sm text-white placeholder:text-white/50 backdrop-blur-md"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all bg-white/5"
                  title="清除搜索"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="px-2 py-0.5 bg-white/20 rounded-md text-[10px] font-bold text-white/80 border border-white/10">
                {filteredCustomers.length}
              </div>
            </div>

            {/* Real-time Search Results Dropdown */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-[100] text-left"
                >
                  <div className="p-4 border-b border-outline-variant/10 bg-surface-container-low/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Search className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">搜索结果 ({filteredCustomers.length})</span>
                    </div>
                    {filteredCustomers.length > 0 && (
                      <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">点击学员卡片查看详情</span>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {filteredCustomers.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            onMouseDown={(e) => {
                              // Use onMouseDown to trigger before blur/close if needed, 
                              // but onClick should work if we handle it right.
                              e.preventDefault(); 
                            }}
                            onClick={() => {
                              openEditModal(customer);
                              setSearchQuery('');
                            }}
                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-primary/10 active:bg-primary/20 transition-all group text-left border border-transparent hover:border-primary/20"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-outline-variant/20 group-hover:border-primary/40 transition-colors flex-shrink-0">
                              <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{customer.name}</p>
                              <p className="text-xs text-secondary font-medium">{customer.phone} {customer.city && `· ${customer.city}`}</p>
                            </div>
                            <div className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-tighter shadow-sm ${
                              customer.status === 'closed' ? 'bg-green-100 text-green-800' : 
                              customer.status === 'following' ? 'bg-amber-100 text-amber-800' : 
                              'bg-primary/10 text-primary'
                            }`}>
                              {customer.status === 'closed' ? '已成交' : customer.status === 'following' ? '跟进中' : '待回访'}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-secondary/20">
                          <Users className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-secondary font-medium">未找到匹配的学员</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Unified Statistics Row */}
      <section className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-outline-variant/20">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 active:scale-95 group ${statusFilter === 'all' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className={`p-3 rounded-2xl transition-colors ${statusFilter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
              <Users className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className={`text-3xl font-black transition-colors ${statusFilter === 'all' ? 'text-primary' : 'text-on-surface'}`}>{stats.total}</p>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">在籍学子</p>
            </div>
          </button>
          <button 
            onClick={() => setStatusFilter('today')}
            className={`flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 active:scale-95 group ${statusFilter === 'today' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
          >
            <div className={`p-3 rounded-2xl transition-colors ${statusFilter === 'today' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'bg-secondary/10 text-secondary group-hover:bg-secondary/20'}`}>
              <History className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className={`text-3xl font-black transition-colors ${statusFilter === 'today' ? 'text-secondary' : 'text-on-surface'}`}>{stats.toFollow}</p>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest">今日待回访</p>
            </div>
          </button>
        </div>
      </section>

      {/* Customer List */}
      <section className="space-y-8">
        <div className="flex flex-col gap-6 border-b border-outline-variant/10 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold">
              {searchQuery ? `搜索结果 (${filteredCustomers.length})` : '学员名录'}
            </h3>
            
            <div className="flex items-center gap-6">
              {/* Status Filter */}
              <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
                {(['all', 'today', 'to-follow', 'following', 'closed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === s 
                        ? 'bg-primary text-on-primary shadow-lg' 
                        : 'text-secondary hover:bg-surface-container-high'
                    }`}
                  >
                    {s === 'all' ? '全部' : s === 'today' ? '今日回访' : s === 'to-follow' ? '待回访' : s === 'following' ? '跟进中' : '已成交'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-60 shrink-0">学员等级:</span>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
              {(['all', '新流量', '门票3980', '单科39800', '易学弟子69800', '国学弟子169800'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    levelFilter === l 
                      ? 'bg-secondary text-on-secondary border-secondary shadow-md' 
                      : 'bg-surface-container-low text-secondary border-outline-variant/10 hover:border-secondary/40'
                  }`}
                >
                  {l === 'all' ? '全部等级' : l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map(customer => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                onEdit={openEditModal}
                onArchive={handleArchive}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto text-secondary/20">
                <Users className="w-10 h-10" />
              </div>
              <p className="text-secondary font-medium">没有找到符合条件的学员</p>
            </div>
          )}
        </div>
      </section>

      {/* FAB for adding customer */}
      <button 
        onClick={openAddModal}
        className="fixed bottom-28 right-8 w-16 h-16 rounded-full ink-wash-gradient text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <UserPlus className="w-8 h-8" />
      </button>

      <AddCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(undefined);
        }} 
        onAdd={handleAddOrUpdateCustomer} 
        initialData={editingCustomer}
      />

      {/* Subtle Cultural Divider Pattern */}
      <div className="py-16 flex justify-center opacity-10">
        <svg className="text-outline" fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2"></circle>
          <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"></circle>
          <path d="M24 4V12M24 36V44M4 24H12M36 24H44" stroke="currentColor" strokeWidth="2"></path>
        </svg>
      </div>
    </div>
  );
}
