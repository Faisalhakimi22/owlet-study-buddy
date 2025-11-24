import React, { useState, useRef } from 'react';
import { Message } from '../types';
import { Volume2, Loader2, StopCircle, Copy, Check, Edit2 } from 'lucide-react';
import { generateSpeech } from '../services/api';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isError = message.error;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = async () => {
    console.log('🔊 Play audio clicked');
    setTtsError(null); // Clear previous errors
    if (isPlaying) {
      console.log('⏸️ Stopping audio');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      console.log('🔄 Fetching audio blob...');
      const audioBlob = await generateSpeech(message.text);
      console.log('✅ Audio blob fetched, creating URL');
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('🔗 Audio URL created:', audioUrl);

      if (audioRef.current) {
        console.log('▶️ Playing existing audio element');
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(e => {
          console.error('❌ Play failed:', e);
          setTtsError('Failed to play audio.');
        });
        setIsPlaying(true);

        audioRef.current.onended = () => {
          console.log('⏹️ Audio ended');
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        console.log('🆕 Creating new Audio element');
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play().catch(e => {
          console.error('❌ Play failed:', e);
          setTtsError('Failed to play audio.');
        });
        setIsPlaying(true);

        audio.onended = () => {
          console.log('⏹️ Audio ended');
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    } catch (error: any) {
      console.error('❌ Failed to play audio:', error);
      let errorMessage = 'Failed to generate speech.';
      if (error.message && error.message.includes('terms acceptance')) {
        errorMessage = 'Terms acceptance required. Check console for link.';
      }
      setTtsError(errorMessage);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className={`flex items-start gap-4 mb-6 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar (Bot only) */}
      {!isUser && (
        <img src="/logo.png" alt="AI Assistant" className="flex-shrink-0 w-8 h-8 object-contain mt-1" />
      )}

      {/* Message Content Wrapper */}
      <div className={`flex-1 flex ${isUser ? 'justify-end items-center gap-3' : 'flex-col'}`}>

        {/* User Actions (Left of bubble) */}
        {isUser && (
          <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy text"
            >
              {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <button
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit message"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`inline-block rounded-3xl ${isUser
            ? 'bg-[#195d82] text-white px-5 py-3 max-w-[85%]'
            : isError
              ? 'bg-red-50 text-red-900 border border-red-200 px-4 py-2.5 max-w-[85%] rounded-2xl'
              : 'text-gray-900 w-full rounded-2xl'
            }`}
        >
          <div className="text-[15px] leading-relaxed break-words">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

          {/* Bot Actions */}
          {!isUser && !isError && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handlePlayAudio}
                disabled={isLoadingAudio}
                className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${ttsError ? 'text-red-500' : 'text-gray-500'}`}
                title={isPlaying ? "Stop reading" : "Read aloud"}
              >
                {isLoadingAudio ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isPlaying ? (
                  <StopCircle size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                title="Copy text"
              >
                {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>

              {ttsError && (
                <span className="text-xs text-red-500 ml-2">
                  {ttsError}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
