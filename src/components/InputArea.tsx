import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, PenLine, Code, GraduationCap, ChevronDown, Sparkles, Zap, Mic, Square } from 'lucide-react';
import { transcribeAudio } from '../services/api';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  messages?: any[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  messages = [],
  selectedModel,
  onModelChange,
}) => {
  const [input, setInput] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // On mobile, Enter should add a new line. On desktop, it submits.
    const isMobile = window.innerWidth < 768;

    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(audioFile);
          setInput((prev) => (prev ? `${prev} ${text}` : text));
        } catch (error) {
          console.error('Failed to transcribe audio', error);
          // Optionally handle error UI here
        } finally {
          setIsTranscribing(false);
        }

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isInitialState = !messages || messages.length === 0 || (messages.length === 1 && messages[0].id === 1 && messages[0].sender === 'bot');

  const suggestions = [
    { icon: PenLine, label: 'Write', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: Code, label: 'Build', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: GraduationCap, label: 'Learn', color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const models = [
    { id: 'phi', name: 'Phi (Local)', icon: Zap, description: 'Fast, local model' },
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 (Groq)', icon: Sparkles, description: 'Powerful, versatile model' },
  ];

  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <div className={`flex-shrink-0 bg-white transition-all duration-300 ${isInitialState ? 'pb-8 md:mb-[30vh]' : 'pb-8'}`}>
      <div className={`mx-auto px-4 transition-all duration-300 ${isInitialState ? 'max-w-3xl' : 'max-w-4xl'}`}>
        <form onSubmit={handleSubmit}>
          <div className={`relative bg-gray-50 rounded-3xl border border-gray-200 focus-within:border-[#195d82] focus-within:shadow-lg transition-all ${isInitialState ? 'shadow-lg' : 'shadow-md'} ${isRecording ? 'border-red-400 ring-2 ring-red-100' : ''}`}>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening..." : isTranscribing ? "Transcribing..." : "Ask Owlet..."}
              disabled={isLoading || disabled || isTranscribing}
              rows={1}
              className={`w-full resize-none bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-[200px] overflow-y-auto no-scrollbar text-[15px] leading-relaxed transition-all duration-300 min-h-[72px] ${isInitialState ? 'px-6 py-6 md:px-8 md:py-8 pr-16 md:pr-60 text-base' : 'px-4 py-5 md:px-6 md:py-6 pr-16 md:pr-56'}`}
            />
            <div className="absolute bottom-2 right-2 md:bottom-3 md:right-4 flex items-center gap-2 md:gap-3">
              {/* Model Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium text-gray-700"
                >
                  <currentModel.icon size={14} className={selectedModel === 'phi' ? 'text-orange-500' : 'text-blue-500'} />
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
                </button>

                {showModelSelector && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 md:w-56 max-w-[90vw] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="p-1">
                      {models.map((model) => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            onModelChange(model.id);
                            setShowModelSelector(false);
                          }}
                          className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${selectedModel === model.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                            }`}
                        >
                          <div className={`mt-0.5 p-1.5 rounded-md ${model.id === 'phi' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            <model.icon size={14} />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${selectedModel === model.id ? 'text-gray-900' : 'text-gray-700'}`}>
                              {model.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {model.description}
                            </div>
                          </div>
                          {selectedModel === model.id && (
                            <div className="ml-auto mt-1 w-1.5 h-1.5 rounded-full bg-[#195d82]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isLoading || disabled || isTranscribing}
                className={`text-gray-500 hover:text-gray-700 transition-all ${isRecording ? 'text-red-500 hover:text-red-600 animate-pulse' : ''}`}
                aria-label={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? (
                  <Square size={20} fill="currentColor" />
                ) : isTranscribing ? (
                  <Loader2 size={20} className="animate-spin text-[#195d82]" />
                ) : (
                  <Mic size={20} />
                )}
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isLoading || disabled || isRecording || isTranscribing}
                className="p-2 rounded-full bg-[#195d82] text-white hover:bg-[#144a6a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] disabled:hover:bg-[#195d82]"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </form>

        {!isInitialState && (
          <p className="text-xs text-center text-gray-400 mt-3 animate-in fade-in duration-700">
            Even wise birds can slip up. Owlet may make mistakes, so verify your facts.
          </p>
        )}

        {isInitialState && (
          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {suggestions.map((item, index) => (
              <button
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${item.bg} hover:opacity-80 transition-opacity`}
                onClick={() => onSendMessage(item.label)}
              >
                <item.icon size={16} className={item.color} />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputArea;
