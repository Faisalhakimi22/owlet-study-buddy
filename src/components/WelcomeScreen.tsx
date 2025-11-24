import React from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="University Support Logo" className="w-[120px] h-[120px] md:w-[160px] md:h-[160px] mb-8 object-contain" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight tracking-tight text-center">
            Welcome to Student<br />
            <span className="bg-gradient-to-r from-[#195d82] to-[#2a7ca3] bg-clip-text text-transparent">
              Support Chatbot
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-light max-w-xl mx-auto">
            Your AI-powered assistant for all your university questions and support needs
          </p>
        </div>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#195d82] text-white rounded-lg hover:bg-[#144a6a] transition-all font-medium text-sm shadow-md hover:shadow-lg active:scale-95"
        >
          Let's Start
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;

