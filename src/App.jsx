import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import DirectChats from './components/DirectChats';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';

function ProtectedRoute({ children, token, currentUser }) {
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    token ? localStorage.setItem('token', token) : localStorage.removeItem('token');
  }, [token]);

  useEffect(() => {
    currentUser ? localStorage.setItem('currentUser', JSON.stringify(currentUser)) : localStorage.removeItem('currentUser');
  }, [currentUser]);

  const handleLogin = (t, u) => { setToken(t); setCurrentUser(u); navigate('/'); };
  const handleLogout = () => { setToken(''); setCurrentUser(null); navigate('/login'); };

  return (
    <div className="App dark">
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} onRegister={() => navigate('/register')} />} />
        <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register onRegisterSuccess={handleLogin} onBackToLogin={() => navigate('/login')} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute token={token} currentUser={currentUser}>
            <DirectChats token={token} currentUser={currentUser} onProfileUpdate={u => setCurrentUser(prev => ({ ...prev, ...u }))} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute token={token} currentUser={currentUser}>
            <Profile token={token} currentUser={currentUser} onProfileUpdate={u => setCurrentUser(prev => ({ ...prev, ...u }))} onBack={() => navigate('/')} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
