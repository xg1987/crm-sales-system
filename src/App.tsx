import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { CustomerProvider } from './context/CustomerContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesTechniques from './pages/SalesTechniques';
import Management from './pages/Management';
import Profile from './pages/Profile';
import Settings from './pages/profile/Settings';
import ArchiveManagement from './pages/profile/ArchiveManagement';
import FollowUpRecords from './pages/profile/FollowUpRecords';
import SalesStats from './pages/profile/SalesStats';

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
              <Route path="sales-techniques" element={<SalesTechniques />} />
              <Route path="management" element={<Management />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/settings" element={<Settings />} />
              <Route path="profile/archive" element={<ArchiveManagement />} />
              <Route path="profile/records" element={<FollowUpRecords />} />
              <Route path="profile/stats" element={<SalesStats />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CustomerProvider>
    </UserProvider>
  );
}
