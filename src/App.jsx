import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import DirectChats from './components/DirectChats';
import UserSearch from './components/UserSearch';
import Register from './components/Register';
import axios from 'axios';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';

function App() {
  const [token, setToken] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const handleLogin = async (token, user) => {
    console.log('Setting token and user: ', token, user);
    setToken(token);
    setCurrentUser(user);
  };

  const handleRegisterToggle = () => {
    setIsRegistering(!isRegistering);
  };

  const handleRegisterSuccess = (token, user) => {
    console.log('Register success: ', token, user);
    setToken(token);
    setCurrentUser(user);
    setIsRegistering(false);
  };

  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser((prevUser) => ({ ...prevUser, ...updatedUser }));
  };

  const toggleProfileVisibility = () => {
    setIsProfileVisible(!isProfileVisible);
  }

  return (
    <div className='App'>
      <Routes>
        <Route path='reset-password' element={<ResetPassword />} />
        <Route path='/' element={
          token ? (
            currentUser ? (
              isProfileVisible ? (
                <Profile token={token} currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
              ) : (
                <DirectChats token={token} currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
              )
            ) : (
              <p>Loading user data...</p>
            )
          ) : (
            isRegistering ? (
              <Register onRegisterSuccess={handleRegisterSuccess} />
            ) : (
              <Login onLogin={handleLogin} onRegister={handleRegisterToggle} />
            )
          )
        }
        />
      </Routes>
    </div>
  );
};

export default App
