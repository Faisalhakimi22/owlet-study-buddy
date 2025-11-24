// Utility functions for storing and retrieving chat sessions

import { ChatSession, Message } from '../types';

const STORAGE_KEY = 'university-support-chats';

export const getChatSessions = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading chat sessions:', error);
  }
  return [];
};

export const saveChatSession = (chat: ChatSession): void => {
  try {
    const chats = getChatSessions();
    const existingIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chat;
    } else {
      chats.unshift(chat); // Add new chat to the beginning
    }
    
    // Keep only last 50 chats
    const limitedChats = chats.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedChats));
  } catch (error) {
    console.error('Error saving chat session:', error);
  }
};

export const deleteChatSession = (chatId: string): void => {
  try {
    const chats = getChatSessions();
    const filtered = chats.filter(c => c.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting chat session:', error);
  }
};

export const generateChatTitle = (messages: Message[]): string => {
  // Get the first user message (skip the initial bot greeting)
  const firstUserMessage = messages.find(msg => msg.sender === 'user' && msg.id !== 1);
  
  if (firstUserMessage) {
    // Use first 50 characters of first user message as title
    const title = firstUserMessage.text.trim();
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  }
  
  return 'New Chat';
};

export const createChatSession = (messages: Message[]): ChatSession => {
  const id = `chat-${Date.now()}`;
  const now = new Date().toISOString();
  
  return {
    id,
    title: generateChatTitle(messages),
    messages,
    createdAt: now,
    updatedAt: now,
  };
};

