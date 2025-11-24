import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface NameInputScreenProps {
  onSubmit: (name: string) => void;
}

const NameInputScreen: React.FC<NameInputScreenProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md w-full">
        <div className="mb-6 flex flex-col items-center">
          <img src="/logo.png" alt="University Support Logo" className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] mb-4 object-contain" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight text-center">
            What's your name?
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-6 font-light">
            We'd like to personalize your experience
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-xl focus:border-[#195d82] focus:outline-none focus:ring-2 focus:ring-[#195d82]/20"
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#195d82] text-white rounded-lg hover:bg-[#144a6a] transition-all font-medium text-sm shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameInputScreen;

