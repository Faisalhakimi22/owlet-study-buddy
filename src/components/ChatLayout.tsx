import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import GeminiSidebar from './GeminiSidebar';
import StarBackground from './StarBackground';
import WelcomeScreen from './WelcomeScreen';
import NameInputScreen from './NameInputScreen';
import PersonalizedWelcome from './PersonalizedWelcome';
import { sendMessageToBot } from '../services/api';
import { Message, ChatSession } from '../types';
import { getChatSessions, saveChatSession, createChatSession, deleteChatSession } from '../utils/chatStorage';

type AppState = 'welcome' | 'name-input' | 'personalized-welcome' | 'chat';

const ChatLayout: React.FC = () => {
  // Initialize state by checking localStorage immediately to prevent flash
  const getInitialState = (): { state: AppState; name: string } => {
    const savedName = localStorage.getItem('user-name');
    if (savedName) {
      return { state: 'chat', name: savedName };
    }
    return { state: 'welcome', name: '' };
  };

  const initialState = getInitialState();
  const [appState, setAppState] = useState<AppState>(initialState.state);
  const [userName, setUserName] = useState<string>(initialState.name);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState<string>('phi');

  // Load chat sessions on mount
  useEffect(() => {
    const sessions = getChatSessions();
    setChatSessions(sessions);
  }, []);

  // Auto-save chat when messages change (but not on initial load)
  useEffect(() => {
    // Only save if there are user messages (more than just the initial greeting)
    const hasUserMessages = messages.some(msg => msg.sender === 'user' && msg.id !== 1);

    if (hasUserMessages && messages.length > 1 && appState === 'chat') {
      const chat = currentChatId
        ? { ...chatSessions.find(c => c.id === currentChatId)!, messages, updatedAt: new Date().toISOString() }
        : createChatSession(messages);

      if (!currentChatId) {
        setCurrentChatId(chat.id);
      }

      saveChatSession(chat);

      // Update local state
      const updatedSessions = getChatSessions();
      setChatSessions(updatedSessions);
    }
  }, [messages, appState]);

  const handleStart = () => {
    setAppState('name-input');
  };

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    localStorage.setItem('user-name', name);
    setAppState('personalized-welcome');
  };

  const handlePersonalizedWelcomeContinue = () => {
    setAppState('chat');
    // Update initial greeting with user's name
    setMessages([]);
  };

  const handleSendMessage = async (text: string) => {
    const newUserMsg: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history
      const conversationHistory = messages
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));

      const maxTokens = selectedModel === 'phi' ? 300 : 2048;
      const apiResponse = await sendMessageToBot(text, maxTokens, 0.7, conversationHistory, selectedModel);

      const newBotMsg: Message = {
        id: Date.now() + 1,
        text: apiResponse.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        model: apiResponse.model,
        processingTime: apiResponse.processingTime,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (err) {
      console.error('Failed to get response', err);

      const errorMsg = err && typeof err === 'object' && 'message' in err
        ? (err.message as string)
        : "I'm having trouble connecting to the server right now. Please check your connection and try again later.";

      const errorMessage: Message = {
        id: Date.now() + 1,
        text: errorMsg,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleLoadChat = (chatId: string) => {
    const chat = chatSessions.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChatSession(chatId);
    const updatedSessions = getChatSessions();
    setChatSessions(updatedSessions);

    // If deleted chat was current, start new chat
    if (chatId === currentChatId) {
      handleNewChat();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user-name');
    setUserName('');
    setMessages([]);
    setCurrentChatId(null);
    setAppState('welcome');
  };

  // Show welcome screens before chat
  if (appState === 'welcome') {
    return (
      <div className="flex h-screen bg-white relative overflow-hidden">
        <StarBackground />
        <WelcomeScreen onStart={handleStart} />
      </div>
    );
  }

  if (appState === 'name-input') {
    return (
      <div className="flex h-screen bg-white relative overflow-hidden">
        <StarBackground />
        <NameInputScreen onSubmit={handleNameSubmit} />
      </div>
    );
  }

  if (appState === 'personalized-welcome') {
    return (
      <div className="flex h-screen bg-white relative overflow-hidden">
        <StarBackground />
        <PersonalizedWelcome name={userName} onContinue={handlePersonalizedWelcomeContinue} />
      </div>
    );
  }

  // Chat interface
  return (
    <div className="flex h-screen bg-white relative overflow-hidden">
      {/* Star Background */}
      <StarBackground />

      {/* Gemini-style Sidebar - Responsive */}
      <GeminiSidebar
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        chatSessions={chatSessions}
        currentChatId={currentChatId}
        onLoadChat={(id) => {
          handleLoadChat(id);
          setIsMobileMenuOpen(false);
        }}
        onDeleteChat={handleDeleteChat}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 w-full">
        {/* Header */}
        <header className="flex-shrink-0 bg-white md:border-none">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 md:hidden text-gray-600"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-medium text-gray-900">Owlet</h1>
              <p className="ml-auto text-xs text-gray-500 hidden sm:block">Built by Faisal hakimi</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <MessageList messages={messages} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex-shrink-0 px-4 py-2 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-600 max-w-3xl mx-auto">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <InputArea
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          messages={messages}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
