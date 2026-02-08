import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";

const Profile = ({ token, currentUser, onProfileUpdate, onBack }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(currentUser.email);
  const [name, setName] = useState(currentUser.name);
  const [surname, setSurname] = useState(currentUser.surname);
  const [note, setNote] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(currentUser.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/profile/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { username, email, name, surname, note, avatar } = response.data;
        setUsername(username);
        setEmail(email);
        setName(name);
        setSurname(surname);
        setNote(note || '');
        setPreview(avatar || '');
      } catch (err) {
        console.error('Error fetching profile: ', err.response ? err.response.data : err.message);
        setError('Error fetching profile information');
      }
    };

    fetchUserProfile();
  }, [token, currentUser.id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('id', currentUser.id);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('name', name);
    formData.append('surname', surname);
    formData.append('note', note);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      const response = await axios.put('http://localhost:3000/update-profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Profile updated successfully');
      onProfileUpdate({ username, email, name, surname, note, avatar: response.data.avatar });
      setPassword('');
    } catch (err) {
      console.error('Error updating profile: ', err.response ? err.response.data : err.message);
      setError('Error updating profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getInitials = () => {
    const first = name?.[0] || '';
    const last = surname?.[0] || '';
    return (first + last).toUpperCase() || username?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 md:p-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-3 md:mb-4 text-muted-foreground hover:text-foreground">
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Chats
        </Button>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in">
          <CardHeader className="text-center pb-2 px-4 md:px-6">
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary/20">
                  <AvatarImage src={preview ? `http://localhost:3000${preview}` : undefined} />
                  <AvatarFallback className="text-xl md:text-2xl bg-primary/10">{getInitials()}</AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold">{name} {surname}</CardTitle>
              <CardDescription>@{username}</CardDescription>
            </div>
          </CardHeader>

          <Separator className="my-2" />

          <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-500/50 bg-green-500/10">
                <AlertDescription className="text-green-500">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Last Name</Label>
                  <Input
                    id="surname"
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Bio</Label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write something about yourself..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

Profile.propTypes = {
  token: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    email: PropTypes.string,
    name: PropTypes.string,
    surname: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  onProfileUpdate: PropTypes.func.isRequired,
  onBack: PropTypes.func,
};

export default Profile;