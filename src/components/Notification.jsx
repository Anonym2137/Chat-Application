/**
 * Notification Component
 * Displays incoming chat requests from other users
 */
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { notificationApi } from '../services/api';
import { getAssetUrl } from '../config/api';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { getInitials } from '../utils/formatters';

const REFRESH_INTERVAL = 60000; // 1 minute

const Notification = ({ token, onUserAccepted, onUserDeclined }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getNotifications(token);
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications');
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const handleAccept = async (userId) => {
    setLoading(true);
    try {
      await notificationApi.acceptUser(userId, token);
      onUserAccepted(userId);
      setNotifications((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Error accepting user');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (userId) => {
    setLoading(true);
    try {
      await notificationApi.declineUser(userId, token);
      onUserDeclined(userId);
      setNotifications((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      console.error('Error declining user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Message Requests
      </h3>

      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No new requests
        </p>
      ) : (
        notifications.map((user) => (
          <Card key={user.id} className="bg-background/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getAssetUrl(user.avatar)} />
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground">Wants to chat with you</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAccept(user.id)}
                  disabled={loading}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDecline(user.id)}
                  disabled={loading}
                >
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

Notification.propTypes = {
  token: PropTypes.string.isRequired,
  onUserAccepted: PropTypes.func.isRequired,
  onUserDeclined: PropTypes.func.isRequired,
};

export default Notification;