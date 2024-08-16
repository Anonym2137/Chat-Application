import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function Spam({ token, onSpamChatSelected }) {
  const [spamChats, setSpamChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSpamChats = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/spam-chats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSpamChats(response.data);
      }
      catch (err) {
        console.error('Error fetching spam chats: ', err.response ? err.response.data : err.message);
      }
      finally {
        setLoading(false);
      }
    };

    fetchSpamChats();
  }, [token]);

  return (
    <div className='spam-container'>
      <h3>Spam Chats</h3>
      {loading ? (
        <p>Loading...</p>
      ) : spamChats.length === 0 ? (
        <p>No spam chats</p>
      ) : (
        spamChats.map(chat => (
          <div key={chat.chat_room_id} className='spam-chat'>
            <span>{chat.username}</span>
            <button onClick={() => onSpamChatSelected(chat.chat_room_id)}>View Chat</button>
          </div>
        ))
      )}
    </div>
  );
}

Spam.propTypes = {
  token: PropTypes.string.isRequired,
  onSpamChatsSelected: PropTypes.func.isRequired,
};

export default Spam;
