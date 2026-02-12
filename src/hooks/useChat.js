/**
 * Custom hook for managing chat functionality
 * Handles socket connection, messages, and chat room operations
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { chatApi } from '../services/api';

export const useChat = (token, currentUserId) => {
    const [messages, setMessages] = useState([]);
    const [chatRoomId, setChatRoomId] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        if (!token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to chat server');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from chat server');
            setIsConnected(false);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [token]);

    // Handle incoming messages
    useEffect(() => {
        if (!socketRef.current || !chatRoomId) return;

        const handleMessage = (msg) => {
            if (msg.chat_room_id === chatRoomId) {
                setMessages((prev) => [...prev, msg]);
                markAsRead(chatRoomId);
            } else {
                refreshUnreadCounts();
            }
        };

        socketRef.current.on('New_message', handleMessage);

        return () => {
            socketRef.current.off('New_message', handleMessage);
        };
    }, [chatRoomId]);

    // Fetch unread message counts
    const refreshUnreadCounts = useCallback(async () => {
        try {
            const counts = await chatApi.getUnreadCounts(token);
            setUnreadCounts(counts);
        } catch (error) {
            console.error('Failed to fetch unread counts');
        }
    }, [token]);

    // Join a chat room
    const joinRoom = useCallback((roomId) => {
        if (socketRef.current && roomId) {
            socketRef.current.emit('joinRoom', roomId);
        }
    }, []);

    // Start or open a chat with a user
    const startChat = useCallback(async (userId) => {
        try {
            const data = await chatApi.createChatRoom(userId, token);
            const roomId = data.chat_room_id;

            setChatRoomId(roomId);
            joinRoom(roomId);

            const chatMessages = await chatApi.getMessages(roomId, token);
            setMessages(chatMessages);

            await chatApi.markMessagesAsRead(roomId, currentUserId, token);
            await refreshUnreadCounts();

            return roomId;
        } catch (error) {
            console.error('Failed to start chat');
            throw error;
        }
    }, [token, currentUserId, joinRoom, refreshUnreadCounts]);

    // Send a message
    const sendMessage = useCallback((messageText, username, avatar) => {
        if (!messageText.trim() || !chatRoomId || !socketRef.current) return false;

        const msg = {
            chat_room_id: chatRoomId,
            user_id: currentUserId,
            username,
            message: messageText,
            sent_at: new Date().toISOString(),
            avatar,
        };

        socketRef.current.emit('chatMessage', msg);
        return true;
    }, [chatRoomId, currentUserId]);

    // Mark messages as read
    const markAsRead = useCallback(async (roomId) => {
        try {
            await chatApi.markMessagesAsRead(roomId, currentUserId, token);
            await refreshUnreadCounts();
        } catch (error) {
            console.error('Failed to mark messages as read');
        }
    }, [token, currentUserId, refreshUnreadCounts]);

    // Load messages for a room
    const loadMessages = useCallback(async (roomId) => {
        try {
            const chatMessages = await chatApi.getMessages(roomId, token);
            setMessages(chatMessages);
            setChatRoomId(roomId);
            joinRoom(roomId);
        } catch (error) {
            console.error('Failed to load messages');
        }
    }, [token, joinRoom]);

    return {
        messages,
        chatRoomId,
        unreadCounts,
        isConnected,
        startChat,
        sendMessage,
        markAsRead,
        loadMessages,
        refreshUnreadCounts,
        setChatRoomId,
    };
};

export default useChat;
