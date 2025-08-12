
import React, { useState, useEffect, useRef } from 'react';
import { Message, InformationChannelDetails, ServiceTicketDetails } from './types';
import { sendMessageToGemini } from './services/geminiService';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial greeting message from the bot with quick action buttons
    setMessages([
      {
        id: 'init-bot-message',
        text: "Hello! I'm ChatBird, your assistant for BirdVision. How can I help you today?",
        sender: 'bot',
        type: 'initial-options'
      },
    ]);
  }, []);
  
  const addErrorMessage = (text: string) => {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        text,
        sender: 'bot',
        type: 'text'
      }]);
  };

  const handleInitialOptionClick = (prompt: string) => {
    // Hide the options after one is clicked by marking the message as 'submitted'
    setMessages(prev => prev.map(msg =>
      msg.id === 'init-bot-message' ? { ...msg, isSubmitted: true } : msg
    ));
    // Then, send the corresponding message to the bot
    handleSendMessage(prompt);
  };

  const handleSendMessage = async (inputText: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      type: 'text',
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const { text, requestType, sources } = await sendMessageToGemini(inputText, messages);

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: text,
        sender: 'bot',
        sources: sources,
      };

      switch (requestType) {
        case 'appointment':
          botMessage.type = 'appointment-form';
          break;
        case 'info-channel':
          botMessage.type = 'info-channel-form';
          break;
        case 'service-ticket':
            botMessage.type = 'service-ticket-form';
            break;
        default:
          botMessage.type = 'text';
      }
      setMessages(prev => [...prev, botMessage]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      addErrorMessage(`Sorry, something went wrong. ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoChannelSubmit = (messageId: string, details: InformationChannelDetails) => {
    // This is a mock submission as we don't have a backend for it yet.
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, isSubmitted: true } : msg
      )
    );
    const confirmationMessage: Message = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      type: 'info-channel-confirmation',
      text: `Thank you, ${details.name}! You have been subscribed to the "${details.channel}" channel. We'll send updates to ${details.email}.`,
    };
    setMessages(prev => [...prev, confirmationMessage]);
    console.log("Info Channel Subscription:", details);
  };
  
  const handleServiceTicketSubmit = async (messageId: string, details: ServiceTicketDetails) => {
      setMessages(prev => prev.map(msg => (msg.id === messageId ? { ...msg, isSubmitted: true } : msg)));

      try {
          const response = await fetch('/api/create-ticket', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(details)
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Failed to submit service ticket.');
          }

          const { ticketId } = await response.json();

          const confirmationMessage: Message = {
              id: `bot-${Date.now()}`,
              sender: 'bot',
              type: 'service-ticket-confirmation',
              text: `Thank you, ${details.firstName}. Your service ticket has been created. We will get back to you at ${details.email} shortly.`,
              ticketId: ticketId,
          };
          setMessages(prev => [...prev, confirmationMessage]);

      } catch (e) {
          console.error(e);
          const errorMessage = e instanceof Error ? e.message : "An unknown error occurred while creating the ticket.";
          addErrorMessage(`There was a problem submitting your ticket. ${errorMessage}`);
      }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-gray-100 dark:bg-gray-900">
      <Header />
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onInfoChannelSubmit={handleInfoChannelSubmit}
        onServiceTicketSubmit={handleServiceTicketSubmit}
        onInitialOptionClick={handleInitialOptionClick}
      />
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;