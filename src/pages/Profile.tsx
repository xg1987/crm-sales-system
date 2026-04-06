import { useNavigate } from 'react-router-dom';
import { BadgeCheck, History, BookOpen, ChevronRight } from 'lucide-react';
import { MOCK_ACTIVITIES } from '../constants';
import { useCustomers } from '../context/CustomerContext';
import { useUser } from '../context/UserContext';

export default function Profile() {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { user } = useUser();

  // Calculate real metrics
  const totalCustomers = customers.length;
  const activeLeads = customers.filter(c => c.status === 'to-follow' || c.status === 'following').length;
  
  // Count follow-ups this month (simplified for mock data)
  const allFollowUps = customers.flatMap(c => c.followUpRecords || []);
  const followUpsThisMonth = allFollowUps.length; // In real app, filter by date

  // Get latest 2 follow-up records for the preview
  const latestRecords = customers
    .filter(c => c.followUpRecords && c.followUpRecords.length > 0)
    .map(c => ({
      name: c.name,
      topic: c.followUpRecords![0].note.slice(0, 15) + '...',
      status: c.followUpRecords![0].note,
      avatar: c.avatar
    }))
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Sales Profile Header */}
      <section className="relative rounded-xl overflow-hidden">
        <div className="h-48 w-full bg-surface-container-high relative">
          <img 
            className="w-full h-full object-cover opacity-60" 
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200" 
            alt="Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
        </div>
        <div className="px-6 -mt-16 relative flex flex-col md:flex-row md:items-end gap-6">
          <div className="relative">
            <img 
              className="w-32 h-32 rounded-full border-4 border-surface shadow-lg object-cover" 
              src={user.avatar} 
              alt="Avatar"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-1 right-1 ink-wash-gradient text-white p-1.5 rounded-full flex items-center justify-center border-2 border-surface">
              <BadgeCheck className="w-4 h-4 fill-white text-primary" />
            </div>
          </div>
          <div className="pb-2">
            <h2 className="font-headline text-3xl font-black text-primary mb-1">{user.name}</h2>
            <p className="text-secondary font-semibold tracking-wide flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              {user.position} · 个人中心四阶
            </p>
            <p className="mt-3 text-on-surface-variant font-medium opacity-90 max-w-md">“{user.signature}”</p>
          </div>
        </div>
      </section>

      {/* Sales Metrics Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-5 rounded-xl text-center">
          <span className="text-secondary font-label text-xs font-bold uppercase tracking-widest block mb-2">累计客户</span>
          <span className="font-headline text-2xl font-black text-primary">{totalCustomers}</span>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl text-center">
          <span className="text-secondary font-label text-xs font-bold uppercase tracking-widest block mb-2">活跃线索</span>
          <span className="font-headline text-2xl font-black text-primary">{activeLeads}</span>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl text-center">
          <span className="text-secondary font-label text-xs font-bold uppercase tracking-widest block mb-2">本月跟进</span>
          <span className="font-headline text-2xl font-black text-primary">{followUpsThisMonth}</span>
        </div>
        <div className="bg-surface-container-low p-5 rounded-xl text-center">
          <span className="text-secondary font-label text-xs font-bold uppercase tracking-widest block mb-2">年度归档状态</span>
          <span className="font-headline text-2xl font-black text-primary">优秀</span>
        </div>
      </section>

      <div className="space-y-8">
        {/* Client Records Section */}
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-headline text-xl font-black flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              客户跟进记录
            </h3>
            <button 
              onClick={() => navigate('/profile/follow-ups')}
              className="text-primary font-label text-sm font-bold hover:underline"
            >
              查看全部
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestRecords.length > 0 ? (
              latestRecords.map((record, i) => (
                <div key={i} className="group bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 transition-all hover:bg-surface-container-high cursor-pointer border border-outline-variant/5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/10 flex-shrink-0">
                    <img src={record.avatar} alt={record.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-headline font-bold text-on-surface mb-1">{record.name} - {record.topic}</h4>
                    <p className="text-xs font-medium text-secondary line-clamp-1">最近跟进：{record.status}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:translate-x-1 transition-transform" />
                </div>
              ))
            ) : (
              <div className="col-span-full bg-surface-container-low/30 rounded-xl p-8 text-center border border-dashed border-outline-variant/20">
                <p className="text-sm text-secondary font-medium">暂无跟进记录</p>
                <p className="text-[10px] text-secondary/60 mt-1">添加学员并记录跟进后在此显示</p>
              </div>
            )}
          </div>
        </div>

        {/* Interaction History Section */}
        <div>
          <h3 className="font-headline text-xl font-black flex items-center gap-2 mb-4 px-2">
            <History className="w-5 h-5 text-primary" />
            近期动态
          </h3>
          <div className="bg-surface-container-low rounded-2xl p-6 space-y-6">
            {MOCK_ACTIVITIES.length > 0 ? (
              MOCK_ACTIVITIES.map(activity => (
                <div key={activity.id} className="relative pl-6 border-l border-outline-variant">
                  <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${activity.type === 'update' ? 'bg-primary' : 'bg-outline'}`}></div>
                  <span className="text-xs text-secondary font-label font-bold uppercase tracking-widest">{activity.time}</span>
                  <p className="text-on-surface font-semibold mt-1">{activity.content}</p>
                </div>
              ))
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-secondary font-medium">暂无动态</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
