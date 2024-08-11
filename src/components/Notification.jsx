import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

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
      }
      catch (err) {
        console.error('Error fetching notifications: ', err.response ? err.response.data : err.message);
      }
    };
    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 1800000);

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
    }
    catch (err) {
      console.error('Error accepting user: ', err.response ? err.response.data : err.message);
    }
    finally {
      setLoading(false);
    }
  };

  const handleDecline = async (userId) => {
    try {
      await axios.post('http://localhost:3000/decline-user', { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUserDeclined(userId);
      setNotifications(notifications.filter(user => user.id !== userId));
    }
    catch (err) {
      console.error('Error declining user: ', err.response ? err.response.data : err.message);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className='notification-container'>
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        notifications.map((user) => (
          <div key={user.id}>
            <span>{user.username}</span>
            <button onClick={() => handleAccept(user.id)} disabled={loading} >Accept</button>
            <button onClick={() => handleDecline(user.id)} disabled={loading} >Decline</button>
          </div>
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