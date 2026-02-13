import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { spamApi, chatApi } from '../services/api';
import { getAssetUrl } from '../config/api';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { ArrowLeftIcon, CheckCircleIcon, EyeIcon } from './ui/icons';
import { getInitials, formatTime, formatDate, isDifferentDate } from '../utils/formatters';

const Spam = ({ token, onSpamChatSelected, onUnspam }) => {
  const [spamChats, setSpamChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const fetchSpamChats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await spamApi.getSpamChats(token);
      setSpamChats(data);
    } catch (err) {
      console.error('Error fetching spam chats');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSpamChats();
  }, [fetchSpamChats]);

  const fetchMessages = async (chatRoomId) => {
    setMessagesLoading(true);
    try {
      const data = await chatApi.getMessages(chatRoomId, token);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages');
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
      await spamApi.unspamUser(userId, token);
      setSpamChats((prev) => prev.filter((chat) => chat.id !== userId));
      setSelectedChat(null);
      setMessages([]);
      onUnspam?.(userId);
    } catch (err) {
      console.error('Error removing user from spam');
    }
  };

  const handleBack = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  // Chat detail view
  if (selectedChat) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
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
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading messages...
              </p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No messages in this chat
              </p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg, index) => {
                  const showDate = index === 0 || isDifferentDate(messages[index - 1].sent_at, msg.sent_at);
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
                          <AvatarImage src={getAssetUrl(msg.avatar)} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(msg)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-medium">{msg.username}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatTime(msg.sent_at)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 break-words">
                            {msg.message}
                          </p>
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
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Remove from Spam
          </Button>
        </div>
      </div>
    );
  }

  // Spam list view
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
        spamChats.map((chat) => (
          <div
            key={chat.chat_room_id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={getAssetUrl(chat.avatar)} />
              <AvatarFallback className="text-xs">{getInitials(chat)}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-medium truncate">{chat.username}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewChat(chat)}
              className="text-muted-foreground hover:text-foreground"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

Spam.propTypes = {
  token: PropTypes.string.isRequired,
  onSpamChatSelected: PropTypes.func,
  onUnspam: PropTypes.func,
};

export default Spam;
