import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function Notification({ token, onUserAccepted, onUserDeclined }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3000/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
      }
      catch (err) {
        console.error('Error fetching notifications: ', err.reponse ? err.response.data : err.message);
      }
    };
    fetchNotifications();
  }, [token]);

  const handleAccept = async (userId) => {
    try {
      await axios.post('http://localhost:3000/accept-user', { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUserAccepted(userId);
    }
    catch (err) {
      console.error('Error accepting user: ', err.response ? err.reponse.data : err.message);
    }
  };

  const handleDecline = async (userId) => {
    try {
      await axios.post('http://localhost:3000/decline-user', { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onUserDeclined(userId);
    }
    catch (err) {
      console.error('Error declining user: ', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className='notification-container'>
      <h3>Notifications</h3>
      {notifications.map((user) => {
        <div key={user.id}>
          <span>{user.username}</span>
          <button onClick={() => handleAccept(user.id)}>Accept</button>
          <button onClick={() => handleDecline(user.id)}>Decline</button>
        </div>
      })}
    </div>
  );
};

Notification.propTypes = {
  token: PropTypes.string.isRequired,
  onUserAccepted: PropTypes.func.isRequired,
  onUserDeclined: PropTypes.func.isRequired,
};

export default Notification;