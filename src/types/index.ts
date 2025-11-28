// Type definitions for the chatbot

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  error?: boolean;
  model?: string; // Model used for bot responses
  processingTime?: number; // Processing time in seconds
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

