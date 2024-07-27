import React, { useState } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

const ResetPassword = ({ onResetSuccess = () => { } }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/reset-password', { email });
      setSuccess(response.data.message);
      setError('');
      setEmail('');
    }
    catch (err) {
      setError('Error resetting password');
      setSuccess('');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3000/reset-password/${token}`, { password });
      setSuccess(response.data.message);
      setError('');
      setPassword('');
      onResetSuccess();
    }
    catch (err) {
      setError('Error resetting password');
      setSuccess('');
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      {token ? (
        <form onSubmit={handlePasswordReset}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your new password" />
          <button type="submit">Reset Password</button>
        </form>
      ) : (
        <form onSubmit={handleResetRequest}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" />
          <button type="submit">Send Reset Link</button>
        </form>
      )}
    </div>
  );
};

ResetPassword.propTypes = {
  onResetSuccess: PropTypes.func.isRequired,
};

export default ResetPassword; 