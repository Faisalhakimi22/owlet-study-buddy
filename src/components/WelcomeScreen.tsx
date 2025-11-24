import React from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8 flex flex-col items-center">
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-light max-w-xl mx-auto">
            Your Intelligent University Support Companion
          </p>
        </div>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#195d82] text-white rounded-lg hover:bg-[#144a6a] transition-all font-medium text-sm shadow-md hover:shadow-lg active:scale-95"
        >
          Let's Start
          <ArrowRight size={16} />
        </button>
        <p className="text-xs text-gray-400 mt-6 font-medium">
          Built by Faisal hakimi
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;

