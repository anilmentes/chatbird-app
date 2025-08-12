
import React, { useEffect, useRef } from 'react';
import { Message, InformationChannelDetails, ServiceTicketDetails } from '../types';
import ChatMessage from './ChatMessage';
import { ChatBirdLogoIcon } from './Icon';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onInfoChannelSubmit: (messageId: string, details: InformationChannelDetails) => void;
  onServiceTicketSubmit: (messageId: string, details: ServiceTicketDetails) => void;
  onInitialOptionClick: (prompt: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onInfoChannelSubmit, onServiceTicketSubmit, onInitialOptionClick }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
      <div className="space-y-6">
        {messages.map((msg) => (
          <ChatMessage 
            key={msg.id} 
            message={msg} 
            onInfoChannelSubmit={onInfoChannelSubmit}
            onServiceTicketSubmit={onServiceTicketSubmit}
            onInitialOptionClick={onInitialOptionClick}
           />
        ))}
        {isLoading && (
           <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
              <ChatBirdLogoIcon className="w-6 h-6" />
            </div>
            <div className="flex items-center space-x-2 pt-3">
                <div className="w-2.5 h-2.5 bg-blue-300 rounded-full animate-pulse"></div>
                <div className="w-2.5 h-2.5 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2.5 h-2.5 bg-blue-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;