import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, ArrowRight, LayoutDashboard, User, Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useUser();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        const result = await login(phone, password);
        if (result.success) {
          navigate(from, { replace: true });
        } else {
          setError(result.error || '账号或密码错误，请检查后重试。');
        }
      } else {
        if (!name.trim()) {
          setError('请输入姓名');
          setIsSubmitting(false);
          return;
        }
        const result = await register(phone, password, name);
        if (result.success) {
          // Auto login after successful registration
          const loginResult = await login(phone, password);
          if (loginResult.success) {
            navigate(from, { replace: true });
          } else {
            setError(loginResult.error || '注册成功，但自动登录失败，请手动登录。');
            setIsLoginMode(true);
          }
        } else {
          setError(result.error || '该手机号已被注册。');
        }
      }
    } catch (err: any) {
      setError(err.message || '发生未知错误，请重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md flex items-center px-8 h-20">
        <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        
        <h1 className="absolute left-1/2 -translate-x-1/2 font-headline font-bold text-2xl tracking-tight text-primary">
          一宸国学文化
        </h1>

        <nav className="hidden md:flex space-x-10 ml-auto">
          <button className="font-label text-sm uppercase tracking-widest text-primary font-bold">传承</button>
          <button className="font-label text-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors">讲堂</button>
          <button className="font-label text-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors">管理</button>
          <button className="font-label text-sm uppercase tracking-widest text-secondary hover:text-primary transition-colors">个人中心</button>
        </nav>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-20 pb-12 ink-wash-bg relative overflow-hidden">
        <div className="absolute top-20 right-[-5%] opacity-10 pointer-events-none">
          <img 
            className="w-[600px] h-auto grayscale" 
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200" 
            alt="Decorative Landscape"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="w-full max-w-md z-10">
          <div className="bg-surface-container-low/60 backdrop-blur-xl p-10 md:p-12 rounded-xl shadow-[0_30px_60px_-15px_rgba(28,28,21,0.08)]">
            <div className="mb-12 text-center md:text-left">
              <h2 className="text-4xl font-black text-on-surface mb-2 tracking-tight font-headline">
                {isLoginMode ? 'CRM 系统登录' : '创建新账号'}
              </h2>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium">
                {error}
              </div>
            )}

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-6">
                {!isLoginMode && (
                  <div className="relative group">
                    <label className="block font-label text-xs font-bold text-secondary uppercase tracking-widest mb-2 px-1">姓名</label>
                    <input 
                      className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all px-4 py-3 font-body text-on-surface placeholder:text-outline/40" 
                      placeholder="请输入真实姓名" 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLoginMode}
                    />
                  </div>
                )}
                <div className="relative group">
                  <label className="block font-label text-xs font-bold text-secondary uppercase tracking-widest mb-2 px-1">账号 / 手机号</label>
                  <input 
                    className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all px-4 py-3 font-body text-on-surface placeholder:text-outline/40" 
                    placeholder="请输入手机号" 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="relative group">
                  <label className="block font-label text-xs font-bold text-secondary uppercase tracking-widest mb-2 px-1">密码</label>
                  <input 
                    className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all px-4 py-3 font-body text-on-surface placeholder:text-outline/40" 
                    placeholder={isLoginMode ? "请输入密码" : "请设置密码"} 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-3 bottom-3 text-secondary/40 hover:text-primary transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLoginMode && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center group cursor-pointer">
                    <input className="w-4 h-4 rounded-sm border-outline-variant text-primary focus:ring-primary/20 cursor-pointer" type="checkbox" />
                    <span className="ml-3 font-label text-xs text-secondary group-hover:text-primary transition-colors">记住账号</span>
                  </label>
                  <button type="button" className="font-label text-xs text-secondary hover:text-primary underline underline-offset-4 decoration-outline-variant hover:decoration-primary transition-all">忘记密码？</button>
                </div>
              )}

              <button 
                className="w-full py-4 px-6 bg-primary text-on-primary font-headline text-lg font-bold rounded-lg shadow-xl shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center space-x-3 group disabled:opacity-70 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLoginMode ? '登 录' : '注 册 并 登 录'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-outline-variant/30 text-center">
              <p className="font-label text-sm text-secondary mb-6">
                {isLoginMode ? '尚无账号？' : '已有账号？'}
              </p>
              <button 
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                }}
                className="w-full py-4 px-6 border-2 border-outline-variant text-primary font-headline font-bold rounded-lg hover:bg-surface-container-high transition-all"
              >
                {isLoginMode ? '创 建 新 账 号' : '返 回 登 录'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="md:hidden">
        <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-4 pb-safe bg-background/90 backdrop-blur-xl border-t border-red-900/10 z-50 shadow-[0_-4px_30px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col items-center justify-center text-stone-500">
            <LayoutDashboard className="w-6 h-6" />
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">管理</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-red-900 text-white rounded-full px-4 py-1">
            <User className="w-6 h-6" />
            <span className="font-label text-[10px] uppercase tracking-widest mt-1">个人中心</span>
          </div>
        </nav>
      </footer>
    </div>
  );
}
