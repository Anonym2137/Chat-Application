/**
 * Profile Component
 * View and edit user's own profile
 */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { userApi } from '../services/api';
import { getAssetUrl } from '../config/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { ArrowLeftIcon, CameraIcon } from './ui/icons';
import { Spinner } from './ui/shared';
import { getInitials } from '../utils/formatters';

const Profile = ({ token, currentUser, onProfileUpdate, onBack }) => {
  const [formData, setFormData] = useState({
    username: currentUser.username || '',
    password: '',
    email: currentUser.email || '',
    name: currentUser.name || '',
    surname: currentUser.surname || '',
    note: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(currentUser.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await userApi.getProfile(currentUser.id, token);
      setFormData({
        username: data.username || '',
        password: '',
        email: data.email || '',
        name: data.name || '',
        surname: data.surname || '',
        note: data.note || '',
      });
      setPreview(data.avatar || '');
    } catch (err) {
      setError('Error fetching profile information');
    }
  }, [token, currentUser.id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const submitData = new FormData();
    submitData.append('id', currentUser.id);
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    if (avatar) {
      submitData.append('avatar', avatar);
    }

    try {
      const response = await userApi.updateProfile(submitData, token);
      setSuccess('Profile updated successfully');
      onProfileUpdate({
        ...formData,
        avatar: response.avatar,
      });
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
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

  const userInitials = getInitials({ ...formData, username: formData.username });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 md:p-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-3 md:mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Chats
        </Button>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in">
          <CardHeader className="text-center pb-2 px-4 md:px-6">
            <div className="flex flex-col items-center">
              <div className="relative group mb-4">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary/20">
                  <AvatarImage
                    src={preview.startsWith('blob:') ? preview : getAssetUrl(preview)}
                  />
                  <AvatarFallback className="text-xl md:text-2xl bg-primary/10">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <CameraIcon className="h-6 w-6 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              </div>
              <CardTitle className="text-xl md:text-2xl font-bold">
                {formData.name} {formData.surname}
              </CardTitle>
              <CardDescription>@{formData.username}</CardDescription>
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
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Last Name</Label>
                  <Input
                    id="surname"
                    type="text"
                    value={formData.surname}
                    onChange={handleChange}
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
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Bio</Label>
                <textarea
                  id="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Write something about yourself..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
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