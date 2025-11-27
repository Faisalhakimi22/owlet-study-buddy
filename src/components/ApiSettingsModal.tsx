import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw, Link } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [customUrl, setCustomUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem('custom-api-url');
      setCustomUrl(savedUrl || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (customUrl.trim()) {
      localStorage.setItem('custom-api-url', customUrl.trim());
    } else {
      localStorage.removeItem('custom-api-url');
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem('custom-api-url');
    setCustomUrl('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Link size={20} className="text-[#195d82]" />
            API Connection Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">
              Custom API URL
            </label>
            <p className="text-xs text-gray-500">
              Enter your local API URL or ngrok URL (e.g., https://your-app.ngrok-free.app/api/chat).
              Leave empty to use the default local server.
            </p>
            <input
              id="apiUrl"
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#195d82] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-[#195d82] text-white px-4 py-2 rounded-lg hover:bg-[#154d6b] transition-colors font-medium"
            >
              <Save size={18} />
              {isSaved ? 'Saved!' : 'Save Changes'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
              title="Reset to default"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsModal;
