import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, History, Archive, ChevronRight, LayoutGrid, ShieldCheck, Settings } from 'lucide-react';
import { motion } from 'motion/react';

const MANAGEMENT_ITEMS = [
  { 
    icon: <BarChart3 className="w-6 h-6" />, 
    label: '销售业绩统计', 
    description: '多维度分析销售数据，直观展示转化成果。',
    path: '/profile/stats',
    color: 'bg-amber-100 text-amber-600'
  },
  { 
    icon: <History className="w-6 h-6" />, 
    label: '客户跟进记录', 
    description: '查看并管理所有学员的沟通与回访历史。',
    path: '/profile/follow-ups',
    color: 'bg-blue-100 text-blue-600'
  },
  { 
    icon: <Archive className="w-6 h-6" />, 
    label: '归档管理', 
    description: '整理已成交或暂时不需要跟进的学员档案。',
    path: '/profile/archives',
    color: 'bg-emerald-100 text-emerald-600'
  },
];

const SYSTEM_TOOLS = [
  { icon: <ShieldCheck className="w-5 h-5" />, label: '权限设置' },
  { icon: <LayoutGrid className="w-5 h-5" />, label: '模块配置' },
  { icon: <Settings className="w-5 h-5" />, label: '系统参数' },
];

export default function Management() {
  const navigate = useNavigate();

  return (
    <div className="space-y-10 pb-20">
      <section className="relative bg-secondary rounded-3xl p-10 text-center shadow-2xl shadow-secondary/20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="mgmt-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="0.5" fill="white" />
            </pattern>
            <rect width="100" height="100" fill="url(#mgmt-grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex p-3 bg-white/20 rounded-2xl backdrop-blur-md mb-2">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-headline text-4xl font-black text-white tracking-widest">管理中心</h2>
          <p className="text-white/80 max-w-md mx-auto text-sm font-medium">
            高效管理学员资产，精准把控销售进度，实现数据驱动的业绩增长。
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MANAGEMENT_ITEMS.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => navigate(item.path)}
            className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 hover:shadow-xl hover:shadow-secondary/5 transition-all group cursor-pointer"
          >
            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">{item.label}</h3>
            <p className="text-sm text-secondary leading-relaxed font-medium mb-6">
              {item.description}
            </p>
            <div className="flex items-center text-xs font-black text-secondary uppercase tracking-widest group-hover:text-primary transition-colors">
              进入管理 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Tools Section */}
      <section className="bg-surface-container-highest/20 rounded-3xl p-8 border border-outline-variant/10">
        <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em] mb-6 opacity-60">系统辅助工具</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SYSTEM_TOOLS.map((tool, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                {tool.icon}
              </div>
              <span className="font-bold text-sm text-on-surface">{tool.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
