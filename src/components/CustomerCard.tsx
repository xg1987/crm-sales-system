import React, { useState } from 'react';
import { Star, Archive, Phone, Edit2, Image as ImageIcon, X, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer } from '../types';

interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onArchive?: (id: string) => void;
  key?: string | number;
}

export default function CustomerCard({ 
  customer, 
  onEdit, 
  onArchive
}: CustomerCardProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'to-follow': return 'bg-primary/10 text-primary';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'following': return 'bg-amber-100 text-amber-800';
      default: return 'bg-surface-container-high text-secondary';
    }
  };

  const getStatusLabel = (status: Customer['status']) => {
    switch (status) {
      case 'to-follow': return '待回访';
      case 'closed': return '已成交';
      case 'following': return '跟进中';
      default: return status;
    }
  };

  return (
    <>
      <div 
        className="group bg-surface-container-low hover:bg-surface-container-high p-6 rounded-xl transition-all duration-500 relative border border-outline-variant/5"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10">
              <img 
                src={customer.avatar} 
                alt={customer.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="font-headline text-lg font-bold">{customer.name}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-secondary text-sm font-label font-medium">{customer.phone}</p>
                {customer.city && (
                  <p className="text-primary/70 text-[10px] font-label font-black bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                    {customer.city}
                  </p>
                )}
                {customer.wechatId && (
                  <p className="text-secondary/60 text-[10px] font-label font-medium bg-secondary/5 px-2 py-0.5 rounded">微信号: {customer.wechatId}</p>
                )}
                {customer.birthInfo && (
                  <p className="text-primary/70 text-[10px] font-label font-medium bg-primary/5 px-2 py-0.5 rounded">
                    {customer.birthInfo.type === 'solar' ? '阳历' : '农历'}: {customer.birthInfo.date} {customer.birthInfo.time}
                  </p>
                )}
                {customer.fengShuiImages && customer.fengShuiImages.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {customer.fengShuiImages.map((img, idx) => (
                      <div key={idx} className="w-6 h-6 rounded bg-surface-container-low border border-outline-variant/10 overflow-hidden">
                        <img src={img} alt="Feng Shui" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                    <span className="text-[8px] text-secondary/40 self-end font-bold ml-1">风水图</span>
                  </div>
                )}
                {customer.familyMembers && customer.familyMembers.length > 0 && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-secondary/5 rounded text-[10px] text-secondary font-bold">
                    <Users className="w-3 h-3" />
                    {customer.familyMembers.length}
                  </div>
                )}
                {customer.syncStatus === 'uploading' && (
                  <div className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    图片上传中
                  </div>
                )}
                {customer.syncStatus === 'failed' && (
                  <div className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                    图片上传失败
                  </div>
                )}
              </div>
            </div>
          </div>
          <span className={`text-[10px] px-3 py-1 rounded-full font-label font-bold uppercase tracking-widest ${getStatusColor(customer.status)}`}>
            {getStatusLabel(customer.status)}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>学员等级：
              <span className={customer.status === 'closed' ? 'text-green-700 font-bold text-sm' : 'text-primary font-bold text-sm'}>
                {customer.level}
              </span>
            </span>
          </div>

          {customer.followUpRecords && customer.followUpRecords.length > 0 && (
            <div className={`bg-surface-container-highest/40 p-3 rounded-lg border-l-2 ${customer.status === 'closed' ? 'border-green-600/30' : customer.status === 'following' ? 'border-amber-600/30' : 'border-primary/30'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${customer.status === 'closed' ? 'text-green-800' : customer.status === 'following' ? 'text-amber-800' : 'text-primary'}`}>
                  最新跟进
                </span>
                <span className="text-[10px] text-secondary">{customer.followUpRecords[0].date.split(' ')[0]}</span>
              </div>
              <p className="text-xs text-on-surface-variant italic line-clamp-1">“{customer.followUpRecords[0].note}”</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-outline-variant/10 flex justify-between items-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onArchive?.(customer.id);
            }}
            className="flex items-center gap-1 text-xs text-secondary hover:text-primary transition-colors font-medium"
          >
            <Archive className="w-4 h-4" /> 归档学员
          </button>
          <div className="flex gap-2">
            {customer.ziWeiChart && (
              <div className="relative group/chart">
                <button 
                  onClick={() => setShowLightbox(true)}
                  className="p-2 bg-secondary/5 hover:bg-secondary/10 rounded-full text-secondary transition-all border border-secondary/10"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                {/* Tooltip/Mini Preview */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/chart:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="bg-surface-container-lowest p-1 rounded-lg shadow-xl border border-outline-variant/20 w-32 h-32 overflow-hidden">
                    <img src={customer.ziWeiChart} alt="Zi Wei Chart" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            )}
            <button className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onEdit?.(customer)}
              className="p-2 bg-primary/5 hover:bg-primary/10 rounded-full text-primary transition-all border border-primary/10"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && customer.ziWeiChart && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLightbox(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-full max-h-full overflow-hidden rounded-lg shadow-2xl"
            >
              <img 
                src={customer.ziWeiChart} 
                alt="Full Chart" 
                className="max-w-full max-h-[90vh] object-contain"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setShowLightbox(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
