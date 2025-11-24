import React from 'react';
import { MessageSquare, Settings, HelpCircle, GraduationCap } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white shadow-2xl border-r-2 border-blue-900">
      <div className="p-6 border-b-2 border-blue-600">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/40">
            <GraduationCap size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">UniBot</h2>
            <p className="text-xs text-blue-100 font-medium">Support Assistant</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-left border border-white/30">
          <MessageSquare size={20} className="text-white" />
          <span className="font-semibold text-white">Chat</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition-colors text-left border border-transparent hover:border-white/30">
          <Settings size={20} className="text-white" />
          <span className="font-semibold text-white">Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition-colors text-left border border-transparent hover:border-white/30">
          <HelpCircle size={20} className="text-white" />
          <span className="font-semibold text-white">Help</span>
        </button>
      </nav>

      <div className="p-4 border-t-2 border-blue-600">
        <p className="text-xs text-blue-100 text-center font-medium">© 2024 UniSupport</p>
        <p className="text-xs text-blue-200 text-center mt-1">Built by Faisal hakimi</p>
      </div>
    </aside>
  );
};

export default Sidebar;

