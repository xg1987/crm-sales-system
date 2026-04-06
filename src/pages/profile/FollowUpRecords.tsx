import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useCustomers } from '../../context/CustomerContext';

export default function FollowUpRecords() {
  const navigate = useNavigate();
  const { customers } = useCustomers();

  // Flatten all follow-up records from all customers
  const allRecords = customers.flatMap(customer => 
    (customer.followUpRecords || []).map(record => ({
      ...record,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      customerId: customer.id
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-secondary" />
        </button>
        <h2 className="font-headline text-3xl font-black text-primary">客户跟进记录</h2>
      </div>

      <div className="space-y-4">
        {allRecords.map((record, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={idx}
            className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 shrink-0">
                <img src={record.customerAvatar} alt={record.customerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    {record.customerName}
                  </h4>
                  <div className="flex items-center gap-2 text-secondary">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-mono font-bold uppercase tracking-widest">{record.date}</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border-l-4 border-primary/20 relative">
                  <MessageSquare className="absolute -left-2 -top-2 w-4 h-4 text-primary/40" />
                  <p className="text-on-surface-variant leading-relaxed italic">“{record.note}”</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {allRecords.length === 0 && (
          <div className="text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20">
            <Clock className="w-16 h-16 text-outline/20 mx-auto mb-4" />
            <p className="text-secondary font-medium">暂无跟进记录</p>
          </div>
        )}
      </div>
    </div>
  );
}
