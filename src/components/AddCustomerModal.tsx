import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, Star, FileText, Plus, Clock, Camera, Image as ImageIcon, Eye, RefreshCw, Users, Trash2, Heart, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, FollowUpRecord, FamilyMember, StudentLevel } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (customer: Omit<Customer, 'id'>) => void;
  initialData?: Customer;
}

export default function AddCustomerModal({ isOpen, onClose, onAdd, initialData }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [city, setCity] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthType, setBirthType] = useState<'solar' | 'lunar'>('solar');
  const [level, setLevel] = useState<StudentLevel>('新流量');
  const [status, setStatus] = useState<Customer['status']>('to-follow');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [records, setRecords] = useState<FollowUpRecord[]>([]);
  const [newNote, setNewNote] = useState('');
  const [avatar, setAvatar] = useState('');
  const [ziWeiChart, setZiWeiChart] = useState('');
  const [fengShuiImages, setFengShuiImages] = useState<string[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'family'>('basic');

  // Family Member Form State
  const [isEditingFamily, setIsEditingFamily] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [fName, setFName] = useState('');
  const [fRelation, setFRelation] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fAvatar, setFAvatar] = useState('');
  const [fChart, setFChart] = useState('');
  const [fRecords, setFRecords] = useState<FollowUpRecord[]>([]);
  const [fNewNote, setFNewNote] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const chartInputRef = useRef<HTMLInputElement>(null);
  const fengShuiInputRef = useRef<HTMLInputElement>(null);
  const fAvatarInputRef = useRef<HTMLInputElement>(null);
  const fChartInputRef = useRef<HTMLInputElement>(null);

  // Update state when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone);
      setWechatId(initialData.wechatId || '');
      setCity(initialData.city || '');
      setBirthDate(initialData.birthInfo?.date || '');
      setBirthTime(initialData.birthInfo?.time || '');
      setBirthType(initialData.birthInfo?.type || 'solar');
      setLevel(initialData.level || '新流量');
      setStatus(initialData.status);
      setNextFollowUpDate(initialData.nextFollowUpDate || '');
      setRecords(initialData.followUpRecords || []);
      setAvatar(initialData.avatar || '');
      setZiWeiChart(initialData.ziWeiChart || '');
      setFengShuiImages(initialData.fengShuiImages || []);
      setFamilyMembers(initialData.familyMembers || []);
    } else {
      setName('');
      setPhone('');
      setWechatId('');
      setCity('');
      setBirthDate('');
      setBirthTime('');
      setBirthType('solar');
      setLevel('新流量');
      setStatus('to-follow');
      setNextFollowUpDate('');
      setRecords([]);
      setAvatar('');
      setZiWeiChart('');
      setFengShuiImages([]);
      setFamilyMembers([]);
    }
    setNewNote('');
    setActiveTab('basic');
    setIsEditingFamily(false);
  }, [initialData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'chart' | 'fAvatar' | 'fChart' | 'fengShui') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'fengShui') {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFengShuiImages(prev => [...prev, reader.result as string].slice(0, 4));
        };
        reader.readAsDataURL(file);
      });
      return;
    }

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'avatar') setAvatar(result);
      else if (type === 'chart') setZiWeiChart(result);
      else if (type === 'fAvatar') setFAvatar(result);
      else if (type === 'fChart') setFChart(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddRecord = () => {
    if (!newNote.trim()) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newRecord: FollowUpRecord = {
      date: dateStr,
      note: newNote.trim()
    };
    setRecords([newRecord, ...records]);
    setNewNote('');
  };

  const handleDeleteRecord = (idx: number) => {
    setRecords(records.filter((_, i) => i !== idx));
  };

  const handleAddFRecord = () => {
    if (!fNewNote.trim()) return;
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newRecord: FollowUpRecord = {
      date: dateStr,
      note: fNewNote.trim()
    };
    setFRecords([newRecord, ...(fRecords || [])]);
    setFNewNote('');
  };

  const handleDeleteFRecord = (idx: number) => {
    setFRecords(fRecords.filter((_, i) => i !== idx));
  };

  const handleSaveFamilyMember = () => {
    if (!fName.trim() || !fRelation.trim()) return;

    const member: FamilyMember = {
      id: editingFamilyId || Math.random().toString(36).substr(2, 9),
      name: fName,
      relationship: fRelation,
      phone: fPhone,
      avatar: fAvatar || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=200&h=200`,
      ziWeiChart: fChart,
      followUpRecords: fRecords || []
    };

    if (editingFamilyId) {
      setFamilyMembers((familyMembers || []).map(m => m.id === editingFamilyId ? member : m));
    } else {
      setFamilyMembers([...(familyMembers || []), member]);
    }

    // Reset Form
    setIsEditingFamily(false);
    setEditingFamilyId(null);
    setFName('');
    setFRelation('');
    setFPhone('');
    setFAvatar('');
    setFChart('');
    setFRecords([]);
    setFNewNote('');
  };

  const handleEditFamilyMember = (member: FamilyMember) => {
    setEditingFamilyId(member.id);
    setFName(member.name);
    setFRelation(member.relationship);
    setFPhone(member.phone);
    setFAvatar(member.avatar);
    setFChart(member.ziWeiChart || '');
    setFRecords(member.followUpRecords || []);
    setIsEditingFamily(true);
  };

  const handleDeleteFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-save if editing family member
    let currentFamilyMembers = [...familyMembers];
    if (isEditingFamily && fName.trim() && fRelation.trim()) {
      const member: FamilyMember = {
        id: editingFamilyId || Math.random().toString(36).substr(2, 9),
        name: fName,
        relationship: fRelation,
        phone: fPhone,
        avatar: fAvatar || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=200&h=200`,
        ziWeiChart: fChart,
        followUpRecords: fRecords || []
      };
      if (editingFamilyId) {
        currentFamilyMembers = currentFamilyMembers.map(m => m.id === editingFamilyId ? member : m);
      } else {
        currentFamilyMembers = [...currentFamilyMembers, member];
      }
    }

    let finalRecords = [...records];
    if (newNote.trim()) {
      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newRecord: FollowUpRecord = {
        date: dateStr,
        note: newNote.trim()
      };
      finalRecords = [newRecord, ...finalRecords];
    }

    onAdd({
      name,
      phone,
      wechatId,
      city,
      birthInfo: birthDate ? { date: birthDate, time: birthTime, type: birthType } : undefined,
      avatar: avatar || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=200&h=200`,
      ziWeiChart,
      fengShuiImages,
      status,
      nextFollowUpDate: nextFollowUpDate || undefined,
      level,
      followUpRecords: finalRecords,
      familyMembers: currentFamilyMembers,
    });
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 max-h-[90vh] flex flex-col"
            >
              <div className="px-8 py-6 border-b border-outline-variant/10 flex flex-col gap-4 bg-surface-container-low shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline text-2xl font-black text-primary">
                    {initialData ? '修改学员信息' : '新增学员'}
                  </h3>
                  <button type="button" onClick={onClose} className="p-2 hover:bg-outline-variant/20 rounded-full transition-colors">
                    <X className="w-6 h-6 text-secondary" />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'basic' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high text-secondary hover:bg-outline-variant/20'}`}
                  >
                    <User className="w-4 h-4" /> 基本信息
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('family')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'family' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-container-high text-secondary hover:bg-outline-variant/20'}`}
                  >
                    <Users className="w-4 h-4" /> 家人信息 ({familyMembers.length})
                  </button>
                </div>
              </div>

              <form id="customer-form" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="overflow-y-auto p-8 space-y-10 flex-1 custom-scrollbar">
                  {activeTab === 'basic' ? (
                    <div className="space-y-10">
                      {/* 1. Avatar Section (Top) */}
                      <div className="flex justify-center">
                        <div className="space-y-3 text-center">
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] px-1 opacity-60">学员头像</label>
                          <div 
                            className="w-28 h-28 rounded-full bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex items-center justify-center transition-all overflow-hidden group relative mx-auto shadow-inner ring-4 ring-surface-container-high/50"
                          >
                            {avatar ? (
                              <>
                                <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                                  <button 
                                    type="button"
                                    onClick={() => setLightboxImage(avatar)}
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                  >
                                    <RefreshCw className="w-5 h-5" />
                                  </button>
                                </div>
                              </>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                className="w-full h-full flex items-center justify-center hover:bg-primary/5 transition-colors"
                              >
                                <Camera className="w-10 h-10 text-outline/30" />
                              </button>
                            )}
                          </div>
                          <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                        </div>
                      </div>

                      {/* 2. Basic Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1 opacity-60">姓名</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40" />
                            <input
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 font-body focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                              placeholder="请输入姓名"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1 opacity-60">联系电话</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40" />
                            <input
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 font-body focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                              placeholder="请输入手机号"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1 opacity-60">微信号码</label>
                          <div className="relative">
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40" />
                            <input
                              value={wechatId}
                              onChange={(e) => setWechatId(e.target.value)}
                              className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 font-body focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                              placeholder="请输入微信号"
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 px-1 opacity-60">所在城市</label>
                          <div className="relative">
                            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40" />
                            <input
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 font-body focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                              placeholder="请输入城市"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Birth Info Section (Optimized Layout) */}
                      <div className="space-y-6 p-8 bg-surface-container-low rounded-3xl border border-outline-variant/10 relative overflow-hidden group/birth">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-secondary/40" />
                        <div className="flex items-center justify-between px-1">
                          <label className="block font-label text-xs font-black text-primary uppercase tracking-[0.2em]">出生年月日时</label>
                          <div className="flex bg-surface-container-highest p-1 rounded-xl border border-outline-variant/5 shadow-inner">
                            {(['solar', 'lunar'] as const).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setBirthType(type)}
                                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                  birthType === type 
                                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105' 
                                    : 'text-secondary/50 hover:text-primary'
                                }`}
                              >
                                {type === 'solar' ? '阳历' : '农历'}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                              <Clock className="w-5 h-5 text-primary/40" />
                              <div className="h-4 w-px bg-outline-variant/20" />
                              <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest">日期</span>
                            </div>
                            <input
                              type="date"
                              value={birthDate}
                              onChange={(e) => setBirthDate(e.target.value)}
                              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-4.5 pl-24 pr-4 font-mono text-sm focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                          </div>
                          <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                              <Clock className="w-5 h-5 text-primary/40" />
                              <div className="h-4 w-px bg-outline-variant/20" />
                              <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest">时间</span>
                            </div>
                            <input
                              type="time"
                              value={birthTime}
                              onChange={(e) => setBirthTime(e.target.value)}
                              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-4.5 pl-24 pr-4 font-mono text-sm focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. Charts & Feng Shui Section (After Birth Info) */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10">
                          {/* Zi Wei Chart */}
                          <div className="space-y-3">
                            <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] px-1 opacity-60">紫微盘图片</label>
                            <div 
                              className="w-36 h-36 rounded-2xl bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex items-center justify-center transition-all overflow-hidden group relative shadow-sm hover:border-primary/40"
                            >
                              {ziWeiChart ? (
                                <>
                                  <img src={ziWeiChart} alt="Chart Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                                    <button 
                                      type="button"
                                      onClick={() => setLightboxImage(ziWeiChart)}
                                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => chartInputRef.current?.click()}
                                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                    >
                                      <RefreshCw className="w-5 h-5" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={() => chartInputRef.current?.click()}
                                  className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                                >
                                  <ImageIcon className="w-10 h-10 text-outline/30" />
                                  <span className="text-[9px] font-black text-outline/40 uppercase tracking-widest">上传紫微盘</span>
                                </button>
                              )}
                            </div>
                            <input type="file" ref={chartInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'chart')} />
                          </div>

                          {/* Feng Shui Images */}
                          <div className="space-y-3">
                            <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] px-1 opacity-60">家具风水图片 (最多4张)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {fengShuiImages.map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-2xl bg-surface-container-low border border-outline-variant/20 overflow-hidden relative group shadow-sm">
                                  <img src={img} alt={`Feng Shui ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                    <button 
                                      type="button"
                                      onClick={() => setLightboxImage(img)}
                                      className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                                    >
                                      <Eye className="w-5 h-5" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setFengShuiImages(prev => prev.filter((_, i) => i !== idx))}
                                      className="p-2 bg-error/20 hover:bg-error/40 rounded-full text-white transition-colors"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {fengShuiImages.length < 4 && (
                                <button 
                                  type="button"
                                  onClick={() => fengShuiInputRef.current?.click()}
                                  className="aspect-square rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all text-outline/30 hover:text-primary hover:border-primary/30"
                                >
                                  <Plus className="w-8 h-8" />
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">添加图片</span>
                                </button>
                              )}
                            </div>
                            <input 
                              type="file" 
                              ref={fengShuiInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              multiple 
                              onChange={(e) => handleFileChange(e, 'fengShui')} 
                            />
                          </div>
                        </div>
                      </div>

                    {/* 5. Status & Intent */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-outline-variant/10">
                      <div className="space-y-6">
                        <div>
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 px-1 opacity-60">跟进状态</label>
                          <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/10">
                            {(['to-follow', 'following', 'closed'] as const).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                                  status === s 
                                    ? 'bg-primary text-on-primary shadow-md' 
                                    : 'text-secondary hover:bg-surface-container-high'
                                }`}
                              >
                                {s === 'to-follow' ? '待回访' : s === 'following' ? '跟进中' : '已成交'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 px-1 opacity-60">下次回访日期</label>
                          <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline/40" />
                            <input
                              type="date"
                              value={nextFollowUpDate}
                              onChange={(e) => setNextFollowUpDate(e.target.value)}
                              className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pl-12 pr-4 font-body focus:ring-2 focus:ring-primary/20 transition-all appearance-none shadow-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3 px-1 opacity-60">学员等级</label>
                          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-xl border border-outline-variant/10">
                            {(['新流量', '门票3980', '单科39800', '易学弟子69800', '国学弟子169800'] as StudentLevel[]).map((l) => (
                              <button
                                key={l}
                                type="button"
                                onClick={() => setLevel(l)}
                                className={`py-2.5 rounded-lg text-[11px] font-bold transition-all ${
                                  level === l 
                                    ? 'bg-primary text-on-primary shadow-md' 
                                    : 'text-secondary hover:bg-surface-container-high'
                                }`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <label className="block font-label text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-60">跟进记录</label>
                          <span className="text-[10px] text-primary font-black uppercase tracking-widest">共 {records.length} 条</span>
                        </div>
                        
                        {/* New Record Input */}
                        <div className="relative group">
                          <FileText className="absolute left-4 top-4 w-5 h-5 text-outline/40 group-focus-within:text-primary transition-colors" />
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={3}
                            className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-14 font-body focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-inner"
                            placeholder="输入新的跟进内容..."
                          />
                          <button
                            type="button"
                            onClick={handleAddRecord}
                            disabled={!newNote.trim()}
                            className="absolute right-3 bottom-3 p-2.5 bg-primary text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        {/* History List */}
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                          {records.map((record, idx) => (
                            <div key={idx} className="bg-surface-container-low/40 p-4 rounded-2xl border-l-4 border-primary/20 relative group hover:bg-surface-container-low transition-colors">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-3 h-3 text-outline/40" />
                                <span className="text-[10px] font-mono text-secondary font-bold">{record.date}</span>
                              </div>
                              <p className="text-sm text-on-surface-variant leading-relaxed">{record.note}</p>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord(idx)}
                                className="absolute top-4 right-4 p-1.5 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 rounded-lg"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {records.length === 0 && !newNote && (
                            <div className="text-center py-10 border-2 border-dashed border-outline-variant/10 rounded-2xl">
                              <p className="text-[10px] text-outline/30 font-black uppercase tracking-widest">暂无跟进记录</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {isEditingFamily ? (
                      <div className="bg-surface-container-low p-6 rounded-2xl border border-primary/20 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-headline text-lg font-bold text-primary flex items-center gap-2">
                            <Heart className="w-5 h-5" /> {editingFamilyId ? '修改家人信息' : '添加家人信息'}
                          </h4>
                          <button 
                            type="button" 
                            onClick={() => setIsEditingFamily(false)} 
                            className="p-2 hover:bg-outline-variant/10 rounded-full text-secondary transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Left Column: Basic Info */}
                          <div className="space-y-6">
                            <div className="flex items-center gap-6">
                              <div className="space-y-2 text-center">
                                <div 
                                  className="w-24 h-24 rounded-2xl bg-surface-container-lowest border-2 border-dashed border-outline-variant/30 flex items-center justify-center transition-all overflow-hidden group relative shadow-inner"
                                >
                                  {fAvatar ? (
                                    <>
                                      <img src={fAvatar} alt="F Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      <button 
                                        type="button"
                                        onClick={() => fAvatarInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                      >
                                        <RefreshCw className="w-5 h-5 text-white" />
                                      </button>
                                    </>
                                  ) : (
                                    <button type="button" onClick={() => fAvatarInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center gap-1">
                                      <Camera className="w-6 h-6 text-outline/30" />
                                      <span className="text-[9px] text-outline/40 font-bold uppercase">上传头像</span>
                                    </button>
                                  )}
                                </div>
                                <input type="file" ref={fAvatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'fAvatar')} />
                              </div>

                              <div className="flex-1 space-y-4">
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-1">姓名</label>
                                  <input 
                                    value={fName}
                                    onChange={(e) => setFName(e.target.value)}
                                    className="w-full bg-surface-container-lowest border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                    placeholder="家人姓名"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-1">关系</label>
                                  <input 
                                    value={fRelation}
                                    onChange={(e) => setFRelation(e.target.value)}
                                    className="w-full bg-surface-container-lowest border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                    placeholder="如：父亲、配偶"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-1">联系电话</label>
                              <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/40" />
                                <input 
                                  value={fPhone}
                                  onChange={(e) => setFPhone(e.target.value)}
                                  className="w-full bg-surface-container-lowest border-none rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                  placeholder="联系电话 (可选)"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-1">紫微盘</label>
                              <div className="flex items-center gap-4">
                                {fChart ? (
                                  <div className="relative group w-20 h-20 shadow-md rounded-xl overflow-hidden">
                                    <img src={fChart} alt="F Chart" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                                      <button type="button" onClick={() => setLightboxImage(fChart)} className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"><Eye className="w-4 h-4" /></button>
                                      <button type="button" onClick={() => fChartInputRef.current?.click()} className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40 transition-colors"><RefreshCw className="w-4 h-4" /></button>
                                    </div>
                                  </div>
                                ) : (
                                  <button 
                                    type="button" 
                                    onClick={() => fChartInputRef.current?.click()} 
                                    className="flex-1 h-20 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-primary/30 hover:bg-primary/5 transition-all text-secondary group shadow-sm"
                                  >
                                    <ImageIcon className="w-6 h-6 text-outline/30 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover:text-primary transition-colors">上传紫微盘</span>
                                  </button>
                                )}
                                <input type="file" ref={fChartInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'fChart')} />
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Follow-up */}
                          <div className="space-y-4 flex flex-col h-full">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest px-1">跟进记录</label>
                              <div className="relative group">
                                <textarea
                                  value={fNewNote}
                                  onChange={(e) => setFNewNote(e.target.value)}
                                  rows={3}
                                  className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm pr-12 resize-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                  placeholder="记录家人的相关情况..."
                                />
                                <button
                                  type="button"
                                  onClick={handleAddFRecord}
                                  disabled={!fNewNote.trim()}
                                  className="absolute right-3 bottom-3 p-2 bg-primary text-on-primary rounded-lg shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                              {fRecords.map((r, i) => (
                                <div key={i} className="bg-surface-container-lowest/50 p-4 rounded-xl border-l-4 border-primary/20 relative group shadow-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-3 h-3 text-outline/40" />
                                    <span className="text-[10px] font-mono text-secondary font-bold">{r.date}</span>
                                  </div>
                                  <p className="text-sm text-on-surface-variant leading-relaxed">{r.note}</p>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFRecord(i)}
                                    className="absolute top-4 right-4 p-1.5 text-error opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/10 rounded-lg"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                              {fRecords.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-outline-variant/10 rounded-xl">
                                  <p className="text-xs text-outline/30 italic">暂无跟进记录</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-6 mt-4 border-t border-outline-variant/10">
                          <button 
                            type="button"
                            onClick={() => setIsEditingFamily(false)}
                            className="flex-1 py-3 text-sm font-bold text-secondary bg-surface-container-high rounded-xl hover:bg-outline-variant/20 transition-all"
                          >
                            取消
                          </button>
                          <button 
                            type="button"
                            onClick={handleSaveFamilyMember}
                            className="flex-1 py-3 text-sm font-bold bg-primary text-on-primary rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            {editingFamilyId ? '确认修改' : '确认添加'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-secondary font-medium">您可以添加学员的家属信息，以便更全面地了解其家庭背景及命理关联。</p>
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingFamilyId(null);
                              setFName('');
                              setFRelation('');
                              setFPhone('');
                              setFAvatar('');
                              setFChart('');
                              setFRecords([]);
                              setIsEditingFamily(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-all"
                          >
                            <Plus className="w-4 h-4" /> 添加家人
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {familyMembers.map((member) => (
                            <div key={member.id} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/10 flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border border-primary/10" referrerPolicy="no-referrer" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-on-surface">{member.name}</h5>
                                    <span className="text-[10px] px-2 py-0.5 bg-secondary/10 text-secondary rounded-full font-bold">{member.relationship}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-xs text-outline/60">{member.phone || '暂无电话'}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full">
                                      <FileText className="w-2.5 h-2.5" />
                                      {member.followUpRecords.length} 条记录
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {member.ziWeiChart && (
                                  <button type="button" onClick={() => setLightboxImage(member.ziWeiChart!)} className="p-2 text-secondary hover:text-primary transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                  </button>
                                )}
                                <button type="button" onClick={() => handleEditFamilyMember(member)} className="p-2 text-secondary hover:text-primary transition-colors">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button type="button" onClick={() => handleDeleteFamilyMember(member.id)} className="p-2 text-secondary hover:text-error transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {familyMembers.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-outline-variant/20 rounded-2xl">
                              <Users className="w-12 h-12 text-outline/20 mx-auto mb-3" />
                              <p className="text-sm text-outline/40 font-medium">暂无家人信息</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>

                <div className="p-8 bg-surface-container-low border-t border-outline-variant/10 flex gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 px-6 border-2 border-outline-variant text-secondary font-headline font-bold rounded-lg hover:bg-surface-container-high transition-all"
                  >
                    取 消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 px-6 bg-primary text-on-primary font-headline font-bold rounded-lg shadow-xl shadow-primary/20 hover:bg-primary-container transition-all"
                  >
                    {initialData ? '确 认 修 改' : '确 认 新 增'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-full max-h-full overflow-hidden rounded-lg shadow-2xl"
            >
              <img 
                src={lightboxImage} 
                alt="Full Preview" 
                className="max-w-full max-h-[90vh] object-contain"
                referrerPolicy="no-referrer"
              />
              <button 
                type="button"
                onClick={() => setLightboxImage(null)}
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
