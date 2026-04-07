import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { CustomerProvider } from './context/CustomerContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const SalesTechniques = lazy(() => import('./pages/SalesTechniques'));
const Management = lazy(() => import('./pages/Management'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const ArchiveManagement = lazy(() => import('./pages/profile/ArchiveManagement'));
const FollowUpRecords = lazy(() => import('./pages/profile/FollowUpRecords'));
const SalesStats = lazy(() => import('./pages/profile/SalesStats'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useUser();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-primary">加载中...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-primary">加载中...</div>}>{children}</Suspense>;
}

export default function App() {
  return (
    <UserProvider>
      <CustomerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="sales-techniques" element={<LazyPage><SalesTechniques /></LazyPage>} />
              <Route path="management" element={<LazyPage><Management /></LazyPage>} />
              <Route path="profile" element={<LazyPage><Profile /></LazyPage>} />
              <Route path="profile/settings" element={<LazyPage><Settings /></LazyPage>} />
              <Route path="profile/archive" element={<LazyPage><ArchiveManagement /></LazyPage>} />
              <Route path="profile/records" element={<LazyPage><FollowUpRecords /></LazyPage>} />
              <Route path="profile/stats" element={<LazyPage><SalesStats /></LazyPage>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CustomerProvider>
    </UserProvider>
  );
}
