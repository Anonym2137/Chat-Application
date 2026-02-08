import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

const Register = ({ onRegisterSuccess, onBackToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/register', { username, password, email, name, surname });
      const { token, user } = response.data;
      onRegisterSuccess(token, user);
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-animated-gradient p-4 overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute top-[50%] left-[15%] w-[300px] h-[300px] bg-pink-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <Card className="w-full max-w-md relative z-10 animate-fade-in-scale glow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto mb-2 h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-3xl">Create Account</CardTitle>
          <CardDescription className="text-base">Enter your details to get started</CardDescription>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground/90">First Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="John"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname" className="text-sm font-medium text-foreground/90">Last Name</Label>
                <Input
                  id="surname"
                  type="text"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/90">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground/90">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
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
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner h-4 w-4 mr-2" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
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
            <p className="text-sm text-muted-foreground mb-3">
              Already have an account?
            </p>
            <Button variant="outline" className="w-full" size="lg" onClick={onBackToLogin}>
              Sign In
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

Register.propTypes = {
  onRegisterSuccess: PropTypes.func.isRequired,
  onBackToLogin: PropTypes.func,
};

export default Register;
