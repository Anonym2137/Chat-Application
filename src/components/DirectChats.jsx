import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import axios from 'axios';
import UserSearch from './UserSearch';
import Profile from './Profile';
import Notification from './Notification';

const DirectChats = ({ token, currentUser, onProfileUpdate }) => {
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:3000', {
      auth: { token }
    });

    socket.current.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {
      socket.current.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (chatRoomId) {
      socket.current.emit('joinRoom', chatRoomId);
      console.log('Joined room:', chatRoomId);

      const handleMessage = (msg) => {
        console.log('New message received:', msg);
        if (msg.chat_room_id === chatRoomId) {
          setMessages((prevMessages) => [...prevMessages, msg]);
          markMessagesAsRead(chatRoomId);
        }
        else {
          fetchUnreadCounts();
        }
      };

      socket.current.on('New_message', handleMessage);

      return () => {
        socket.current.off('New_message', handleMessage);
      };
    }
  }, [chatRoomId])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/direct-chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
        fetchUnreadCounts();
      } catch (err) {
        console.error('Error fetching users:', err.response ? err.response.data : err.message);
      }
    };

    fetchUsers();
  }, [token]);

  const fetchUnreadCounts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/unread-messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const counts = response.data.reduce((acc, item) => {
        acc[item.user_id] = item.unread_count;
        return acc;
      }, {});
      setUnreadCounts(counts);
    }
    catch (err) {
      console.error('Error fetching unread counts: ', err.response ? err.response.data : err.message);
    }
  };

  const startChat = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.post(
        'http://localhost:3000/create-user-chatroom',
        { user_id: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatRoomId(response.data.chat_room_id);
      fetchMessages(response.data.chat_room_id);
      markMessagesAsRead(response.data.chat_room_id);
      socket.current.emit('joinRoom', response.data.chat_room_id);
      console.log('Joined room:', response.data.chat_room_id);
    } catch (err) {
      console.error('Error creating chat room:', err.response ? err.response.data : err.message);
    }
  };

  const fetchMessages = async (chat_room_id) => {
    try {
      const response = await axios.get(`http://localhost:3000/user-messages/${chat_room_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      console.log('Fetched messages:', response.data);
    } catch (err) {
      console.error('Error fetching messages:', err.response ? err.response.data : err.message);
    }
  };

  const markMessagesAsRead = async (chat_room_id) => {
    try {
      console.log(chat_room_id)
      await axios.post('http://localhost:3000/mark-messages-read', {
        chat_room_id: chat_room_id,
        user_id: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUnreadCounts();
    }
    catch (err) {
      console.error('Error making messages as read: ', err.response ? err.response.data : err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && chatRoomId) {
      const sentAt = new Date().toISOString();
      const msg = {
        chat_room_id: chatRoomId,
        user_id: currentUser.id,
        username: currentUser.username,
        message,
        sent_at: sentAt,
        avatar: currentUser.avatar,
      };
      socket.current.emit('chatMessage', msg);
      console.log('Sent message:', msg);
      setMessage('');
    }
  };

  const convertToLocaleTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const toggleProfileVisibility = () => {
    setIsProfileVisible(!isProfileVisible);
  };

  const handleUserAccepted = (userId) => {
    const user = searchResults.find((user) => user.id === userId);
    if (user) {
      setUsers((prevUsers) => [...prevUsers, user]);
      setSearchResults((prevResults) => prevResults.filter((u) => u.id !== userId));
    }
  };

  const handleUserDeclined = (userId) => {
    setSearchResults((prevResults) => prevResults.filter((user) => user.id !== userId));
  };

  return (
    <div className="direct-chats-container">
      {isProfileVisible ? (
        <Profile token={token} currentUser={currentUser} onProfileUpdate={onProfileUpdate} />
      ) : (
        <>
          <Notification token={token} onUserAccepted={handleUserAccepted} onUserDeclined={handleUserDeclined} />
          <UserSearch token={token} onUserSelected={(user) => { setSearchResults([user]); startChat(user); }} />

          <div className="users-list">
            <h3>Direct Chats</h3>
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div key={user.id}>
                  <span onClick={() => startChat(user)}>
                    {user.username}
                    {unreadCounts[user.id] && (
                      <span className='unread-count'> ({unreadCounts[user.id]})</span>
                    )}
                  </span>
                </div>
              ))
            ) : (
              users.map((user) => (
                <div key={user.id}>
                  <span onClick={() => startChat(user)}>
                    {user.username}
                    {unreadCounts[user.id] && (
                      <span className='unread-count'> ({unreadCounts[user.id]})</span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
          {selectedUser && (
            <div className="chat-room">
              <h3>Chat with {selectedUser.username}</h3>
              <div className="messages-list">
                {messages.map((msg, index) => (
                  <div key={`${msg.user_id}-${msg.sent_at}-${index}`}>
                    <img src={msg.avatar || '../uploads/default-avatar.png'} alt="Avatar" width="40" />
                    <strong>{msg.username}:</strong> {msg.message}
                    <br />
                    <small>{convertToLocaleTime(msg.sent_at)}</small>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          )}
        </>
      )}
      <button onClick={toggleProfileVisibility}>
        {isProfileVisible ? 'Go to Chats' : 'Edit Profile'}
      </button>
    </div>
  );
};

DirectChats.propTypes = {
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
};

export default DirectChats;
