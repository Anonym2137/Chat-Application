import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { chatApi } from '../services/api';
import { SOCKET_URL, getAssetUrl } from '../config/api';
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
import { BellIcon, UserIcon, DotsVerticalIcon, LogoutIcon, SendIcon, ChatIcon, MenuIcon } from './ui/icons';
import { ChatAmbientBackground, OnlineIndicator } from './ui/shared';
import { getInitials, formatTime, formatDate, isDifferentDate } from '../utils/formatters';

export default function DirectChats({ token, currentUser, onProfileUpdate, onLogout }) {
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
  const [viewingUserId, setViewingUserId] = useState(null);

  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => scrollToBottom(), [messages, scrollToBottom]);

  useEffect(() => {
    socket.current = io(SOCKET_URL, { auth: { token } });
    return () => socket.current.disconnect();
  }, [token]);

  useEffect(() => {
    if (!chatRoomId) return;
    socket.current.emit('joinRoom', chatRoomId);

    const onMessage = (msg) => {
      if (msg.chat_room_id === chatRoomId) {
        setMessages(prev => [...prev, msg]);
        markAsRead(chatRoomId);
      } else {
        fetchUnread();
      }
    };

    socket.current.on('New_message', onMessage);
    return () => socket.current.off('New_message', onMessage);
  }, [chatRoomId]);

  useEffect(() => { fetchUsers(); }, [token]);

  async function fetchUsers() {
    try {
      const data = await chatApi.getDirectChats(token);
      setUsers(data);
      fetchUnread();
    } catch (e) { console.error('Failed to fetch users'); }
  }

  async function fetchUnread() {
    try {
      setUnreadCounts(await chatApi.getUnreadCounts(token));
    } catch (e) { console.error('Failed to fetch unread'); }
  }

  async function fetchMessages(roomId) {
    try {
      setMessages(await chatApi.getMessages(roomId, token));
    } catch (e) { console.error('Failed to fetch messages'); }
  }

  async function markAsRead(roomId) {
    try {
      await chatApi.markMessagesAsRead(roomId, currentUser.id, token);
      fetchUnread();
    } catch (e) { console.error('Failed to mark as read'); }
  }

  async function startChat(user) {
    setSelectedUser(user);
    setViewingSpam(false);
    setIsMobileSidebarOpen(false);
    try {
      const { chat_room_id } = await chatApi.createChatRoom(user.id, token);
      setChatRoomId(chat_room_id);
      fetchMessages(chat_room_id);
      markAsRead(chat_room_id);
      socket.current.emit('joinRoom', chat_room_id);
    } catch (e) { console.error('Failed to start chat'); }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!message.trim() || !chatRoomId) return;
    socket.current.emit('chatMessage', {
      chat_room_id: chatRoomId,
      user_id: currentUser.id,
      username: currentUser.username,
      message,
      sent_at: new Date().toISOString(),
      avatar: currentUser.avatar
    });
    setMessage('');
  }

  function handleUserAccepted(userId) {
    const user = searchResults.find(u => u.id === userId);
    if (user) {
      setUsers(prev => [...prev, user]);
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    }
  }

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

  const chatList = searchResults.length > 0 ? searchResults : users;

  return (
    <div className="h-screen w-full bg-animated-gradient flex overflow-hidden">
      <ChatAmbientBackground />

      {/* Mobile header */}
      <div className="mobile-header">
        <button
          className={`hamburger-btn ${isMobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
        <h1 className="text-lg font-bold text-gradient">
          {selectedUser ? selectedUser.username : 'Messages'}
        </h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIsProfileVisible(true)} className="hover:bg-purple-500/10">
            <UserIcon />
          </Button>
          <Button variant="ghost" size="icon" onClick={onLogout} className="hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
            <LogoutIcon />
          </Button>
        </div>
      </div>

      <div className={`sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`} onClick={() => setIsMobileSidebarOpen(false)} />

      {/* Mobile sidebar */}
      <div className={`mobile-sidebar bg-card/95 backdrop-blur-xl flex flex-col ${isMobileSidebarOpen ? 'open' : ''} md:hidden`}>
        <Sidebar
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showSpam={showSpam}
          setShowSpam={setShowSpam}
          setIsProfileVisible={setIsProfileVisible}
          onLogout={onLogout}
          token={token}
          onUserSelected={user => { setSearchResults([user]); startChat(user); }}
          onUserAccepted={handleUserAccepted}
          onUserDeclined={userId => setSearchResults(prev => prev.filter(u => u.id !== userId))}
          onSpamChatSelected={roomId => { setChatRoomId(roomId); fetchMessages(roomId); setViewingSpam(true); setIsMobileSidebarOpen(false); }}
          onUnspam={fetchUsers}
          viewingSpam={viewingSpam}
          chatList={chatList}
          selectedUser={selectedUser}
          unreadCounts={unreadCounts}
          startChat={startChat}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-80 lg:w-96 bg-card/70 backdrop-blur-xl border-r border-white/10 flex-col relative z-10">
        <Sidebar
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showSpam={showSpam}
          setShowSpam={setShowSpam}
          setIsProfileVisible={setIsProfileVisible}
          onLogout={onLogout}
          token={token}
          onUserSelected={user => { setSearchResults([user]); startChat(user); }}
          onUserAccepted={handleUserAccepted}
          onUserDeclined={userId => setSearchResults(prev => prev.filter(u => u.id !== userId))}
          onSpamChatSelected={roomId => { setChatRoomId(roomId); fetchMessages(roomId); setViewingSpam(true); }}
          onUnspam={fetchUsers}
          viewingSpam={viewingSpam}
          chatList={chatList}
          selectedUser={selectedUser}
          unreadCounts={unreadCounts}
          startChat={startChat}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col relative z-10 mobile-full-height md:h-screen md:mt-0">
        {selectedUser ? (
          <>
            <ChatHeader user={selectedUser} onViewProfile={() => setViewingUserId(selectedUser.id)} />
            <ScrollArea className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg, i) => (
                  <Message
                    key={`${msg.user_id}-${msg.sent_at}-${i}`}
                    msg={msg}
                    isOwn={msg.user_id === currentUser.id}
                    currentUser={currentUser}
                    showDate={i === 0 || isDifferentDate(messages[i - 1].sent_at, msg.sent_at)}
                    onViewProfile={() => setViewingUserId(msg.user_id)}
                    delay={`${i * 0.02}s`}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-3 md:p-5 border-t border-white/10 bg-card/50 backdrop-blur-xl message-input-area md:relative safe-area-inset">
              <form onSubmit={handleSend} className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
                <Input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!message.trim()} size="lg" className="px-4 md:px-6">
                  <SendIcon />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <EmptyChat onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        )}
      </div>

      {viewingUserId && (
        <UserProfileView token={token} userId={viewingUserId} onClose={() => setViewingUserId(null)} />
      )}
    </div>
  );
}

function Sidebar({ showNotifications, setShowNotifications, showSpam, setShowSpam, setIsProfileVisible, onLogout, token, onUserSelected, onUserAccepted, onUserDeclined, onSpamChatSelected, onUnspam, viewingSpam, chatList, selectedUser, unreadCounts, startChat }) {
  return (
    <>
      <div className="p-4 md:p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-gradient">Messages</h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)} className="relative hover:bg-purple-500/10"><BellIcon /></Button>
            <Button variant="ghost" size="icon" onClick={() => setIsProfileVisible(true)} className="hover:bg-purple-500/10"><UserIcon /></Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSpam(!showSpam)} className={`hover:bg-white/10 ${showSpam ? 'text-purple-400' : 'text-muted-foreground hover:text-foreground'}`}><DotsVerticalIcon /></Button>
            <Button variant="ghost" size="icon" onClick={onLogout} className="hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><LogoutIcon /></Button>
          </div>
        </div>
        <UserSearch token={token} onUserSelected={onUserSelected} />
      </div>

      {showNotifications && (
        <div className="p-4 border-b border-white/10 bg-white/5 animate-fade-in">
          <Notification token={token} onUserAccepted={onUserAccepted} onUserDeclined={onUserDeclined} />
        </div>
      )}

      {showSpam && (
        <div className="p-4 border-b border-white/10 bg-white/5 animate-fade-in">
          <Spam token={token} onSpamChatSelected={onSpamChatSelected} onUnspam={onUnspam} />
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-3">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {viewingSpam ? 'Spam' : 'Conversations'}
          </p>
          {chatList.map((user, i) => (
            <ChatItem
              key={user.id}
              user={user}
              selected={selectedUser?.id === user.id}
              unread={unreadCounts[user.id]}
              onClick={() => startChat(user)}
              delay={`${i * 0.05}s`}
            />
          ))}
          {chatList.length === 0 && <EmptyList />}
        </div>
      </ScrollArea>
    </>
  );
}

function ChatItem({ user, selected, unread, onClick, delay }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1 chat-item animate-fade-in ${selected ? 'bg-purple-500/15 border-l-2 border-purple-500' : 'hover:bg-white/5'}`}
      style={{ animationDelay: delay }}
    >
      <div className="relative">
        <Avatar className="h-11 w-11 md:h-12 md:w-12">
          <AvatarImage src={getAssetUrl(user.avatar)} />
          <AvatarFallback>{getInitials(user)}</AvatarFallback>
        </Avatar>
        <OnlineIndicator className="absolute bottom-0 right-0" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-foreground/90">{user.username}</p>
        <p className="text-xs text-muted-foreground truncate">Click to start chatting</p>
      </div>
      {unread > 0 && <Badge variant="glow" size="sm">{unread}</Badge>}
    </div>
  );
}

