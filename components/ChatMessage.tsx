
import React from 'react';
import { Message, InformationChannelDetails, ServiceTicketDetails } from '../types';
import { UserIcon, ChatBirdLogoIcon, LinkIcon, CalendarIcon, WrenchIcon, EnvelopeIcon } from './Icon';
import InformationChannelForm from './InformationChannelForm';
import ServiceTicketForm from './ServiceTicketForm';
import HubSpotMeeting from './HubSpotMeeting';


interface ChatMessageProps {
  message: Message;
  onInfoChannelSubmit: (messageId: string, details: InformationChannelDetails) => void;
  onServiceTicketSubmit: (messageId: string, details: ServiceTicketDetails) => void;
  onInitialOptionClick: (prompt: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onInfoChannelSubmit, onServiceTicketSubmit, onInitialOptionClick }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold ${isUser ? 'bg-gray-600 text-white' : 'bg-blue-500 text-white'}`}>
        {isUser ? <UserIcon className="w-6 h-6"/> : <ChatBirdLogoIcon className="w-6 h-6" />}
      </div>
      <div className="flex flex-col gap-2 max-w-xl w-full">
        <div
          className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-600'
          }`}
        >
          {message.text}
           {message.type === 'service-ticket-confirmation' && message.ticketId && (
              <div className="mt-3 pt-2 border-t border-white/20 dark:border-gray-600 text-xs">
                <span className="font-semibold opacity-80">Ticket ID:</span>
                <span className="font-mono ml-2 bg-white/20 dark:bg-gray-800/50 px-1.5 py-0.5 rounded-sm">{message.ticketId}</span>
              </div>
          )}
        </div>
        
        {message.type === 'initial-options' && !message.isSubmitted && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                <button onClick={() => onInitialOptionClick("I'd like to schedule a demo")} className="flex items-center p-3 bg-white dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/70 hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <CalendarIcon className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500"/>
                    <span className="text-left">Schedule a Demo</span>
                </button>
                <button onClick={() => onInitialOptionClick("I need to report an issue")} className="flex items-center p-3 bg-white dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/70 hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <WrenchIcon className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500"/>
                    <span className="text-left">Report an Issue</span>
                </button>
                <button onClick={() => onInitialOptionClick("I want to subscribe to updates")} className="flex items-center p-3 bg-white dark:bg-gray-700/70 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/70 hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <EnvelopeIcon className="w-5 h-5 mr-3 flex-shrink-0 text-blue-500"/>
                    <span className="text-left">Subscribe to Updates</span>
                </button>
            </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 pb-2 pl-1">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wide mb-2">Sources</h4>
            <ul className="space-y-2">
              {message.sources.map((source, index) => (
                <li key={index}>
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm group">
                    <LinkIcon className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
                    <span className="truncate" title={source.title}>{source.title || source.uri}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message.type === 'appointment-form' && !message.isSubmitted && (
            <div className="mt-2">
                <HubSpotMeeting />
            </div>
        )}

        {message.type === 'info-channel-form' && (
             <div className={`transition-opacity duration-500 ${message.isSubmitted ? 'opacity-60' : 'opacity-100'}`}>
                <InformationChannelForm
                    messageId={message.id}
                    onSubmit={onInfoChannelSubmit}
                    isSubmitted={!!message.isSubmitted}
                />
            </div>
        )}
        
        {message.type === 'service-ticket-form' && (
            <div className={`transition-opacity duration-500 ${message.isSubmitted ? 'opacity-60' : 'opacity-100'}`}>
                <ServiceTicketForm
                    messageId={message.id}
                    onSubmit={onServiceTicketSubmit}
                    isSubmitted={!!message.isSubmitted}
                />
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;