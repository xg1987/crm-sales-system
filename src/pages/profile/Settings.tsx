import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Bell, Save, Camera, Shield, Smartphone, Mail, Cloud, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../../context/UserContext';

type SettingsTab = 'personal' | 'security' | 'notifications';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');
  const [isSaving, setIsSaving] = useState(false);

  // Personal Info State initialized from context
  const [name, setName] = useState(user.name);
  const [position, setPosition] = useState(user.position);
  const [signature, setSignature] = useState(user.signature);
  const [avatar, setAvatar] = useState(user.avatar);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);

  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('头像读取失败'));
      reader.readAsDataURL(file);
    });

  const resizeImage = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await resizeImage(file);
      setAvatar(result);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        name,
        position,
        signature,
        avatar,
        phone,
        email
      });
      alert('设置已保存');
    } catch (error: any) {
      alert(error.message || '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-secondary" />
          </button>
          <h2 className="font-headline text-3xl font-black text-primary">系统设置</h2>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase bg-blue-100 text-blue-700 border border-blue-200">
          <Cloud className="w-4 h-4" />
          <span>Cloudflare 云端模式</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: 'personal', icon: <User className="w-5 h-5" />, label: '个人信息' },
            { id: 'security', icon: <Lock className="w-5 h-5" />, label: '账户与安全' },
            { id: 'notifications', icon: <Bell className="w-5 h-5" />, label: '推送通知' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl font-headline font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'bg-surface-container-low text-secondary hover:bg-surface-container-high'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-32 h-32 rounded-full border-4 border-surface shadow-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <input 
                      type="file" 
                      ref={avatarInputRef} 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <button 
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                    >
                      <Camera className="w-8 h-8" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest">点击更换头像</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest px-1">真实姓名</label>
                    <input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest px-1">职位</label>
                    <input 
                      value={position} 
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all" 
                    />
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-widest px-1">个性签名</label>
                    <textarea 
                      value={signature} 
                      onChange={(e) => setSignature(e.target.value)}
                      rows={3} 
                      className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none" 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">手机绑定</h4>
                        <input 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)}
                          className="text-xs text-secondary bg-transparent border-none p-0 focus:ring-0 w-full" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold">邮箱绑定</h4>
                        <input 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-xs text-secondary bg-transparent border-none p-0 focus:ring-0 w-full" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-error/10 rounded-lg text-error">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">登录密码</h4>
                        <p className="text-xs text-secondary">定期更换密码更安全</p>
                      </div>
                    </div>
                    <button className="text-primary text-sm font-bold hover:underline">修改</button>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> 安全建议
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    您的账户安全等级为：<span className="text-green-600 font-bold">高</span>。建议开启两步验证以进一步提升安全性。
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1"
              >
                {[
                  { title: '新客户提醒', desc: '当有新分配的潜在客户时通知我' },
                  { title: '跟进任务提醒', desc: '每日早晨提醒今日待回访的客户' },
                  { title: '业绩达成通知', desc: '当完成销售目标或有大额成交时通知我' },
                  { title: '系统公告', desc: '接收系统维护、功能更新等重要通知' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
                    <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-xs text-secondary">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-outline-variant/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8 mt-auto border-t border-outline-variant/10 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-on-primary rounded-xl font-headline font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
