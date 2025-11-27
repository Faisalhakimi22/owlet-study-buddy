import React, { useState, useRef, useEffect } from 'react';
import { Edit, Settings, Trash2, PanelLeftClose, PanelLeft, LogOut, Link } from 'lucide-react';
import { ChatSession } from '../types';
import ApiSettingsModal from './ApiSettingsModal';

interface GeminiSidebarProps {
  onNewChat?: () => void;
  onLogout?: () => void;
  chatSessions?: ChatSession[];
  currentChatId?: string | null;
  onLoadChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const GeminiSidebar: React.FC<GeminiSidebarProps> = ({
  onNewChat,
  onLogout,
  chatSessions = [],
  currentChatId,
  onLoadChat,
  onDeleteChat,
  isMobileOpen = false,
  onMobileClose
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <ApiSettingsModal isOpen={showApiSettings} onClose={() => setShowApiSettings(false)} />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed md:relative z-50 h-full bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-12' : 'md:w-72'}
          w-72
        `}
      >
        {/* Top Bar */}
        <div className={`border-b border-gray-200 flex items-center ${(isCollapsed && !isMobileOpen) ? 'p-1 justify-center' : 'p-4 justify-between'}`}>
          {(isCollapsed && !isMobileOpen) ? (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 group relative w-10 h-10 items-center justify-center"
              aria-label="Expand sidebar"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-8 h-8 object-contain absolute transition-opacity duration-200 group-hover:opacity-0"
              />
              <PanelLeft
                size={24}
                className="text-gray-600 absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100"
              />
            </button>
          ) : (
            <>
              {/* Mobile Close Button */}
              <button
                onClick={onMobileClose}
                className="md:hidden p-2 rounded-xl hover:bg-gray-200 text-gray-600"
              >
                <PanelLeftClose size={24} />
              </button>

              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden md:block p-2 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={24} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-2 flex-1 ml-2 overflow-hidden">
                <img src="/logo.png" alt="University Support Logo" className="w-6 h-6 object-contain flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-700 truncate">Owlet</span>
              </div>
            </>
          )}
        </div>

        {/* New Chat Button */}
        <div className={`border-b border-gray-200 ${(isCollapsed && !isMobileOpen) ? 'p-1 flex justify-center' : 'p-4'}`}>
          {(isCollapsed && !isMobileOpen) ? (
            <button
              onClick={onNewChat}
              className="hidden md:flex w-10 h-10 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 items-center justify-center"
              aria-label="New Chat"
            >
              <Edit size={20} className="text-gray-600" />
            </button>
          ) : (
            <button
              onClick={() => {
                onNewChat?.();
                onMobileClose?.();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-left hover:shadow-sm"
            >
              <Edit size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700 text-sm">New chat</span>
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {(!isCollapsed || isMobileOpen) && (
            <>
              {/* Chats Section */}
              <div className="p-3">
                <div className="px-2 py-2 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</span>
                </div>
                {chatSessions.length === 0 ? (
                  <div className="px-2 py-8 text-center opacity-50">
                    <p className="text-xs text-gray-500">No chat history</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {chatSessions.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group relative flex items-center rounded-lg transition-all duration-200 ${currentChatId === chat.id
                          ? 'bg-white shadow-sm border border-gray-100'
                          : 'hover:bg-gray-100'
                          }`}
                        onMouseEnter={() => setHoveredChatId(chat.id)}
                        onMouseLeave={() => setHoveredChatId(null)}
                      >
                        <button
                          onClick={() => {
                            onLoadChat?.(chat.id);
                            onMobileClose?.();
                          }}
                          className="flex-1 text-left px-3 py-2.5 rounded-lg transition-colors overflow-hidden"
                        >
                          <span className={`text-sm block truncate ${currentChatId === chat.id ? 'text-[#195d82] font-medium' : 'text-gray-600'
                            }`}>
                            {chat.title}
                          </span>
                        </button>
                        {hoveredChatId === chat.id && onDeleteChat && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            className="p-1.5 mr-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                            aria-label="Delete chat"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Settings */}
        <div className={`border-t border-gray-200 bg-gray-50/50 ${(isCollapsed && !isMobileOpen) ? 'p-1 flex justify-center' : 'p-4'}`} ref={settingsRef}>
          <div className="relative">
            {showSettingsMenu && (
              <div className={`absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50 ${isCollapsed && !isMobileOpen ? 'w-48 left-12 bottom-0 mb-0' : 'w-full'}`}>
                <button
                  onClick={() => {
                    setShowApiSettings(true);
                    setShowSettingsMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-gray-700 border-b border-gray-100"
                >
                  <Link size={18} />
                  <span className="font-medium text-sm">API Settings</span>
                </button>
                <button
                  onClick={() => {
                    onLogout?.();
                    setShowSettingsMenu(false);
                    onMobileClose?.();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left text-red-600"
                >
                  <LogOut size={18} />
                  <span className="font-medium text-sm">Log out</span>
                </button>
              </div>
            )}

            {(isCollapsed && !isMobileOpen) ? (
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`hidden md:flex w-10 h-10 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 items-center justify-center ${showSettingsMenu ? 'bg-gray-200' : ''}`}
                aria-label="Settings"
              >
                <Settings size={20} className="text-gray-600" />
              </button>
            ) : (
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200 text-left ${showSettingsMenu ? 'bg-gray-200' : ''}`}
              >
                <Settings size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default GeminiSidebar;
