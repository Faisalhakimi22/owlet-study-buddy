import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isInitialState = messages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {isInitialState ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-row items-center gap-0 md:gap-4 mb-8">
            <h1 className="text-lg md:text-3xl font-medium tracking-tight text-[#195d82] whitespace-nowrap">
              I’m all eyes.
            </h1>
            <img src="/logo.png" alt="Owlet Logo" className="w-10 h-10 md:w-20 md:h-20 object-contain opacity-90 mx-1 md:mx-0" />
            <h1 className="text-lg md:text-3xl font-medium tracking-tight text-[#195d82] whitespace-nowrap">
              What are we working on?
            </h1>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-4 py-3 inline-block">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
