import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AmbientBackground, Spinner } from './ui/shared';
import { ChatIcon, ExclamationCircleIcon } from './ui/icons';

export default function Login({ onLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await authApi.login(username, password);
      if (token && user) onLogin(token, user);
      else setError('Unexpected error occurred. Please try again.');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-animated-gradient p-4 overflow-hidden">
      <AmbientBackground />
      <Card className="w-full max-w-md relative z-10 animate-fade-in-scale glow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto mb-2 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 animate-float">
            <ChatIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Welcome back</CardTitle>
          <CardDescription className="text-base">Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <ExclamationCircleIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground/90">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
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
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Spinner className="h-4 w-4 mr-2" />Signing in...</> : 'Sign In'}
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
            <p className="text-sm text-muted-foreground mb-3">Don't have an account?</p>
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
  onRegister: PropTypes.func.isRequired
};
