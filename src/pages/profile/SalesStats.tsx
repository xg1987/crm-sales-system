import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Users, Target, Calendar, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCustomers } from '../../context/CustomerContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { StudentLevel } from '../../types';

const COLORS = ['#8B0000', '#B22222', '#CD5C5C', '#F08080', '#FA8072'];

const LEVEL_PRICES: Record<string, number> = {
  '门票3980': 3980,
  '单科39800': 39800,
  '易学弟子69800': 69800,
  '国学弟子169800': 169800,
  '新流量': 0
};

export default function SalesStats() {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Turnover is based on level, regardless of status, as per user request
    const paidCustomers = customers.filter(c => (LEVEL_PRICES[c.level] || 0) > 0);
    
    // Calculate turnover
    const monthlyTurnover = paidCustomers.reduce((acc, c) => {
      // Use the last follow-up record as the transaction date proxy
      // Fallback to current date if no records exist
      const lastRecord = c.followUpRecords?.[0];
      const recordDate = lastRecord 
        ? new Date(lastRecord.date.replace(/\./g, '/'))
        : now;

      if (recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear) {
        return acc + (LEVEL_PRICES[c.level] || 0);
      }
      return acc;
    }, 0);

    const yearlyTurnover = paidCustomers.reduce((acc, c) => {
      const lastRecord = c.followUpRecords?.[0];
      const recordDate = lastRecord 
        ? new Date(lastRecord.date.replace(/\./g, '/'))
        : now;

      if (recordDate.getFullYear() === currentYear) {
        return acc + (LEVEL_PRICES[c.level] || 0);
      }
      return acc;
    }, 0);

    // Calculate monthly trend (last 6 months)
    const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthLabel = `${month + 1}月`;

      const monthTurnover = paidCustomers.reduce((acc, c) => {
        const lastRecord = c.followUpRecords?.[0];
        const recordDate = lastRecord 
          ? new Date(lastRecord.date.replace(/\./g, '/'))
          : now;

        if (recordDate.getMonth() === month && recordDate.getFullYear() === year) {
          return acc + (LEVEL_PRICES[c.level] || 0);
        }
        return acc;
      }, 0);

      const monthFollowUps = customers.reduce((acc, c) => {
        const count = (c.followUpRecords || []).filter(r => {
          const recordDate = new Date(r.date.replace(/\./g, '/'));
          return recordDate.getMonth() === month && recordDate.getFullYear() === year;
        }).length;
        return acc + count;
      }, 0);

      return {
        name: monthLabel,
        turnover: monthTurnover,
        followups: monthFollowUps
      };
    });

    // Level distribution
    const levelDistribution = (['新流量', '门票3980', '单科39800', '易学弟子69800', '国学弟子169800'] as const).map(level => ({
      name: level,
      value: customers.filter(c => c.level === level).length
    }));

    const totalPaidCount = paidCustomers.length;
    const activeLeads = customers.filter(c => c.level === '新流量').length;
    const conversionRate = customers.length > 0 ? ((totalPaidCount / customers.length) * 100).toFixed(1) : '0';

    return {
      monthlyTurnover,
      yearlyTurnover,
      monthlyTrend,
      levelDistribution,
      activeLeads,
      conversionRate
    };
  }, [customers]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-secondary" />
        </button>
        <h2 className="font-headline text-3xl font-black text-primary">销售业绩统计</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 p-6 rounded-3xl border border-primary/10 relative group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-headline font-bold text-secondary">
                {timeframe === 'month' ? '本月成交额' : '本年成交额'}
              </span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setTimeframe(timeframe === 'month' ? 'year' : 'month')}
                className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md hover:bg-white transition-colors"
              >
                切换 <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-primary">
              ¥{(timeframe === 'month' ? stats.monthlyTurnover : stats.yearlyTurnover).toLocaleString()}
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <Users className="w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-secondary">新增线索</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-on-surface">{stats.activeLeads}</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <Target className="w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-secondary">转化率</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-on-surface">{stats.conversionRate}%</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              月度成交趋势
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '成交额']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="turnover" fill="#8B0000" radius={[4, 4, 0, 0]} name="成交额" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level Distribution */}
        <div className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-black flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              学员等级分布
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.levelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {stats.levelDistribution.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs font-medium text-secondary">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-up Activity */}
        <div className="col-span-full bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              跟进活跃度 (次数)
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="followups" 
                  stroke="#8B0000" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#8B0000', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="跟进次数"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
