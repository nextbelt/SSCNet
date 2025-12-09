import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Send, Paperclip, Phone, Video, MoreVertical,
  Building2, Bell, User, ChevronDown, Settings, LogOut, CheckCheck, Check,
  Clock, Archive, Star, Trash2, Image, FileText, X
} from 'lucide-react';
import { useRouter } from 'next/router';
import { dashboardTheme } from '@/styles/dashboardTheme';

// Types
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderCompany: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
}

interface Conversation {
  id: string;
  companyName: string;
  contactName: string;
  contactAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  rfqTitle?: string;
}

const MessagesPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  // Load conversations from API
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages/conversations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setConversations(data || []);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;
      try {
        const response = await fetch(`/api/messages/conversations/${selectedConversation}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(prev => ({ ...prev, [selectedConversation]: data || [] }));
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      conversationId: selectedConversation,
      senderId: 'me',
      senderName: 'Me',
      senderCompany: '',
      content: messageInput,
      timestamp: new Date().toISOString(),
      read: true
    };

    // Optimistically update UI
    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMessage]
    }));

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation
        ? { ...conv, lastMessage: messageInput, lastMessageTime: 'Just now' }
        : conv
    ));

    const messageContent = messageInput;
    setMessageInput('');

    // Send to API
    try {
      await fetch(`/api/messages/conversations/${selectedConversation}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: messageContent })
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const selectedConvMessages = selectedConversation ? messages[selectedConversation] || [] : [];
  const selectedConvInfo = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(conv =>
    conv.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.rfqTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className={dashboardTheme.decorativeBackground.container}>
        <div
          className={dashboardTheme.decorativeBackground.dotPattern.className}
          style={dashboardTheme.decorativeBackground.dotPattern.style}
        />
        <div className={dashboardTheme.decorativeBackground.orb1} />
        <div className={dashboardTheme.decorativeBackground.orb2} />
      </div>

      {/* Top Navigation */}
      <nav className={dashboardTheme.navigation.container}>
        <div className={dashboardTheme.navigation.innerContainer}>
          <div className={dashboardTheme.navigation.flexContainer}>
            {/* Logo */}
            <div className={dashboardTheme.navigation.logoSection}>
              <a href="/" className={dashboardTheme.navigation.logoButton}>
                <div className={dashboardTheme.navigation.logoBox}>
                  <span className={dashboardTheme.navigation.logoText}>LP</span>
                </div>
                <span className={dashboardTheme.navigation.brandText}>
                  LinkedProcurement
                </span>
              </a>
            </div>

            {/* Center Navigation Menu */}
            <div className={dashboardTheme.navigation.navButtonsContainer}>
              <div className="hidden md:flex gap-2">
                <a
                  href="/dashboard/supplier"
                  className={dashboardTheme.navigation.navButton}
                >
                  AI-Match RFQs
                </a>
                <a
                  href="/dashboard/supplier"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Responses
                </a>
                <a
                  href="/dashboard/supplier-profile"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Profile
                </a>
                <a
                  href="/dashboard/supplier-analytics"
                  className={dashboardTheme.navigation.navButton}
                >
                  Analytics
                </a>
                <a
                  href="/dashboard/messages"
                  className={dashboardTheme.navigation.navButtonActive}
                >
                  Messages
                </a>
              </div>
            </div>

            {/* Right Side */}
            <div className={dashboardTheme.navigation.rightSection}>
              <button className={dashboardTheme.navigation.bellButton}>
                <Bell size={20} />
                <span className={dashboardTheme.navigation.bellDot}></span>
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={dashboardTheme.navigation.accountButton}
                >
                  <User size={20} />
                  <span className="hidden md:inline font-medium">Account</span>
                  <ChevronDown size={16} />
                </button>

                {showAccountMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAccountMenu(false)}
                    />
                    <div className={dashboardTheme.navigation.accountMenu}>
                      <button
                        onClick={() => router.push('/dashboard/settings')}
                        className={dashboardTheme.navigation.accountMenuItem}
                      >
                        <Settings size={18} />
                        <span>Account Settings</span>
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/company-settings')}
                        className={dashboardTheme.navigation.accountMenuItem}
                      >
                        <Building2 size={18} />
                        <span>Company Settings</span>
                      </button>
                      <div className={dashboardTheme.navigation.accountMenuSeparator}></div>
                      <button
                        onClick={handleLogout}
                        className={dashboardTheme.navigation.accountMenuItemLogout}
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 h-screen flex relative z-10">
        {/* Conversations List */}
        <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-secondary-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-secondary-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={dashboardTheme.forms.input + " pl-10 py-2"}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 border-b border-secondary-100 hover:bg-secondary-50 transition-all text-left group ${selectedConversation === conv.id ? 'bg-primary-50/50 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    {conv.contactAvatar ? (
                      <img
                        src={conv.contactAvatar}
                        alt={conv.contactName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    {conv.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${selectedConversation === conv.id ? 'text-primary-900' : 'text-secondary-900'}`}>
                        {conv.companyName}
                      </h3>
                      <span className="text-xs text-secondary-500 font-medium">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-secondary-600 mb-1 font-medium">{conv.contactName}</p>
                    {conv.rfqTitle && (
                      <p className="text-xs text-primary-600 mb-1 font-medium truncate bg-primary-50 inline-block px-2 py-0.5 rounded-full">
                        RFQ: {conv.rfqTitle}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-secondary-500 truncate">{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary-500/30">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {filteredConversations.length === 0 && (
              <div className="p-8 text-center text-secondary-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                <p className="font-medium">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-sm">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white/80 border-b border-secondary-200 p-4 backdrop-blur-md shadow-sm z-20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {selectedConvInfo?.contactAvatar ? (
                        <img
                          src={selectedConvInfo.contactAvatar}
                          alt={selectedConvInfo.contactName}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      {selectedConvInfo?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-secondary-900 text-lg">{selectedConvInfo?.companyName}</h2>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-secondary-600 font-medium">{selectedConvInfo?.contactName}</p>
                        {selectedConvInfo?.rfqTitle && (
                          <>
                            <span className="text-secondary-300">•</span>
                            <p className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">
                              RFQ: {selectedConvInfo.rfqTitle}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-secondary-50/50">
                {selectedConvMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.senderId === 'me' ? 'order-2' : ''}`}>
                      {message.senderId !== 'me' && (
                        <p className="text-xs text-secondary-500 mb-1 ml-1 font-medium">{message.senderName}</p>
                      )}
                      <div
                        className={`rounded-2xl p-4 shadow-sm ${message.senderId === 'me'
                            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-none'
                            : 'bg-white text-secondary-900 border border-secondary-100 rounded-tl-none'
                          }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${message.senderId === 'me'
                                    ? 'bg-white/10 border-white/20 hover:bg-white/20'
                                    : 'bg-secondary-50 border-secondary-200 hover:bg-secondary-100'
                                  }`}
                              >
                                <div className={`p-2 rounded-lg ${message.senderId === 'me' ? 'bg-white/20' : 'bg-white shadow-sm'
                                  }`}>
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{attachment.name}</p>
                                  <p className="text-xs opacity-80 mt-0.5">{attachment.size}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 mt-1.5 ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <p className="text-xs text-secondary-400 font-medium">{formatTime(message.timestamp)}</p>
                        {message.senderId === 'me' && (
                          <span className={message.read ? "text-primary-600" : "text-secondary-300"}>
                            {message.read ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-secondary-200 p-4 z-20">
                <div className="flex items-end gap-3 max-w-4xl mx-auto">
                  <div className="relative">
                    <button
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className="p-3 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    {showAttachmentMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowAttachmentMenu(false)}
                        />
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-secondary-100 py-2 z-50 w-48 animate-in fade-in slide-in-from-bottom-2">
                          <button className="w-full px-4 py-3 text-left text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 flex items-center gap-3 transition-all font-medium">
                            <FileText size={18} />
                            <span>Document</span>
                          </button>
                          <button className="w-full px-4 py-3 text-left text-secondary-600 hover:bg-secondary-50 hover:text-primary-600 flex items-center gap-3 transition-all font-medium">
                            <Image size={18} />
                            <span>Image</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900 placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none shadow-inner"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-primary-600 text-white p-3 rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-secondary-400 mt-2 text-center font-medium">Press Enter to send, Shift+Enter for new line</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8 bg-secondary-50/30">
              <div className="max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/10 rotate-3">
                  <MessageSquare className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900 mb-3">Select a conversation</h2>
                <p className="text-secondary-500 text-lg">Choose a conversation from the list to start messaging with buyers or suppliers.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
