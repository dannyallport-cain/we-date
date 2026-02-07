'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string | null;
  type: string;
  imageUrl: string | null;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    photos: { url: string }[];
  };
}

interface Match {
  id: string;
  user: {
    id: string;
    displayName: string;
    photos: { url: string }[];
  };
}

export default function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = use(params);
  const matchId = resolvedParams.matchId;
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    }

    fetchMatch();
    fetchMessages();

    // Start polling for new messages every 3 seconds
    pollingInterval.current = setInterval(() => {
      fetchMessages(true); // Silent fetch (don't show loading)
    }, 3000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/matches?matchId=${matchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatch(data.match);
      }
    } catch (error) {
      console.error('Failed to fetch match:', error);
    }
  };

  const fetchMessages = async (silent = false) => {
    try {
      const token = localStorage.getItem('token');
      
      // For polling, only get messages after the last message timestamp
      let url = `/api/messages?matchId=${matchId}`;
      if (silent && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        url += `&since=${lastMessage.createdAt}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (silent && data.messages.length > 0) {
          // Append new messages
          setMessages((prev) => [...prev, ...data.messages]);
        } else if (!silent) {
          setMessages(data.messages);
        }
      }
      
      if (!silent) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          content: newMessage,
          type: 'TEXT',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-pink-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  const otherUser = match?.user;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center active:scale-90 transition-all"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        
        {otherUser && (
          <>
            {otherUser.photos[0] && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={otherUser.photos[0].url}
                  alt={otherUser.displayName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="font-semibold">{otherUser.displayName}</h1>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Say hi to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.imageUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                      <Image
                        src={message.imageUrl}
                        alt="Shared image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  {message.content && (
                    <p className="break-words">{message.content}</p>
                  )}
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(message.createdAt), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-gray-200 p-4 flex items-center gap-3 bg-white"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
