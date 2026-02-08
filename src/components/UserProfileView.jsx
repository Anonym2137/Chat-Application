import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";

const UserProfileView = ({ token, userId, onClose, onUserBlocked }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const [blockSuccess, setBlockSuccess] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3000/profile/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(response.data);
            } catch (err) {
                console.error('Error fetching profile: ', err.response ? err.response.data : err.message);
                setError('Could not load user profile');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [token, userId]);

    const handleBlockUser = async () => {
        try {
            setBlocking(true);
            await axios.post('http://localhost:3000/decline-user',
                { user_id: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBlockSuccess(true);
            setShowBlockConfirm(false);
            // Call callback to refresh the UI if provided
            if (onUserBlocked) {
                setTimeout(() => {
                    onUserBlocked(userId);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            console.error('Error blocking user: ', err.response ? err.response.data : err.message);
            setError('Failed to block user. Please try again.');
            setShowBlockConfirm(false);
        } finally {
            setBlocking(false);
        }
    };

    const getInitials = () => {
        if (!profile) return '?';
        const first = profile.name?.[0] || '';
        const last = profile.surname?.[0] || '';
        return (first + last).toUpperCase() || profile.username?.[0]?.toUpperCase() || '?';
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                <Card className="w-full max-w-md mx-4 bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="spinner h-8 w-8 mx-auto mb-4" />
                            <p className="text-muted-foreground">Loading profile...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error && !profile) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                <Card className="w-full max-w-md mx-4 bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl">
                    <CardContent className="py-8 text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                            <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-muted-foreground mb-4">{error || 'User not found'}</p>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Block confirmation dialog
    if (showBlockConfirm) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
                <Card className="w-full max-w-sm bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in-scale">
                    <CardContent className="py-8 text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                            <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold mb-2">Block {profile?.username}?</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            They won't be able to send you messages. This action can be undone from the spam section.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowBlockConfirm(false)}
                                disabled={blocking}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleBlockUser}
                                disabled={blocking}
                            >
                                {blocking ? (
                                    <>
                                        <div className="spinner h-4 w-4 mr-2" />
                                        Blocking...
                                    </>
                                ) : (
                                    'Block User'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in-scale">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>
                    <div className="flex flex-col items-center -mt-4">
                        <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-purple-500/30 mb-4">
                            <AvatarImage src={profile.avatar ? `http://localhost:3000${profile.avatar}` : undefined} />
                            <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl md:text-3xl font-bold">
                            {profile.name} {profile.surname}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">@{profile.username}</CardDescription>
                    </div>
                </CardHeader>

                <Separator className="opacity-50" />

                <CardContent className="pt-6 space-y-4">
                    {/* Success Message */}
                    {blockSuccess && (
                        <Alert className="border-green-500/50 bg-green-500/10 animate-fade-in">
                            <AlertDescription className="text-green-400 flex items-center gap-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                User blocked successfully
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive" className="animate-fade-in">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Bio */}
                    {profile.note && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
                            <p className="text-sm text-foreground/90 leading-relaxed">{profile.note}</p>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Username</p>
                                <p className="text-sm font-medium">{profile.username}</p>
                            </div>
                        </div>

                        {profile.email && (
                            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                                <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                    <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium">{profile.email}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                            onClick={() => setShowBlockConfirm(true)}
                            disabled={blockSuccess}
                        >
                            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Block
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

UserProfileView.propTypes = {
    token: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    onUserBlocked: PropTypes.func, // Optional callback when user is blocked
};

export default UserProfileView;

