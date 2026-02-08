import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import axios from 'axios';
import UserSearch from './UserSearch';
import Profile from './Profile';
import UserProfileView from './UserProfileView';
import Notification from './Notification';
import Spam from './Spam';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Separator } from './ui/separator';

const DirectChats = ({ token, currentUser, onProfileUpdate, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [viewingSpam, setViewingSpam] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSpam, setShowSpam] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null); // For viewing other user profiles
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      const handleMessage = (msg) => {
        if (msg.chat_room_id === chatRoomId) {
          setMessages((prevMessages) => [...prevMessages, msg]);
          markMessagesAsRead(chatRoomId);
        } else {
          fetchUnreadCounts();
        }
      };

      socket.current.on('New_message', handleMessage);

      return () => {
        socket.current.off('New_message', handleMessage);
      };
    }
  }, [chatRoomId]);

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
    } catch (err) {
      console.error('Error fetching unread counts: ', err.response ? err.response.data : err.message);
    }
  };

  const startChat = async (user) => {
    setSelectedUser(user);
    setViewingSpam(false);
    setIsMobileSidebarOpen(false); // Close sidebar on mobile when selecting chat
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
    } catch (err) {
      console.error('Error fetching messages:', err.response ? err.response.data : err.message);
    }
  };

  const markMessagesAsRead = async (chat_room_id) => {
    try {
      await axios.post('http://localhost:3000/mark-messages-read', {
        chat_room_id: chat_room_id,
        user_id: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUnreadCounts();
    } catch (err) {
      console.error('Error marking messages as read: ', err.response ? err.response.data : err.message);
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
      setMessage('');
    }
  };

  const convertToLocaleTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
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

  const handleSpamChatSelected = (chatRoomId) => {
    setChatRoomId(chatRoomId);
    fetchMessages(chatRoomId);
    setViewingSpam(true);
    setIsMobileSidebarOpen(false);
  };

  const getInitials = (user) => {
    return user.username?.[0]?.toUpperCase() || '?';
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (isProfileVisible) {
    return (
      <Profile
        token={token}
        currentUser={currentUser}
        onProfileUpdate={onProfileUpdate}
        onBack={() => setIsProfileVisible(false)}
      />
    );
  }

  // Sidebar content component to avoid duplication
  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gradient">Messages</h1>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative hover:bg-purple-500/10"
              title="Notifications"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleProfileVisibility} className="hover:bg-purple-500/10" title="Profile">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSpam(!showSpam)}
                className={`hover:bg-white/10 ${showSpam ? 'text-purple-400' : 'text-muted-foreground hover:text-foreground'}`}
                title="More options"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} className="hover:bg-red-500/10 text-muted-foreground hover:text-red-400" title="Logout">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>

        <UserSearch token={token} onUserSelected={(user) => { setSearchResults([user]); startChat(user); }} />
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="p-4 border-b border-white/10 bg-white/5 animate-fade-in">
          <Notification token={token} onUserAccepted={handleUserAccepted} onUserDeclined={handleUserDeclined} />
        </div>
      )}

      {/* Spam Panel - Only show when toggled */}
      {showSpam && (
        <div className="p-4 border-b border-white/10 bg-white/5 animate-fade-in">
          <Spam
            token={token}
            onSpamChatSelected={handleSpamChatSelected}
            onUnspam={(userId) => {
              // Refresh the users list when someone is unspammed
              const fetchUsers = async () => {
                try {
                  const response = await axios.get('http://localhost:3000/direct-chats', {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setUsers(response.data);
                } catch (err) {
                  console.error('Error fetching users:', err.response ? err.response.data : err.message);
                }
              };
              fetchUsers();
            }}
          />
        </div>
      )}

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {viewingSpam ? 'Spam' : 'Conversations'}
          </p>
          {(searchResults.length > 0 ? searchResults : users).map((user, index) => (
            <div
              key={user.id}
              onClick={() => startChat(user)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 chat-item animate-fade-in ${selectedUser?.id === user.id
                ? 'bg-purple-500/15 border-l-2 border-purple-500'
                : 'hover:bg-white/5'
                }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative">
                <Avatar className="h-11 w-11 md:h-12 md:w-12">
                  <AvatarImage src={user.avatar ? `http://localhost:3000${user.avatar}` : undefined} />
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-foreground/90">{user.username}</p>
                <p className="text-xs text-muted-foreground truncate">Click to start chatting</p>
              </div>
              {unreadCounts[user.id] > 0 && (
                <Badge variant="glow" size="sm">{unreadCounts[user.id]}</Badge>
              )}
            </div>
          ))}
          {users.length === 0 && searchResults.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm">No conversations yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">Search for users to start chatting!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <div className="h-screen w-full bg-animated-gradient flex overflow-hidden">
      {/* Ambient background effects - hidden on mobile for performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none ambient-effect">
        <div className="absolute top-[-15%] left-[-5%] w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className={`hamburger-btn ${isMobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="text-lg font-bold text-gradient">
          {selectedUser ? selectedUser.username : 'Messages'}
        </h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={toggleProfileVisibility} className="hover:bg-purple-500/10" title="Profile">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout} className="hover:bg-red-500/10 text-muted-foreground hover:text-red-400" title="Logout">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={closeMobileSidebar}
      />

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar bg-card/95 backdrop-blur-xl flex flex-col ${isMobileSidebarOpen ? 'open' : ''} md:hidden`}>
        <SidebarContent isMobile={true} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 lg:w-96 bg-card/70 backdrop-blur-xl border-r border-white/10 flex-col relative z-10">
        <SidebarContent isMobile={false} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative z-10 mobile-full-height md:h-screen md:mt-0">
        {selectedUser ? (
          <>
            {/* Chat Header - Desktop */}
            <div className="hidden md:flex h-20 px-6 items-center border-b border-white/10 bg-card/50 backdrop-blur-xl">
              <div
                className="relative cursor-pointer group"
                onClick={() => setViewingUserId(selectedUser.id)}
                title="View profile"
              >
                <Avatar className="h-12 w-12 mr-4 transition-transform group-hover:scale-105">
                  <AvatarImage src={selectedUser.avatar ? `http://localhost:3000${selectedUser.avatar}` : undefined} />
                  <AvatarFallback>{getInitials(selectedUser)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-3 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
              </div>
              <div
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setViewingUserId(selectedUser.id)}
              >
                <p className="font-bold text-lg">{selectedUser.username}</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Active now
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.user_id === currentUser.id;
                  const showDate = index === 0 || formatDate(messages[index - 1].sent_at) !== formatDate(msg.sent_at);

                  return (
                    <div key={`${msg.user_id}-${msg.sent_at}-${index}`} className="animate-fade-in" style={{ animationDelay: `${index * 0.02}s` }}>
                      {showDate && (
                        <div className="flex justify-center my-4 md:my-6">
                          <span className="text-xs text-muted-foreground bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                            {formatDate(msg.sent_at)}
                          </span>
                        </div>
                      )}
                      <div className={`flex items-end gap-2 md:gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {!isOwnMessage && (
                          <Avatar
                            className="h-7 w-7 md:h-8 md:w-8 shrink-0 cursor-pointer transition-transform hover:scale-110"
                            onClick={() => setViewingUserId(msg.user_id)}
                            title="View profile"
                          >
                            <AvatarImage src={msg.avatar ? `http://localhost:3000${msg.avatar}` : undefined} />
                            <AvatarFallback className="text-xs">{msg.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[75%] md:max-w-[65%] message-bubble`}>
                          <div
                            className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-lg ${isOwnMessage
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md shadow-purple-500/20'
                              : 'bg-white/10 backdrop-blur-sm border border-white/10 rounded-bl-md'
                              }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                          </div>
                          <p className={`text-[10px] text-muted-foreground mt-1 md:mt-1.5 px-1 ${isOwnMessage ? 'text-right' : ''}`}>
                            {convertToLocaleTime(msg.sent_at)}
                          </p>
                        </div>
                        {isOwnMessage && (
                          <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                            <AvatarImage src={currentUser.avatar ? `http://localhost:3000${currentUser.avatar}` : undefined} />
                            <AvatarFallback className="text-xs">{currentUser.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 md:p-5 border-t border-white/10 bg-card/50 backdrop-blur-xl message-input-area md:relative md:bottom-auto md:left-auto md:right-auto safe-area-inset">
              <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                <Input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!message.trim()} size="lg" className="px-4 md:px-6">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center animate-fade-in">
              <div className="mx-auto mb-6 h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center shadow-lg shadow-purple-500/10 animate-float">
                <svg className="h-10 w-10 md:h-12 md:w-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-gradient">Select a conversation</h2>
              <p className="text-muted-foreground max-w-sm text-sm md:text-base">Choose from your existing conversations or search for friends to start a new one</p>
              <Button
                variant="outline"
                className="mt-6 md:hidden"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Open Conversations
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile View Modal */}
      {viewingUserId && (
        <UserProfileView
          token={token}
          userId={viewingUserId}
          onClose={() => setViewingUserId(null)}
        />
      )}
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
  onLogout: PropTypes.func.isRequired,
};

export default DirectChats;

