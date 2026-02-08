import React, { useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

function Login({ onLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/login', { username, password });
      const { token, user } = response.data;
      if (token && user) {
        onLogin(token, user);
      } else {
        setError('Unexpected error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err.message);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-animated-gradient p-4 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[150px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 animate-fade-in-scale glow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto mb-2 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-float">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <CardDescription className="text-base">Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground/90">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner h-4 w-4 mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-5 pt-2">
          <div className="text-sm text-muted-foreground text-center">
            <Link to="/reset-password" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
              Forgot your password?
            </Link>
          </div>
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>
          </div>
          <div className="w-full text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Don't have an account?
            </p>
            <Button variant="outline" className="w-full" size="lg" onClick={onRegister}>
              Create Account
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
};

export default Login;
