import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { userApi, notificationApi } from '../services/api';
import { getAssetUrl } from '../config/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
    CloseIcon,
    BlockIcon,
    ArrowLeftIcon,
    UserIcon,
    MailIcon,
    CheckIcon
} from './ui/icons';
import { ModalOverlay, LoadingCard, ErrorCard, Spinner } from './ui/shared';
import { getInitials } from '../utils/formatters';

const UserProfileView = ({ token, userId, onClose, onUserBlocked }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [blocking, setBlocking] = useState(false);
    const [blockSuccess, setBlockSuccess] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true);
            const data = await userApi.getProfile(userId, token);
            setProfile(data);
        } catch (err) {
            setError('Could not load user profile');
        } finally {
            setLoading(false);
        }
    }, [token, userId]);

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [fetchUserProfile, userId]);

    const handleBlockUser = async () => {
        try {
            setBlocking(true);
            await notificationApi.declineUser(userId, token);
            setBlockSuccess(true);
            setShowBlockConfirm(false);

            if (onUserBlocked) {
                setTimeout(() => {
                    onUserBlocked(userId);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            setError('Failed to block user. Please try again.');
            setShowBlockConfirm(false);
        } finally {
            setBlocking(false);
        }
    };

    const userInitials = getInitials(profile);

    // Loading state
    if (loading) {
        return (
            <ModalOverlay>
                <LoadingCard message="Loading profile..." />
            </ModalOverlay>
        );
    }

    // Error state without profile
    if (error && !profile) {
        return (
            <ModalOverlay>
                <ErrorCard message={error || 'User not found'} onClose={onClose} />
            </ModalOverlay>
        );
    }

    // Block confirmation dialog
    if (showBlockConfirm) {
        return (
            <ModalOverlay>
                <Card className="w-full max-w-sm bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in-scale">
                    <CardContent className="py-8 text-center">
                        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center">
                            <BlockIcon className="h-8 w-8 text-red-400" />
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
                                        <Spinner className="h-4 w-4 mr-2" />
                                        Blocking...
                                    </>
                                ) : (
                                    'Block User'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </ModalOverlay>
        );
    }

    // Main profile view
    return (
        <ModalOverlay>
            <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl animate-fade-in-scale">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-end">
                        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
                            <CloseIcon />
                        </Button>
                    </div>
                    <div className="flex flex-col items-center -mt-4">
                        <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-purple-500/30 mb-4">
                            <AvatarImage src={getAssetUrl(profile.avatar)} />
                            <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                                {userInitials}
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
                                <CheckIcon className="h-4 w-4" />
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
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                About
                            </h4>
                            <p className="text-sm text-foreground/90 leading-relaxed">{profile.note}</p>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 gap-3">
                        <InfoRow
                            icon={<UserIcon className="h-5 w-5 text-purple-400" />}
                            iconBg="bg-purple-500/20"
                            label="Username"
                            value={profile.username}
                        />
                        {profile.email && (
                            <InfoRow
                                icon={<MailIcon className="h-5 w-5 text-indigo-400" />}
                                iconBg="bg-indigo-500/20"
                                label="Email"
                                value={profile.email}
                            />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50"
                            onClick={() => setShowBlockConfirm(true)}
                            disabled={blockSuccess}
                        >
                            <BlockIcon className="h-4 w-4 mr-2" />
                            Block
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ModalOverlay>
    );
};

// Reusable info row component
const InfoRow = ({ icon, iconBg, label, value }) => (
    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
        <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    </div>
);

InfoRow.propTypes = {
    icon: PropTypes.node.isRequired,
    iconBg: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

UserProfileView.propTypes = {
    token: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired,
    onUserBlocked: PropTypes.func,
};

export default UserProfileView;
