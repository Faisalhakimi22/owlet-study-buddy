import React from 'react';
import ChatLayout from './components/ChatLayout';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white">
      <ChatLayout />
    </div>
  );
};

export default App;

