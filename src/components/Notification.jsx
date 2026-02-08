import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Card, CardContent } from './ui/card';

function Notification({ token, onUserAccepted, onUserDeclined }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3000/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
      } catch (err) {
        console.error('Error fetching notifications: ', err.response ? err.response.data : err.message);
      }
    };
    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, [token]);

  const handleAccept = async (userId) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/accept-user', { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUserAccepted(userId);
      setNotifications(notifications.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error accepting user: ', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (userId) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/decline-user', { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUserDeclined(userId);
      setNotifications(notifications.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error declining user: ', err.response ? err.response.data : err.message);
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
        <p className="text-sm text-muted-foreground text-center py-4">No new requests</p>
      ) : (
        notifications.map((user) => (
          <Card key={user.id} className="bg-background/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar ? `http://localhost:3000${user.avatar}` : undefined} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
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
}

Notification.propTypes = {
  token: PropTypes.string.isRequired,
  onUserAccepted: PropTypes.func.isRequired,
  onUserDeclined: PropTypes.func.isRequired,
};

export default Notification;