function ChatHeader({ user, onViewProfile }) {
  return (
    <div className="hidden md:flex h-20 px-6 items-center border-b border-white/10 bg-card/50 backdrop-blur-xl">
      <div className="relative cursor-pointer group" onClick={onViewProfile}>
        <Avatar className="h-12 w-12 mr-4 transition-transform group-hover:scale-105">
          <AvatarImage src={getAssetUrl(user.avatar)} />
          <AvatarFallback>{getInitials(user)}</AvatarFallback>
        </Avatar>
        <OnlineIndicator size="md" className="absolute bottom-0 right-3" />
      </div>
      <div className="cursor-pointer hover:opacity-80" onClick={onViewProfile}>
        <p className="font-bold text-lg">{user.username}</p>
        <p className="text-xs text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Active now
        </p>
      </div>
    </div>
  );
}

function Message({ msg, isOwn, currentUser, showDate, onViewProfile, delay }) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: delay }}>
      {showDate && (
        <div className="flex justify-center my-4 md:my-6">
          <span className="text-xs text-muted-foreground bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
            {formatDate(msg.sent_at)}
          </span>
        </div>
      )}
      <div className={`flex items-end gap-2 md:gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        {!isOwn && (
          <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0 cursor-pointer transition-transform hover:scale-110" onClick={onViewProfile}>
            <AvatarImage src={getAssetUrl(msg.avatar)} />
            <AvatarFallback className="text-xs">{getInitials(msg)}</AvatarFallback>
          </Avatar>
        )}
        <div className="max-w-[75%] md:max-w-[65%] message-bubble">
          <div className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-lg ${isOwn ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md shadow-purple-500/20' : 'bg-white/10 backdrop-blur-sm border border-white/10 rounded-bl-md'}`}>
            <p className="text-sm leading-relaxed break-words">{msg.message}</p>
          </div>
          <p className={`text-[10px] text-muted-foreground mt-1 md:mt-1.5 px-1 ${isOwn ? 'text-right' : ''}`}>
            {formatTime(msg.sent_at)}
          </p>
        </div>
        {isOwn && (
          <Avatar className="h-7 w-7 md:h-8 md:w-8 shrink-0">
            <AvatarImage src={getAssetUrl(currentUser.avatar)} />
            <AvatarFallback className="text-xs">{getInitials(currentUser)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}

function EmptyList() {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center">
        <ChatIcon className="h-8 w-8 text-purple-400" />
      </div>
      <p className="text-muted-foreground text-sm">No conversations yet</p>
      <p className="text-muted-foreground/60 text-xs mt-1">Search for users to start chatting!</p>
    </div>
  );
}

function EmptyChat({ onOpenSidebar }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="mx-auto mb-6 h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 flex items-center justify-center shadow-lg shadow-purple-500/10 animate-float">
          <ChatIcon className="h-10 w-10 md:h-12 md:w-12 text-purple-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-gradient">Select a conversation</h2>
        <p className="text-muted-foreground max-w-sm text-sm md:text-base">
          Choose from your existing conversations or search for friends to start a new one
        </p>
        <Button variant="outline" className="mt-6 md:hidden" onClick={onOpenSidebar}>
          <MenuIcon className="h-4 w-4 mr-2" />
          Open Conversations
        </Button>
      </div>
    </div>
  );
}

DirectChats.propTypes = {
  token: PropTypes.string.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  onProfileUpdate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};
