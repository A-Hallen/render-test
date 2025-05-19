import React from 'react';
import { ChatInterface } from '../components/ai/ChatInterface';

export const AIChat: React.FC = () => {
  return (
    <div className="h-[calc(100vh-120px)]">
      <ChatInterface />
    </div>
  );
};