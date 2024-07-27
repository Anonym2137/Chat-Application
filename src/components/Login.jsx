import React, { useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import ResetPassword from "./ResetPassword";
import { Link } from "react-router-dom";

function Login({ onLogin, onRegister, onResetPassword }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', { username, password });

    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      console.log('Login response: ', response.data);
      const { token, user } = response.data;
      if (token && user) {
        console.log('Extracted token and user: ', token, user);
        onLogin(token, user);
      }
      else {
        console.error('Token or user missing in response: ', response.data);
        setError('Unexpected error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Username"
        />
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={onRegister}>Register</button>
      <Link to="/reset-password">Forgot Password?</Link>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default Login;
