import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import DirectChats from './components/DirectChats';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';

// Protected Route wrapper
function ProtectedRoute({ children, token, currentUser }) {
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const navigate = useNavigate();

  // Persist auth state
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleLogin = async (token, user) => {
    setToken(token);
    setCurrentUser(user);
    navigate('/');
  };

  const handleRegisterSuccess = (token, user) => {
    setToken(token);
    setCurrentUser(user);
    navigate('/');
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser((prevUser) => ({ ...prevUser, ...updatedUser }));
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <div className="App dark">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Login
                onLogin={handleLogin}
                onRegister={() => navigate('/register')}
              />
            )
          }
        />
        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/" replace />
            ) : (
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                onBackToLogin={() => navigate('/login')}
              />
            )
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute token={token} currentUser={currentUser}>
              <DirectChats
                token={token}
                currentUser={currentUser}
                onProfileUpdate={handleProfileUpdate}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute token={token} currentUser={currentUser}>
              <Profile
                token={token}
                currentUser={currentUser}
                onProfileUpdate={handleProfileUpdate}
                onBack={() => navigate('/')}
              />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
