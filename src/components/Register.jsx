import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { authApi } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { AmbientBackground, Spinner } from './ui/shared';
import { UserAddIcon, ExclamationCircleIcon } from './ui/icons';

export default function Register({ onRegisterSuccess, onBackToLogin }) {
  const [form, setForm] = useState({ username: '', password: '', email: '', name: '', surname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await authApi.register(form);
      onRegisterSuccess(token, user);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-animated-gradient p-4 overflow-hidden">
      <AmbientBackground />
      <Card className="w-full max-w-md relative z-10 animate-fade-in-scale glow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto mb-2 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float">
            <UserAddIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription className="text-base">Enter your details to get started</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <ExclamationCircleIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground/90">First Name</Label>
                <Input id="name" value={form.name} onChange={update('name')} required placeholder="John" autoComplete="given-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname" className="text-sm font-medium text-foreground/90">Last Name</Label>
                <Input id="surname" value={form.surname} onChange={update('surname')} required placeholder="Doe" autoComplete="family-name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={update('email')} required placeholder="john@example.com" autoComplete="email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground/90">Username</Label>
              <Input id="username" value={form.username} onChange={update('username')} required placeholder="Choose a username" autoComplete="username" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/90">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={update('password')} required placeholder="Create a password" autoComplete="new-password" />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <><Spinner className="h-4 w-4 mr-2" />Creating account...</> : 'Create Account'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-5 pt-2">
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
            <p className="text-sm text-muted-foreground mb-3">Already have an account?</p>
            <Button variant="outline" className="w-full" size="lg" onClick={onBackToLogin}>
              Sign In
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

Register.propTypes = {
  onRegisterSuccess: PropTypes.func.isRequired,
  onBackToLogin: PropTypes.func
};
