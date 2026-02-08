import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

function Spam({ token, onSpamChatSelected, onUnspam }) {
  const [spamChats, setSpamChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    fetchSpamChats();
  }, [token]);

  const fetchSpamChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/spam-chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpamChats(response.data);
    } catch (err) {
      console.error('Error fetching spam chats: ', err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatRoomId) => {
    setMessagesLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/user-messages/${chatRoomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages: ', err.response ? err.response.data : err.message);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleViewChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat.chat_room_id);
  };

  const handleUnspam = async (userId) => {
    try {
      await axios.post('http://localhost:3000/unspam',
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from local state
      setSpamChats(prevChats => prevChats.filter(chat => chat.id !== userId));
      setSelectedChat(null);
      setMessages([]);
      // Notify parent to refresh users list
      if (onUnspam) {
        onUnspam(userId);
      }
    } catch (err) {
      console.error('Error removing user from spam: ', err.response ? err.response.data : err.message);
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

  // If viewing a specific chat's messages
  if (selectedChat) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedChat(null);
              setMessages([]);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Chat with {selectedChat.username}
          </span>
        </div>

        {/* Chat history */}
        <div className="bg-white/5 rounded-lg border border-white/10 max-h-64 overflow-hidden">
          <ScrollArea className="h-64 p-3">
            {messagesLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No messages in this chat</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => {
                  const showDate = index === 0 || formatDate(messages[index - 1].sent_at) !== formatDate(msg.sent_at);
                  return (
                    <div key={`${msg.user_id}-${msg.sent_at}-${index}`}>
                      {showDate && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                            {formatDate(msg.sent_at)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={msg.avatar ? `http://localhost:3000${msg.avatar}` : undefined} />
                          <AvatarFallback className="text-[10px]">{msg.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-medium">{msg.username}</span>
                            <span className="text-[10px] text-muted-foreground">{convertToLocaleTime(msg.sent_at)}</span>
                          </div>
                          <p className="text-sm text-foreground/80 break-words">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUnspam(selectedChat.id)}
            className="flex-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Remove from Spam
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Spam Folder
      </h3>
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
      ) : spamChats.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No spam chats</p>
      ) : (
        spamChats.map(chat => (
          <div
            key={chat.chat_room_id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={chat.avatar ? `http://localhost:3000${chat.avatar}` : undefined} />
              <AvatarFallback className="text-xs">{chat.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-medium truncate">{chat.username}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewChat(chat)}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

Spam.propTypes = {
  token: PropTypes.string.isRequired,
  onSpamChatSelected: PropTypes.func,
  onUnspam: PropTypes.func,
};

export default Spam;
